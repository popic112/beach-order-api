const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * 🟢 Obține business_id, meniul și menu setup pe baza unui QR Code
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
        "SELECT id, name, description, price, type, visible, image FROM menu WHERE business_id = ?",
        [business_id]
      );

      console.log("🔹 Query Result for menu:", menuResult);

      // 3️⃣ Obținem menu-setup pentru business_id
      const [menuSetupResult] = await connection.query(
        "SELECT id, bar_open, bar_close, kitchen_open, kitchen_close, receive_orders_together, confirm_orders, suspend_online_orders FROM menu_setup WHERE business_id = ?",
        [business_id]
      );

      console.log("🔹 Query Result for menu setup:", menuSetupResult);

      // 4️⃣ Obținem coordonatele aferente business_id
      const [coordinatesResult] = await connection.query(
        "SELECT corner_number, latitude, longitude FROM coordinates WHERE business_id = ?",
        [business_id]
      );

      console.log("🔹 Query Result for coordinates:", coordinatesResult);

      // Verificăm dacă `menu_setup` există, altfel returnăm un obiect gol
      let menuSetup = menuSetupResult.length > 0 ? menuSetupResult[0] : {};

      // Adăugăm coordonatele în `menu_setup`
      menuSetup.coordinates = coordinatesResult.length > 0 ? coordinatesResult : [];

      res.json({
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
