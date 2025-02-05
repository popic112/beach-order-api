const express = require("express");
const router = express.Router();
const { QrCode } = require("../models"); // Import modelul Sequelize
const { v4: uuidv4 } = require("uuid");

// Endpoint pentru generare QR Codes
router.post("/generate-qr", async (req, res) => {
  try {
    const { numCodes, business_id } = req.body;
    if (!numCodes || numCodes <= 0 || !business_id) {
      return res.status(400).json({ error: "Date invalide." });
    }

    let qrCodes = [];
    for (let i = 0; i < numCodes; i++) {
      const qrCode = uuidv4(); // Generăm un UUID
      const newQr = await QrCode.create({
        business_id,
        umbrella_number: null,
        qr_code: qrCode
      });
      qrCodes.push(newQr.qr_code);
    }

    res.json({ success: true, qrCodes });
  } catch (error) {
    console.error("Eroare:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
