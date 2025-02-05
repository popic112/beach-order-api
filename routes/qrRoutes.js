const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// 🟢 Endpoint: GET /api/qrcodes/list?business_id=1
router.get("/list", async (req, res) => {
  console.log("🔍 GET /list apelat cu:", req.query); // DEBUG

  try {
    const { business_id } = req.query;

    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    const [qrCodes] = await pool.query(
      "SELECT id, qr_code, umbrella_number FROM qr_codes WHERE business_id = ?",
      [business_id]
    );

    console.log("📡 Rezultate DB:", qrCodes); // DEBUG
    res.json({ business_id, qr_codes: qrCodes });

  } catch (error) {
    console.error("❌ Eroare SQL:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
