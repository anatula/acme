# ACME

- **"ACME: Certificate management has never been easier"** by Farah Juma (DevConf.CZ 2021)

  [![ACME: Certificate management has never been easier](https://img.youtube.com/vi/rIwszDULXvc/default.jpg)](https://youtu.be/rIwszDULXvc)

- **"Let's Encrypt! How the ACME protocol works and provides free HTTPS to the world"** by Daniel Roesler (EFF-Austin Meetup)

  [![Let's Encrypt! How the ACME protocol works and provides free HTTPS to the world](https://img.youtube.com/vi/k73MNzoel7Q/default.jpg)](https://youtu.be/k73MNzoel7Q)

> ⚠️ This project is just to see the underlying aspects of ACME protocol **definitely for not for production**.

### ACME protocol overview:

![](https://smallstep.imgix.net/acme_how_it_works_88d170c87a.png?auto=format%2Ccompress&fit=max&q=50)

## [gethttpscertsforfree](https://gethttpsforfree.com/)

Using Let's Encrypt as CA, will take you through the manual steps to get your free https certificate. The website works by generating commands for you to run in your terminal, then making requests to the Let's Encrypt ACME API to issue your certificate. The website is open source and NEVER asks for your private key.

Check the [docs](https://github.com/diafygi/gethttpsforfree). Each step.

1. Account Info: register a public key and contact information so you can sign all the requests you make to the API.
2. CSR: specify the domains you want certificates for. That's done through a certificate signing request (CSR)
3. Sign API Requests: ell the Let's Encrypt API that you want to register and create an order for a certificate (the CSR)
4. Verify Ownership: challenges needed prove you own the domain
5. Install Certificate: The response from finalizing should be your new certificate

`git clone https://github.com/diafygi/gethttpsforfree.git`

Use this docker-compose to (network host mode) and inside `index.html` use the LetsEncrypt Staging:

var DIRECTORY_URL = "https://acme-staging-v02.api.letsencrypt.org/directory";

```
services:
  gethttpsforfree:
    image: nginx:alpine
    network_mode: host
    ports:
      - 80:80
    volumes:
      - ./:/usr/share/nginx/html
```

## Using step-ca and node-acme

`acme-client` has a folder with the 3 types of challenges [node-acme-client examples](https://github.com/publishlab/node-acme-client/tree/master/examples).

To test how the protocol works, we need:

- [step-ca](https://smallstep.com/docs/step-ca/): is an online Certificate Authority (CA) for secure, automated X.509 and SSH certificate management with ACME support so you can easily run your own ACME server.
- [node-acme client](https://github.com/publishlab/node-acme-client): A simple and unopinionated ACME client.

Notes

- I've run this in macOS
- Docker desktop 4.34.3 support host [release notes](https://docs.docker.com/desktop/release-notes/#4340)

We'll do everything locally.

Put `example.com 127.0.0.1` in the `/etc/hosts`.

We'll cover 3 challenges: `http-01`, `dns-01`, `tls-alpn-01`.

Add your host's address in the `extra_hosts` and `dns` of the `docker-compose`.

### HTTP-01

`docker compose up step`

`npm run http`

`https example.com --verify=./step/certs/root_ca.crt`

### DNS-01

`docker compose up step coredns`

`npm run dns`

Change the zone file `db.example.com`:,

In the logs:
`2024-11-26T10:19:33.043Z ---> ADD TXT record key=_acme-challenge.example.com value=CI3-HvygY981-3m2LQE9cK0JVWoMYoQhZ5ye6_g6KmY`

Put this this TXT:
`_acme-challenge.example.com. 0 IN TXT "CI3-HvygY981-3m2LQE9cK0JVWoMYoQhZ5ye6_g6KmY"`

And then manually update the serial in the SOA record and save the file, you should see:

`coredns  | [INFO] plugin/file: Successfully reloaded zone "example.com." in "/zones/db.example.com" with 2024112601 SOA serial`

In the log of `dns-01.js` the client will try a few times until it finds the TXT record, you should see:

```
Found 1 TXT records at _acme-challenge.example.com
DNS query finished successfully, found 1 TXT records
Key authorization match for dns-01/_acme-challenge.example.com, ACME challenge verified
[auto] [example.com] Completing challenge with ACME provider and waiting for valid status
HTTP request: head https://localhost:9000/acme/acme/new-nonce
RESP 200 head https://localhost:9000/acme/acme/new-nonce
Using nonce: a0RLcGxnYVl4bkZmOUZ3RXcwUTBpaVBoem1rbldsME4
HTTP request: post https://localhost:9000/acme/acme/challenge/SHUm2kayEG2wXG0dkMbudfhKqTrBV7gR/XACr3KoiCAnN598x8qU1h0WM3zHcDGPF
RESP 200 post https://localhost:9000/acme/acme/challenge/SHUm2kayEG2wXG0dkMbudfhKqTrBV7gR/XACr3KoiCAnN598x8qU1h0WM3zHcDGPF
Waiting for valid status from: https://localhost:9000/acme/acme/challenge/SHUm2kayEG2wXG0dkMbudfhKqTrBV7gR/XACr3KoiCAnN598x8qU1h0WM3zHcDGPF
HTTP request: head https://localhost:9000/acme/acme/new-nonce
RESP 200 head https://localhost:9000/acme/acme/new-nonce
Using nonce: QUJqYnN0VVllY29yNnpLeVlUc2FGRXpWazdEQ3A1Z1Q
HTTP request: post https://localhost:9000/acme/acme/challenge/SHUm2kayEG2wXG0dkMbudfhKqTrBV7gR/XACr3KoiCAnN598x8qU1h0WM3zHcDGPF
RESP 200 post https://localhost:9000/acme/acme/challenge/SHUm2kayEG2wXG0dkMbudfhKqTrBV7gR/XACr3KoiCAnN598x8qU1h0WM3zHcDGPF
Item has status: valid
[auto] [example.com] Trigger challengeRemoveFn()
2024-11-26T10:20:35.163Z REMOVE TXT record key=_acme-challenge.example.com value=CI3-HvygY981-3m2LQE9cK0JVWoMYoQhZ5ye6_g6KmY
[auto] Finalizing order and downloading certificate
HTTP request: head https://localhost:9000/acme/acme/new-nonce
RESP 200 head https://localhost:9000/acme/acme/new-nonce
Using nonce: RVFzS1FwemJLRjlPQTR5TFNrbW1FTERqY3FsTWp1M1o
HTTP request: post https://localhost:9000/acme/acme/order/jNZ2x2oyS8tf2rN3ivF6opAqtBYJzSou/finalize
RESP 200 post https://localhost:9000/acme/acme/order/jNZ2x2oyS8tf2rN3ivF6opAqtBYJzSou/finalize
HTTP request: head https://localhost:9000/acme/acme/new-nonce
RESP 200 head https://localhost:9000/acme/acme/new-nonce
Using nonce: dDJ5WnhDNUJ6eW16NTZIMWxleFNINW9aMVM0WWRzdjU
HTTP request: post https://localhost:9000/acme/acme/certificate/mTyK4XnWBAuYaKxRQ8x0oEPCbiU6PdGF
RESP 200 post https://localhost:9000/acme/acme/certificate/mTyK4XnWBAuYaKxRQ8x0oEPCbiU6PdGF
2024-11-26T10:20:35.209Z Certificate for example.com created successfully
2024-11-26T10:20:35.219Z HTTPS server listening on port 443
```

### TLS-ALPN

`docker compose up step nginx`
`npm run tls-alpn`
`https example.com --verify=./step/certs/root_ca.crt`

## Certbot ACME client

More of using step-ca with other clients [step-ca examples](https://smallstep.com/blog/private-acme-server/#examples)

`brew install certbot`

sudo is required in certbot's standalone mode so it can listen on port 80 to complete the http-01 challenge:

```
sudo REQUESTS_CA_BUNDLE=./step/certs/root_ca.crt \
 certbot certonly -n --standalone -d example.com \
 --server https://localhost:9000/acme/acme/directory --agree-tos --email test@example.com
```

The output will be:

```
sudo REQUESTS_CA_BUNDLE=./step/certs/root_ca.crt  certbot certonly -n --standalone -d example.com  --server https://localhost:9000/acme/acme/directory --agree-tos --email test@example.com
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for example.com

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/example.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/example.com/privkey.pem
This certificate expires on 2024-11-27.
These files will be updated when the certificate renews.

NEXT STEPS:
- The certificate will need to be renewed before it expires. Certbot can automatically renew the certificate in the background, but you may need to take steps to enable that functionality. See https://certbot.org/renewal-setup for instructions.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

In this link certbot it's explained how to use certbot "manually" [Getting certificates (and choosing plugins manually](https://eff-certbot.readthedocs.io/en/latest/using.html#manual).
