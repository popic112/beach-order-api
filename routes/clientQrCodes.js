const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

/**
 * 🟢 Scanare QR Code + verificare/generare session_id
 * Endpoint: GET /api/client/qrcode-to-business?qr_code={qr_code}&session_id={session_id}
 */
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
      // 1️⃣ Obține business_id aferent QR Code-ului
      const [businessResult] = await connection.query(
        "SELECT business_id FROM qr_codes WHERE qr_code = ?",
        [qr_code]
      );

      if (businessResult.length === 0) {
        return res.status(404).json({ error: "QR Code-ul nu este valid." });
      }

      const business_id = businessResult[0].business_id;
      console.log("✅ Business ID:", business_id);

      // 2️⃣ Verificăm dacă `session_id` este valid sau trebuie generat unul nou
      let newSession = false;
      if (!session_id || session_id.trim() === "") {
        console.log("⚠️ Nu există session_id. Se generează unul nou...");
        session_id = uuidv4();
        newSession = true;

        await connection.query("INSERT INTO sessions (session_id, created_at) VALUES (?, NOW())", [session_id]);
      } else {
        const [sessionResult] = await connection.query(
          "SELECT session_id FROM sessions WHERE session_id = ?",
          [session_id]
        );

        if (sessionResult.length === 0) {
          console.log("⚠️ Session_id invalid. Se generează unul nou...");
          session_id = uuidv4();
          newSession = true;

          await connection.query("INSERT INTO sessions (session_id, created_at) VALUES (?, NOW())", [session_id]);
        }
      }

      console.log("✅ Session ID utilizat:", session_id);

      // 3️⃣ Obține meniul
      const [menuResult] = await connection.query(
        "SELECT id, name, description, price, type, visible, image FROM menu WHERE business_id = ?",
        [business_id]
      );

      console.log("✅ Query Result for menu:", menuResult);

      // 4️⃣ Obține menu-setup (INCLUDE coordonatele direct din această tabelă)
      const [menuSetupResult] = await connection.query(
        "SELECT id, bar_open, bar_close, kitchen_open, kitchen_close, receive_orders_together, confirm_orders, suspend_online_orders, coordinates FROM menu_setup WHERE business_id = ?",
        [business_id]
      );

      console.log("✅ Query Result for menu setup:", menuSetupResult);

      // Convertim JSON-ul din string în obiect
      let menuSetup = menuSetupResult.length > 0 ? menuSetupResult[0] : {};
      menuSetup.coordinates = menuSetup.coordinates ? JSON.parse(menuSetup.coordinates) : [];

      console.log("✅ Sending final response...");

      res.json({
        session_id,
        new_session: newSession,
        business_id,
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
