const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * 🟢 1. Obține business_id pe baza unui QR Code
 * Endpoint: GET /api/client/qrcode-to-business?qr_code={qr_code}
 */
router.get("/qrcode-to-business", async (req, res) => {
  console.log("🔹 GET /qrcode-to-business - Query Params:", req.query);

  try {
    let { qr_code } = req.query;
    if (!qr_code) {
      return res.status(400).json({ error: "qr_code este obligatoriu." });
    }

    // Curățăm posibile caractere speciale sau spații
    qr_code = qr_code.trim().replace(/[^a-zA-Z0-9\-]/g, "");

    console.log("🔹 Searching for qr_code:", qr_code);

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        "SELECT business_id FROM qr_codes WHERE qr_code = ?",
        [qr_code]
      );

      console.log("🔹 Query Result:", result);

      if (result.length === 0) {
        return res.status(404).json({ error: "QR Code-ul nu este valid." });
      }

      res.json({ business_id: result[0].business_id });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Eroare la obținerea business_id:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
