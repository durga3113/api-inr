require("../settings");
const QRCode = require("qrcode");
const { makeid } = require("../lib/makeid");
const express = require('express');
const mongoose = require('mongoose');
const Paste = require('../model/session');
const path = require("path");
const router = express.Router();
const fs = require("fs");

router.use(express.urlencoded({ extended: true }));
router.get("/scan", (req, res) => {
  const qrImagePath = path.join(__dirname, "../qr.png");

  try {
    const qrImage = fs.readFileSync(qrImagePath);
    const base64Image = Buffer.from(qrImage).toString("base64");
    res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>QR Code</title>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .container {
                        text-align: center;
                    }
                    img {
                        display: block;
                        margin: 0 auto;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>QR Code</h1>
                    <img src="data:image/png;base64,${base64Image}" alt="QR Code" width="300" height="300">
                </div>
            </body>
            </html>
        `);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
});

router.get('/session/upload', async (req, res) => {
    const { content } = req.query;
    if (!content) {
      return res.json('Content is required');
    }
  const idd = makeid();
  const id = 'alpha~' + idd
  try {
    const newPaste = new Paste({
      id,
      content,
    });
    await newPaste.save();
    res.send({ id });
  } catch (err) {
    console.error(err);
    res.json('Error uploading paste');
  }
});

router.get('/session/restore', async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.json('id is required');
  }
  try {
    const paste = await Paste.findOne({ id });
    if (!paste) {
      res.json('Paste not found');
    } else {
      res.send({ content: paste.content });
    }
  } catch (err) {
    console.error(err);
    res.json('Error fetching paste');
  }
});



module.exports = router;
