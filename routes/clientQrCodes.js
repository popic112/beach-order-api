const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid"); // ✅ Importă generatorul de UUID

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
      // 1️⃣ Obține `business_id`, `business_name` și `umbrella_number`
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

      // 2️⃣ Dacă `session_id` lipsește, generăm unul nou și îl salvăm în DB
      if (!session_id || session_id === "undefined") {
        session_id = uuidv4();
        console.log("🔹 Generăm un nou session_id:", session_id);
        await connection.query("INSERT INTO sessions (session_id) VALUES (?)", [session_id]);
      }

      // 3️⃣ Obține meniul pentru acest business
      const [menuItems] = await connection.query(
        `SELECT id, name, description, price, type, visible 
         FROM menu 
         WHERE business_id = ? AND visible = 1`,
        [business_id]
      );

      // 4️⃣ Obține coordonatele și orele de funcționare
      const [menuSetup] = await connection.query(
        `SELECT bar_open, bar_close, kitchen_open, kitchen_close, coordinates 
         FROM menu_setup 
         WHERE business_id = ? LIMIT 1`,
        [business_id]
      );

      let bar_open = null, bar_close = null, kitchen_open = null, kitchen_close = null, coordinates = [];
      if (menuSetup.length > 0) {
        bar_open = menuSetup[0].bar_open;
        bar_close = menuSetup[0].bar_close;
        kitchen_open = menuSetup[0].kitchen_open;
        kitchen_close = menuSetup[0].kitchen_close;

        try {
          coordinates = JSON.parse(menuSetup[0].coordinates); // ✅ Parsăm JSON-ul cu coordonatele
        } catch (error) {
          console.error("❌ Eroare la parsarea coordonatelor:", error);
        }
      }

      // 5️⃣ Construim și trimitem răspunsul final
      res.json({
        business_name,
        qr_code,
        umbrella_number,
        business_id,
        session_id, // ✅ Acum returnăm session_id
        menu: menuItems.length > 0 ? menuItems : [],
        bar_open,
        bar_close,
        kitchen_open,
        kitchen_close,
        coordinates
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
