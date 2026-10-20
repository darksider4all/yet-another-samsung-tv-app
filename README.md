<p align="center">
  <img src="app/icon.png" width="140" alt="Casa">
</p>

<h1 align="center">yet-another-samsung-tv-app</h1>

<p align="center">
  A sideloaded <b>Tizen</b> web app that turns a modern Samsung TV into a well-behaved,
  locally-controllable device — telemetry, controls, toast/cast, and an on-screen lights
  dashboard — talking only to a small local server on your LAN. No Samsung cloud.
</p>

---

## What it is

Modern Samsung TVs (Tizen 7/8/9) expose a lot through their on-device web APIs that the
remote WebSocket/REST do **not** — the current channel + EPG program, volume/mute, the
foreground app, system sensors, installed-app launching, and full-screen toast/cast. This
app is a hidden Tizen agent that reads all of that and reports it to a tiny local **bridge**
server (`tv-reader`), which Home Assistant (or anything) can then read and control.

It pairs with the companion server + Home Assistant integration:
👉 **[yet-another-samsung-ha-integration](https://github.com/darksider4all/yet-another-samsung-ha-integration)**

## Features

- **Live telemetry** → bridge: channel + program (EPG), volume/mute, input, foreground app,
  firmware/model, network, memory/uptime/eco sensors.
- **Control channel**: volume, mute, channel up/down + tune, launch any installed app, hide.
- **Toast & cast**: full-screen message, image, video, or web page pushed from HA.
- **Lights dashboard** (on the TV): a grid of your Home-Assistant lights, toggle with the remote.
- **Silent by default**: runs hidden doing telemetry; the dashboard appears only when you open it.
- **Zero hardcoding**: the bridge URL is configured **on the TV at runtime** (Setup screen →
  `localStorage`) — the same signed build runs on any network.

## Architecture

```
┌────────────┐  HTTP (telemetry, commands,   ┌──────────────┐  local API   ┌──────────────┐
│  TV app    │  lights, toast/cast, config)  │   bridge     │◄────────────►│ Home         │
│ (this repo)│ ◄───────────────────────────► │  tv-reader   │              │ Assistant    │
│  Tizen     │                               │ (other repo) │              │ integration  │
└────────────┘                               └──────────────┘              └──────────────┘
```

## Install

**Prerequisites:** the TV in **Developer Mode** (Host PC IP = a machine on your LAN running
`sdb`), and the **bridge** running (see the companion repo).

1. **Get the app.** Use the prebuilt `dist/casa.wgt`, or build your own — see
   [`sign/README.md`](sign/README.md). The prebuilt WGT has **no IP baked in**.
2. **Install via sdb:**
   ```bash
   sdb connect <tv-ip>
   sdb -s <tv-ip>:26101 push dist/casa.wgt /home/owner/share/tmp/sdk_tools/tmp/app.wgt
   sdb -s <tv-ip>:26101 shell 0 vd_appinstall ChanProbe0 /home/owner/share/tmp/sdk_tools/tmp/app.wgt
   sdb -s <tv-ip>:26101 shell 0 was_execute ChanProbe0.ChannelProbe
   ```
3. **First run → Setup screen.** Enter your bridge URL (`http://<bridge-ip>:8777`):
   - **GREEN** — test the connection
   - **YELLOW** — auto-discover the bridge on your subnet
   - **OK** — save (stored in `localStorage`, persists across launches)
   - Press **RED** anytime later to reopen Setup.

## Remote keys

| Key | Action |
|---|---|
| ◀ ▲ ▼ ▶ | move light selection |
| **OK** | toggle the selected light |
| **RED** | open Setup (change bridge URL) |
| **Return / Back** | send the app to the background (telemetry keeps running) |

## Notes & limits

- Package id is `ChanProbe0.ChannelProbe` (the Tizen package name must be exactly 10 chars).
  Change it in `app/config.xml` if you want your own — then update the install commands.
- Picture/sound controls, power on/off, source switching, and screen capture are
  **privilege-gated** on modern Tizen for a public-signed app and are intentionally not here.
- This is an **unofficial hobby project**, not affiliated with Samsung. Sideloading requires
  Developer Mode; use at your own risk.

## License

MIT — see [LICENSE](LICENSE).
