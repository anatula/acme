$ORIGIN example.com.
$TTL 0
@       IN      SOA     example.com. admin.example.com. (
                        2024112600 ; Serial
                        3600       ; Refresh
                        1800       ; Retry
                        604800     ; Expire
                        86400      ; Minimum TTL
);