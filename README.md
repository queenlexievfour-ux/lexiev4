# ZIG HOST CHECKER — Android source project

This is a starter Python/Kivy project for building an Android APK. It includes the provided ZIG HOST CHECKER logo.

## Features
- Welcome notice and usage warning
- Host/IP lookup and one-shot ping status/time
- DNS lookup plus checks for a short list of common subdomains
- Private IPv4 network scanner limited to ranges of 256 addresses or fewer
- Scans only private IPv4 ranges and checks a small set of TCP ports
- Output log, copy output, owner contact details, About menu, WhatsApp channel button placeholder
- Exit confirmation

## Important
Use only on devices, domains, and networks you own or have permission to test. Ping can be blocked by a firewall, so “no reply” does not always mean a host is offline.

## Configure WhatsApp channel
Open `main.py` and replace `PUT_YOUR_WHATSAPP_CHANNEL_LINK_HERE` with your actual WhatsApp Channel URL.

## Build APK
Buildozer is most reliable on Linux (Ubuntu) or a Linux environment. Android APK compilation is not performed just by saving these source files.

1. Install Python 3 and system dependencies for Buildozer on Ubuntu.
2. Install Buildozer: `python3 -m pip install --user buildozer`
3. Open this project folder in a terminal.
4. Run: `buildozer android debug`
5. The APK should be created in the `bin/` folder.

On a phone, you can use a Linux environment such as Termux with a suitable build setup, but Android builds are generally easier on a PC or cloud Linux workspace.

## Project files
- `main.py` — app interface and host diagnostic logic
- `buildozer.spec` — Android build configuration
- `assets/zig_host_checker_logo.png` — provided logo
