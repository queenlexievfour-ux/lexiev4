/* =========================================
   QUEEN LEXIE V4
   ZIGALY XR
   ========================================= */

const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

const generateBtn = document.getElementById("generateBtn");
const phoneNumber = document.getElementById("phoneNumber");

const message = document.getElementById("message");
const pairingBox = document.getElementById("pairingBox");
const pairingCode = document.getElementById("pairingCode");


/* =========================================
   RED MATRIX EFFECT
   ========================================= */

let fontSize = 14;
let columns;
let drops;

function setupMatrix() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    columns = Math.floor(canvas.width / fontSize);

    drops = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -50;
    }
}

function drawMatrix() {

    ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = fontSize + "px monospace";

    const characters =
        "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@<>[]{}";

    for (let i = 0; i < drops.length; i++) {

        const character =
            characters.charAt(
                Math.floor(Math.random() * characters.length)
            );

        ctx.fillStyle =
            Math.random() > 0.9
                ? "#ffffff"
                : "#ff003c";

        ctx.shadowBlur = 8;
        ctx.shadowColor = "#ff003c";

        ctx.fillText(
            character,
            i * fontSize,
            drops[i] * fontSize
        );

        ctx.shadowBlur = 0;

        if (
            drops[i] * fontSize > canvas.height &&
            Math.random() > 0.975
        ) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

setupMatrix();

setInterval(drawMatrix, 40);

window.addEventListener("resize", setupMatrix);


/* =========================================
   BOT STATUS
   ========================================= */

const BOT_URL = "https://pair.xwolf.space";


function setStatus(online) {

    if (online) {

        statusText.textContent = "BOT ONLINE";

        statusDot.style.background = "#00ff73";
        statusDot.style.boxShadow =
            "0 0 12px #00ff73";

        generateBtn.disabled = false;

    } else {

        statusText.textContent = "BOT OFFLINE";

        statusDot.style.background = "#ff003c";
        statusDot.style.boxShadow =
            "0 0 12px #ff003c";

        generateBtn.disabled = true;
    }
}


async function checkBotStatus() {

    statusText.textContent = "CHECKING BOT...";

    statusDot.style.background = "orange";
    statusDot.style.boxShadow = "0 0 12px orange";

    /*
       A browser cannot reliably determine the status of
       another server unless that server allows CORS or
       provides a status API.

       Therefore this tries the server and safely falls
       back to OFFLINE/UNAVAILABLE.
    */

    try {

        const controller = new AbortController();

        const timeout = setTimeout(
            () => controller.abort(),
            5000
        );

        const response = await fetch(BOT_URL, {
            method: "GET",
            mode: "no-cors",
            signal: controller.signal
        });

        clearTimeout(timeout);

        /*
           no-cors responses cannot expose the HTTP status.
           Reaching this point means the request itself was
           attempted successfully.
        */

        setStatus(true);

    } catch (error) {

        setStatus(false);

        showMessage(
            "QUEEN LEXIE is currently offline. Please try again later.",
            "error"
        );
    }
}


/* =========================================
   MESSAGE
   ========================================= */

function showMessage(text, type) {

    message.textContent = text;
    message.className = "message " + type;
}


/* =========================================
   GENERATOR BUTTON
   ========================================= */

generateBtn.addEventListener("click", async () => {

    const number = phoneNumber.value.trim();

    pairingBox.style.display = "none";

    if (!number) {

        showMessage(
            "Please enter your phone number first.",
            "error"
        );

        return;
    }

    if (!/^[0-9+\s()-]{7,20}$/.test(number)) {

        showMessage(
            "Please enter a valid phone number.",
            "error"
        );

        return;
    }

    generateBtn.disabled = true;

    generateBtn.innerHTML =
        "<span>⏳</span> CHECKING SERVER...";

    showMessage(
        "Connecting to the pairing service...",
        "success"
    );

    /*
       IMPORTANT:
       Do not generate a fake WhatsApp pairing code
       in the browser.

       Your backend should provide a legitimate endpoint
       that creates/returns the pairing code after proper
       authorization.

       Example backend endpoint:
       /api/pair?phone=NUMBER

       Replace the example section below with your own
       authenticated backend API.
    */

    try {

        /*
        Example:

        const response = await fetch(
            "/api/pair?phone=" +
            encodeURIComponent(number)
        );

        const data = await response.json();

        if (!response.ok || !data.code) {
            throw new Error("Pairing service unavailable");
        }

        pairingCode.textContent = data.code;
        pairingBox.style.display = "block";

        showMessage(
            "Pairing code generated successfully.",
            "success"
        );
        */

        await new Promise(
            resolve => setTimeout(resolve, 1200)
        );

        showMessage(
            "The pairing generator is not connected to a backend yet. No fake code was generated.",
            "error"
        );

    } catch (error) {

        showMessage(
            "QUEEN LEXIE pairing service is unavailable.",
            "error"
        );

    } finally {

        generateBtn.disabled = false;

        generateBtn.innerHTML =
            "<span>⚡</span> GENERATE PAIRING CODE";
    }
});


/* =========================================
   START
   ========================================= */

checkBotStatus();
