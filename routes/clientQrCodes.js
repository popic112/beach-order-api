const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * 🟢 1. Obține business_id și meniul pe baza unui QR Code
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
      // 1️⃣ Obținem business_id aferent QR Code-ului
      const [businessResult] = await connection.query(
        "SELECT business_id FROM qr_codes WHERE qr_code = ?",
        [qr_code]
      );

      console.log("🔹 Query Result for business_id:", businessResult);

      if (businessResult.length === 0) {
        return res.status(404).json({ error: "QR Code-ul nu este valid." });
      }

      const business_id = businessResult[0].business_id;

      // 2️⃣ Obținem meniul pentru business_id
      const [menuResult] = await connection.query(
        "SELECT id, name, price FROM menu WHERE business_id = ?",
        [business_id]
      );

      console.log("🔹 Query Result for menu:", menuResult);

      res.json({
        business_id,
        menu: menuResult
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Eroare la obținerea business_id și meniului:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
