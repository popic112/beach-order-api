const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

router.post("/generate-qr", async (req, res) => {
  try {
    const { numCodes, business_id } = req.body;
    if (!numCodes || numCodes <= 0 || !business_id) {
      return res.status(400).json({ error: "Date invalide." });
    }

    let qrCodes = [];
    for (let i = 0; i < numCodes; i++) {
      const qrCode = uuidv4();
      await pool.query("INSERT INTO qr_codes (business_id, umbrella_number, qr_code) VALUES (?, NULL, ?)", 
        [business_id, qrCode]);

      qrCodes.push(qrCode);
    }

    res.json({ success: true, qrCodes });
  } catch (error) {
    console.error("Eroare:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
