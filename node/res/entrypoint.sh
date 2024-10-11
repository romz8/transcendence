#!/bin/bash

export $(cat ../../.env | xargs)

apt-get install -y openssl && \
    openssl genrsa -des3 -passout pass:$SSL_KEY_PASSWORD -out server.pass.key 2048 && \
    openssl rsa -passin pass:$SSL_KEY_PASSWORD -in server.pass.key -out server.key && \
    rm server.pass.key && \
    openssl req -new -key server.key -out server.csr \
        -subj "/C=ES/ST=Catalonia/L=Barcelona/O=42/OU=VimHaters/CN=transcendence.com" && \
    openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt 

mv server.crt server.key /etc/nginx/ssl/

rm server.csr

npm run build &

nginx -g "daemon off;"