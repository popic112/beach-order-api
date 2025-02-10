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
      // 1️⃣ Obține `business_id`, `business_name` și `umbrella_number`
      const [businessResult] = await connection.query(
        `SELECT q.business_id, q.umbrella_number, b.name AS business_name 
         FROM qr_codes q 
         JOIN businesses b ON q.business_id = b.id
         WHERE q.qr_code = ?`,
        [qr_code]
      );

      if (businessResult.length === 0) {
        return res.status(404).json({ error: "QR Code-ul nu este valid." });
      }

      const business_id = businessResult[0].business_id;
      const business_name = businessResult[0].business_name;
      const umbrella_number = businessResult[0].umbrella_number;

      console.log(`✅ Business Found: ${business_name} (ID: ${business_id}), Umbrella: ${umbrella_number}`);

      // 2️⃣ Verificăm dacă `session_id` este valid sau trebuie generat unul nou
      let newSession = false;
      session_id = session_id ? session_id.trim() : "";

      if (!session_id) {
        session_id = uuidv4();
        newSession = true;
        console.log("⚠️ Nu există session_id. Se generează unul nou:", session_id);
        await connection.query("INSERT INTO sessions (session_id, created_at) VALUES (?, NOW())", [session_id]);
      } else {
        const [sessionResult] = await connection.query(
          "SELECT session_id FROM sessions WHERE session_id = ? LIMIT 1",
          [session_id]
        );

        if (sessionResult.length === 0) {
          session_id = uuidv4();
          newSession = true;
          console.log("⚠️ Session_id invalid. Se generează unul nou:", session_id);
          await connection.query("INSERT INTO sessions (session_id, created_at) VALUES (?, NOW())", [session_id]);
        } else {
          console.log("✅ Session_id EXISTĂ în DB și va fi utilizat:", session_id);
        }
      }

      // 3️⃣ Obține meniul
      const [menuResult] = await connection.query(
        "SELECT id, name, description, price, type, visible, image FROM menu WHERE business_id = ?",
        [business_id]
      );

      console.log(`✅ ${menuResult.length} produse găsite în meniu pentru ${business_name}`);

      // 4️⃣ Obține setările meniului (menu_setup)
      const [menuSetupResult] = await connection.query(
        "SELECT id, bar_open, bar_close, kitchen_open, kitchen_close, receive_orders_together, confirm_orders, suspend_online_orders, coordinates FROM menu_setup WHERE business_id = ?",
        [business_id]
      );

      let menuSetup = menuSetupResult.length > 0 ? menuSetupResult[0] : {};
      menuSetup.coordinates = menuSetup.coordinates ? JSON.parse(menuSetup.coordinates) : [];

      console.log("✅ Sending final response...");

      // ✅ Răspuns final, ACUM inclus și `umbrella_number`
      res.json({
        session_id,
        new_session: newSession,
        business_id,
        business_name,
        umbrella_number, // 📌 Acum este corect plasat
        menu: menuResult,
        menu_setup: menuSetup
      });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Eroare la obținerea datelor:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
