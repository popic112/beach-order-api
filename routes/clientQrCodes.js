const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

router.get("/qrcode-to-business", async (req, res) => {
  console.log("🔹 GET /qrcode-to-business - Query Params:", req.query);

  try {
    let { qr_code, session_id } = req.query;
    if (!qr_code) {
      return res.status(400).send("❌ QR Code lipsă!");
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
        return res.status(404).send("❌ QR Code invalid!");
      }

      const business_name = businessResult[0].business_name;

      if (!business_name) {
        return res.status(500).send("❌ Business Name nu este definit!");
      }

      res.json({
        business_name: business_name,
        qr_code: qr_code,
        umbrella_number: businessResult[0].umbrella_number,
        business_id: businessResult[0].business_id
      });
      
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Eroare server:", error);
    res.status(500).send("❌ Eroare internă.");
  }
});


module.exports = router;
