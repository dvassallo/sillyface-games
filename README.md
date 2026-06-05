# Sillyface Games

A collection of browser-based games deployed as a static-only Kamal app.

## Deployment

Push to `main` and each top-level folder with an `index.html` becomes a subdomain on `assetstacks.com`.

```text
chess/index.html -> https://chess.assetstacks.com
planes/index.html -> https://planes.assetstacks.com
```

Folders without an `index.html` are ignored. Docker Compose apps are not started by this deployment; if a folder contains an `index.html`, it is served as static files only.

## License

MIT
