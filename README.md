# Timerz

A multi-player chess-clock SPA built with Vue 3 + Vuetify 3.
All state is stored in the browser's `localStorage` —
no server-side persistence required.

## Development

```bash
npm install
npm run dev        # dev server on http://localhost:3000
npm run build      # production build into dist/
npm run lint       # ESLint (auto-fix)
npm run type-check # vue-tsc type-checking
```

## Docker

### Build

```bash
docker build -t timerz .
```

The image serves the app via **nginx** on ports **80** (HTTP)
and **443** (HTTPS). A self-signed TLS certificate is
generated at build time.

### Run

```bash
docker run -p 80:80 -p 443:443 timerz
```

Access the app at `http://localhost` or
`https://localhost` (accept the browser's self-signed
certificate warning).

### Local network / mobile access

When accessing from another device on the same network
(e.g. a phone via Wi-Fi hotspot), use **HTTPS** so that
the browser's secure-context APIs are available:

```
https://<host-ip>
```

Your browser will warn about the self-signed certificate —
accept it to proceed. On iOS, tap **Advanced → proceed** or
install the certificate from `Settings → General →
VPN & Device Management`.

> **Why HTTPS?** `crypto.randomUUID()` and certain other
> browser APIs are only available in secure contexts
> (HTTPS or localhost). Plain HTTP on a non-localhost
> address will prevent game creation.

## 📑 License

[MIT](http://opensource.org/licenses/MIT)

