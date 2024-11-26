const dns = require("node:dns/promises");
const https = require("node:https");
const acme = require("acme-client");

what = dns.setServers(["127.0.0.1"]);

const HTTPS_SERVER_PORT = 443;
const DOMAIN = "example.com";

function log(m) {
  process.stdout.write(`${new Date().toISOString()} ${m}\n`);
}

(async () => {
  try {
    acme.setLogger((message) => {
      console.log(message);
    });

    log("Initializing ACME client");
    const client = new acme.Client({
      directoryUrl: "https://localhost:9000/acme/acme/directory",
      accountKey: await acme.crypto.createPrivateKey(),
    });

    log(`Creating CSR for ${DOMAIN}`);
    const [key, csr] = await acme.crypto.createCsr({
      altNames: [DOMAIN],
    });

    log(`Ordering certificate for ${DOMAIN}`);

    const cert = await client.auto({
      csr,
      email: "test@example.com",
      termsOfServiceAgreed: true,
      challengePriority: ["dns-01"],
      challengeCreateFn: (authz, challenge, keyAuthorization) => {
        log(`--->ADD the following TXT record:`);
        log(
          `_acme-challenge.${authz.identifier.value}. IN TXT "${keyAuthorization}"`
        );
      },
      challengeRemoveFn: (authz, challenge, keyAuthorization) => {
        log(`--->REMOVE the following TXT record:`);
        log(
          `_acme-challenge.${authz.identifier.value}. IN TXT "${keyAuthorization}"`
        );
      },
    });

    log(`Certificate for ${DOMAIN} created successfully`);

    const requestListener = (req, res) => {
      log(`HTTP 200 ${req.headers.host}${req.url}`);
      res.writeHead(200);
      res.end("Hello world\n");
    };

    const httpsServer = https.createServer(
      {
        key,
        cert,
      },
      requestListener
    );

    httpsServer.listen(HTTPS_SERVER_PORT, () => {
      log(`HTTPS server listening on port ${HTTPS_SERVER_PORT}`);
    });
  } catch (e) {
    log(`[FATAL] ${e.message}`);
    process.exit(1);
  }
})();
