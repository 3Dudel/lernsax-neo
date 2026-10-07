# LernSax Neo

Modernes, personalisierbares Frontend für [LernSax](https://www.lernsax.de) mit Chat- (WhatsApp-Stil) und Cloud-Ansicht.

- Login mit echtem LernSax-Konto (JSON-RPC `https://www.lernsax.de/jsonrpc.php`)
- Personalisierung: Hell/Dunkel, Akzentfarbe, Hintergrund (Farbe/URL/eigenes Bild), Schrift, Ecken, Position der Navigation
- Einstellungen werden lokal im Browser gespeichert

## Hinweis
Blockiert der Browser den direkten Zugriff auf lernsax.de (CORS), muss unter *Erweitert* beim Login eine Proxy-URL eingetragen werden (z. B. ein eigener Cloudflare Worker, der `?url=` weiterleitet und CORS-Header setzt).

Inoffizielles Projekt, nicht mit LernSax verbunden.
