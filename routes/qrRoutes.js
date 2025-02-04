const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Import conexiunea la baza de date
const { v4: uuidv4 } = require("uuid");

// Endpoint pentru generare QR Codes
router.post("/generate-qr", async (req, res) => {
  try {
    console.log("🔍 Request Body primit:", req.body); // Debugging

    const { numCodes } = req.body;
    if (!numCodes || numCodes <= 0) {
      return res.status(400).json({ error: "Numărul trebuie să fie minim 1." });
    }

    let qrCodes = [];
    for (let i = 0; i < numCodes; i++) {
      const qrCode = uuidv4(); // Generăm un QR Code unic (UUID)
      qrCodes.push(qrCode);
      await pool.query("INSERT INTO qr_codes (qr_code) VALUES (?)", [qrCode]);
    }

    res.json({ success: true, qrCodes });
  } catch (error) {
    console.error("❌ Eroare la generarea QR Code:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
