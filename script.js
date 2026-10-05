/*
  QUEEN LEXIE V4
  Developed by ZIGALY XR
*/

const BOT_URL = "https://pair.xwolf.space";

const matrix = document.getElementById("matrix");
const ctx = matrix.getContext("2d");

const generateBtn = document.getElementById("generateBtn");
const phoneInput = document.getElementById("phone");

const statusDot = document.getElementById("statusDot");
const statusText = document.getElementById("statusText");

const loading = document.getElementById("loading");
const result = document.getElementById("result");
const pairCode = document.getElementById("pairCode");

const copyBtn = document.getElementById("copyBtn");
const message = document.getElementById("message");

/* =========================
   MATRIX EFFECT
========================= */

function resizeMatrix() {
  matrix.width = window.innerWidth;
  matrix.height = window.innerHeight;
}

resizeMatrix();

window.addEventListener("resize", resizeMatrix);

const letters =
  "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@";

let fontSize = 14;
let columns = Math.floor(window.innerWidth / fontSize);

let drops = Array(columns).fill(1);

function drawMatrix() {

  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  ctx.fillRect(
    0,
    0,
    matrix.width,
    matrix.height
  );

  ctx.fillStyle = "#ff003c";
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {

    const text =
      letters.charAt(
        Math.floor(
          Math.random() * letters.length
        )
      );

    ctx.fillText(
      text,
      i * fontSize,
      drops[i] * fontSize
    );

    if (
      drops[i] * fontSize >
        matrix.height &&
      Math.random() > 0.975
    ) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

setInterval(drawMatrix, 45);


/* =========================
   MESSAGE
========================= */

function showMessage(text, type = "") {

  message.textContent = text;

  message.className = "message";

  if (type) {
    message.classList.add(type);
  }
}


/* =========================
   BOT STATUS
========================= */

async function checkBotStatus() {

  statusText.textContent =
    "Checking bot...";

  statusDot.className =
    "status-dot";

  try {

    const response =
      await fetch(BOT_URL, {
        method: "GET",
        mode: "no-cors"
      });

    /*
      no-cors responses cannot expose the
      actual HTTP status to the browser.
      Reaching this point means the request
      was attempted.
    */

    statusDot.classList.add("online");

    statusText.textContent =
      "BOT SERVER AVAILABLE";

  } catch (error) {

    statusDot.classList.add("offline");

    statusText.textContent =
      "BOT OFFLINE";

    showMessage(
      "QUEEN LEXIE is currently offline. Please try again later.",
      "error"
    );
  }
}


/* =========================
   PHONE VALIDATION
========================= */

function cleanPhoneNumber(number) {

  return number
    .replace(/\D/g, "")
    .trim();
}


/* =========================
   PAIRING
========================= */

generateBtn.addEventListener(
  "click",
  async () => {

    const phone =
      cleanPhoneNumber(
        phoneInput.value
      );

    if (!phone) {

      showMessage(
        "Please enter your WhatsApp phone number.",
        "error"
      );

      phoneInput.focus();

      return;
    }

    if (phone.length < 10) {

      showMessage(
        "Please enter a valid phone number with country code.",
        "error"
      );

      return;
    }

    generateBtn.disabled = true;

    loading.classList.remove("hidden");
    result.classList.add("hidden");

    showMessage("");

    try {

      /*
        IMPORTANT:

        This is an example endpoint.

        Your server must expose an API such as:

        https://pair.xwolf.space/api/pair?phone=2637XXXXXXXX

        Change the endpoint below to your
        actual pairing API endpoint.
      */

      const apiURL =
        `${BOT_URL}/api/pair?phone=${encodeURIComponent(phone)}`;

      const response =
        await fetch(apiURL, {
          method: "GET",
          headers: {
            "Accept": "application/json"
          }
        });

      if (!response.ok) {

        throw new Error(
          "Pairing server is offline."
        );
      }

      const data =
        await response.json();

      /*
        Expected server response example:

        {
          "success": true,
          "code": "ABCD-EFGH"
        }
      */

      if (
        !data.success ||
        !data.code
      ) {

        throw new Error(
          "No pairing code was returned by the bot."
        );
      }

      pairCode.textContent =
        data.code;

      result.classList.remove(
        "hidden"
      );

      showMessage(
        "Pairing code generated successfully.",
        "success"
      );

    } catch (error) {

      result.classList.add(
        "hidden"
      );

      showMessage(
        "QUEEN LEXIE is offline or the pairing API is unavailable. No bot code was generated.",
        "error"
      );

    } finally {

      loading.classList.add(
        "hidden"
      );

      generateBtn.disabled = false;
    }
  }
);


/* =========================
   COPY CODE
========================= */

copyBtn.addEventListener(
  "click",
  async () => {

    const code =
      pairCode.textContent.trim();

    if (
      !code ||
      code === "--------"
    ) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        code
      );

      copyBtn.textContent =
        "COPIED ✓";

      setTimeout(() => {

        copyBtn.textContent =
          "COPY CODE";

      }, 2000);

    } catch (error) {

      showMessage(
        "Unable to copy the code automatically.",
        "error"
      );
    }
  }
);


/* =========================
   START
========================= */

checkBotStatus();
