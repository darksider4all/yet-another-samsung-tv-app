# Signing the app

Tizen requires sideloaded apps to be signed with an **author** certificate and a
**distributor** certificate. `sign.js` packages `../app/` into a signed `.wgt`.

## 1. Get Tizen certificates

You need author + distributor `.p12` files. The easy route for a sideloaded app is the
public distributor certificate used by **TizenBrew** (installs in Developer Mode only,
public privileges only — a sanctioned, sandboxed app, not a privilege escalation). You can
also create them with **Tizen Studio** (Certificate Manager → Samsung → TV).

## 2. Build `cert.json`

`sign.js` reads `cert.json` with base64-encoded DER of each `.p12`:

```bash
cp cert.sample.json cert.json
# then set the three fields:
#   authorCert       = base64 of your author .p12 (binary DER)
#   distributorCert  = base64 of your distributor .p12 (binary DER)
#   password         = the p12 password
# e.g. to base64 a p12:  base64 -i author.p12
```

`cert.json` is **gitignored** — never commit it.

## 3. Install deps & sign

```bash
npm install          # pulls node-forge, jszip, reisxd/tizen.js
node sign.js         # writes ../out/ChannelProbe.wgt
```

## 4. Install on the TV (Developer Mode + sdb)

```bash
sdb connect <tv-ip>
sdb -s <tv-ip>:26101 push ../out/ChannelProbe.wgt /home/owner/share/tmp/sdk_tools/tmp/app.wgt
sdb -s <tv-ip>:26101 shell 0 vd_appinstall ChanProbe0 /home/owner/share/tmp/sdk_tools/tmp/app.wgt
sdb -s <tv-ip>:26101 shell 0 was_execute ChanProbe0.ChannelProbe
```

On first launch the app shows a **Setup** screen — enter your bridge URL there (no rebuild
needed). See the top-level `README.md`.
