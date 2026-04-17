const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["SK KING BOT", "Chrome", "1.0.0"]
    });

    // Pairing Code (IMPORTANT)
    if (!sock.authState.creds.registered) {
        const phoneNumber ="60109173294", "YOUR_NUMBER_HERE"; // Example: 923xxxxxxxxx
        const code = await sock.requestPairingCode(phoneNumber);
        console.log("Your Pairing Code:", code);
    }

    // Connection Update
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startBot();
            } else {
                console.log("Logged out!");
            }
        } else if (connection === "open") {
            console.log("Bot Connected ✅");
        }
    });

    // Save Session
    sock.ev.on("creds.update", saveCreds);

    // Message Listener
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;

        console.log("Message:", text);

        // Simple Commands
        if (text === "hi") {
            await sock.sendMessage(from, { text: "Hello 👋 SK KING BOT here!" });
        }

        if (text === "ping") {
            await sock.sendMessage(from, { text: "pong 🏓" });
        }
    });
}

startBot();
