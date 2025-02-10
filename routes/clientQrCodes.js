const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

router.get("/qrcode-to-business", async (req, res) => {
  console.log("🔹 GET /qrcode-to-business - Query Params:", req.query);

  try {
    let { qr_code, session_id } = req.query;
    if (!qr_code) {
      return res.status(400).json({ error: "qr_code este obligatoriu." });
    }

    qr_code = qr_code.trim().replace(/[^a-zA-Z0-9\-]/g, "");
    console.log("🔹 Searching for qr_code:", qr_code);

    const connection = await pool.getConnection();
    try {
      // 1️⃣ Obținem `business_id`, `business_slug` și `umbrella_number`
      const [businessResult] = await connection.query(
        `SELECT q.business_id, q.umbrella_number, b.name AS business_name, b.slug AS business_slug
         FROM qr_codes q 
         JOIN businesses b ON q.business_id = b.id
         WHERE q.qr_code = ?`,
        [qr_code]
      );

      if (businessResult.length === 0) {
        return res.status(404).json({ error: "QR Code-ul nu este valid." });
      }

      const business_id = businessResult[0].business_id;
      const business_slug = businessResult[0].business_slug;
      const umbrella_number = businessResult[0].umbrella_number;

      console.log(`✅ Business Found: ${business_slug} (ID: ${business_id}), Umbrella: ${umbrella_number}`);

      // 2️⃣ Generăm un session_id dacă nu există unul
      let newSession = false;
      session_id = session_id ? session_id.trim() : "";

      if (!session_id) {
        session_id = uuidv4();
        newSession = true;
        console.log("⚠️ Nu există session_id. Se generează unul nou:", session_id);
        await connection.query("INSERT INTO sessions (session_id, created_at) VALUES (?, NOW())", [session_id]);
      }

      // 3️⃣ Redirecționăm utilizatorul către pagina meniului
      const redirectUrl = `/menu/${business_slug}`;
      console.log(`✅ Redirecting to: ${redirectUrl}`);

      res.redirect(302, redirectUrl);

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Eroare server:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
