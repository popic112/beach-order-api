const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

router.get("/qrcode-to-business", async (req, res) => {
  console.log("🔹 GET /qrcode-to-business - Query Params:", req.query);

  try {
    let { qr_code, session_id } = req.query;
    if (!qr_code) {
      return res.status(400).json({ error: "❌ QR Code lipsă!" });
    }

    qr_code = qr_code.trim().replace(/[^a-zA-Z0-9\-]/g, "");
    console.log("🔹 Searching for qr_code:", qr_code);

    const connection = await pool.getConnection();
    try {
      // 1️⃣ Obține `business_id` și `business_name`
      const [businessResult] = await connection.query(
        `SELECT q.business_id, q.umbrella_number, b.name AS business_name 
         FROM qr_codes q 
         JOIN businesses b ON q.business_id = b.id
         WHERE q.qr_code = ?`,
        [qr_code]
      );

      if (businessResult.length === 0) {
        return res.status(404).json({ error: "❌ QR Code invalid!" });
      }

      const business_name = businessResult[0].business_name;
      const business_id = businessResult[0].business_id;
      const umbrella_number = businessResult[0].umbrella_number;

      if (!business_name) {
        return res.status(500).json({ error: "❌ Business Name nu este definit!" });
      }

      // 2️⃣ Obține meniul pentru acest business
      const [menuItems] = await connection.query(
        `SELECT id, name, description, price, type, visible 
         FROM menu 
         WHERE business_id = ? AND visible = 1`,
        [business_id]
      );

      // 3️⃣ Construim și trimitem răspunsul final
      res.json({
        business_name,
        qr_code,
        umbrella_number,
        business_id,
        menu: menuItems.length > 0 ? menuItems : [] // ✅ Evită problemele dacă meniul este gol
      });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Eroare server:", error);
    res.status(500).json({ error: "❌ Eroare internă." });
  }
});

module.exports = router;
