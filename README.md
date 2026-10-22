# ZIG HOST CHECKER — Website + Backend

Developed by **ZIGALY XR 🇿🇼**.

## What the backend adds
- `/api/health` confirms that the server is running.
- `/api/dns?host=example.com` resolves a public hostname to IP addresses.
- `POST /api/check` makes a short HTTPS HEAD request and reports the HTTP status and response time.
- Basic rate limiting and validation are enabled. Private/reserved IP targets are blocked.
- The frontend is served by the same Node.js server, so its API calls work on one deployment.

**Important:** This is an HTTPS reachability check, not ICMP ping. It does not scan ports or scan networks. A server that blocks HTTPS may show no response even if it is online. Use it only for hosts you own or have permission to check.

## Run on your computer
1. Install Node.js 18 or newer.
2. Open a terminal in the `backend` folder.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000` in your browser.

## Deploy
Deploy the whole project folder to a Node.js hosting service that supports a start command. Set the **Root Directory** to `backend`, and the start command to `npm start`. Because the HTML/CSS/JS files sit one folder above `backend`, if your host only deploys the backend folder, either deploy the full repository with root directory set to the repository root and start command `node backend/server.js`, or move the website files into a `public` folder and adjust the server. Recommended simple setup: deploy the full repository, set root directory to the repository root, and set start command to `node backend/server.js`; run `npm install` in the repository root after adding a root `package.json`, or use the provided backend `package.json` with root directory `backend` and configure the host to include the parent website files.

## Files
- `index.html` — website interface
- `style.css` — styling
- `script.js` — frontend behavior
- `backend/server.js` — API backend
- `backend/package.json` — Node.js dependencies
