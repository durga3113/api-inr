const pino = require("pino");
const colors = require("colors");
require('../settings');
const qr = require("qrcode");
const { toBuffer } = require("qrcode");
const Jimp = require("jimp");
const fs = require("fs");
const {
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const useMongoDBAuthState = require("../MongoAuth/MongoAuth");
const makeWASocket = require("@whiskeysockets/baileys").default;
const { MongoClient } = require("mongodb");

const logger = pino({ level: "silent" });

async function connectWhatsApp() {
  const mongoURL = mongodbauth
  const mongoClient = new MongoClient(mongoURL, {
   /* useNewUrlParser: true,
    useUnifiedTopology: true,*/
  });
  await mongoClient.connect();

  if (flush) {
    const collection = mongoClient
      .db("whatsapp_api")
      .collection("auth_info_baileys");
    await collection.deleteMany({});
    console.log("Database flushed successfully.");
  }

  const collection = mongoClient
    .db("whatsapp_api")
    .collection("auth_info_baileys");
  const { state, saveCreds } = await useMongoDBAuthState(collection);
  const sock = makeWASocket({
    printQRInTerminal: true,
    logger: logger,
    auth: state,
  });

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update || {};

    if (qr) {
      console.log(qr);
    }
    if (update.qr) {
      Jimp.read(await toBuffer(update.qr), (err, image) => {
        if (err) throw err;
        image.write("qr.png");
        console.log("image saved");
      });
    }
    if (connection === "connecting") {
      console.log("ℹ️ Connecting to WhatsApp... Please Wait.");
    }
    if (connection === "open") {
      console.log("✅ sucessfully connected to whatsapp");
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        connectWhatsApp();
      }
    }
  });
  sock.ev.on("creds.update", saveCreds);
  return sock;
}

async function sendMessage(sock, phoneNumber, message) {
  const id = phoneNumber + "@s.whatsapp.net";
  const sentMsg = await sock.sendMessage(id, { text: message });
  console.log(
    "Message sent successfully".green +
      "\n" +
      "Phone Number:".cyan +
      phoneNumber +
      "\n" +
      "Message:".cyan +
      message,
  );
  return sentMsg;
}

module.exports = {
  connectWhatsApp,
  sendMessage,
};