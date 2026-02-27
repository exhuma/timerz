FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
# Generate a self-signed TLS certificate for local network
# testing (avoids the crypto.randomUUID secure-context
# restriction when accessing over plain HTTP on a LAN).
# SAN is required by Chrome ≥ 58 to allow bypassing the
# untrusted-certificate warning.
RUN apk add --no-cache openssl \
    && mkdir -p /etc/nginx/ssl \
    && printf '[req]\ndistinguished_name=dn\n[dn]\n\
[ext]\nsubjectAltName=DNS:localhost,IP:127.0.0.1\n' \
       > /tmp/san.cnf \
    && openssl req -x509 -nodes -days 3650 \
       -newkey rsa:2048 \
       -keyout /etc/nginx/ssl/timerz.key \
       -out /etc/nginx/ssl/timerz.crt \
       -subj "/CN=timerz-local" \
       -extensions ext \
       -config /tmp/san.cnf \
    && rm /tmp/san.cnf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
