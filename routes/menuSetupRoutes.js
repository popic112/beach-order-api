const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * 🟢 Funcție pentru a verifica și insera `business_id` dacă nu există
 */
const ensureBusinessExists = async (business_id) => {
  const [existing] = await pool.query(
    "SELECT id FROM menu_setup WHERE business_id = ?",
    [business_id]
  );

  if (existing.length === 0) {
    await pool.query(
      "INSERT INTO menu_setup (business_id) VALUES (?)",
      [business_id]
    );
  }
};

/**
 * 🟢 1. Obținerea setărilor meniului
 */
router.get("/", async (req, res) => {
  try {
    const { business_id } = req.query;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    const [settings] = await pool.query("SELECT * FROM menu_setup WHERE business_id = ?", [business_id]);
    if (!settings.length) {
      return res.status(404).json({ error: "Setările meniului nu au fost găsite." });
    }

    const parsedSettings = settings[0];
    parsedSettings.coordinates = parsedSettings.coordinates ? JSON.parse(parsedSettings.coordinates) : [];

    res.json(parsedSettings);
  } catch (error) {
    console.error("❌ Eroare la obținerea setărilor meniului:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 2. Setarea coordonatelor locației
 */
router.post("/set-coordinates", async (req, res) => {
  try {
    const { business_id, coordinates } = req.body;

    if (!business_id || !coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({ error: "Date invalide." });
    }

    await ensureBusinessExists(business_id);

    const coordinatesJson = JSON.stringify(coordinates);

    await pool.query(
      "UPDATE menu_setup SET coordinates = ? WHERE business_id = ?",
      [coordinatesJson, business_id]
    );

    res.json({ success: true, message: "Coordonatele locației au fost salvate." });
  } catch (error) {
    console.error("❌ Eroare la setarea coordonatelor:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 3. Actualizarea intervalelor orare
 */
router.put("/set-hours", async (req, res) => {
  try {
    const { business_id, bar_open, bar_close, kitchen_open, kitchen_close } = req.body;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    await ensureBusinessExists(business_id);

    await pool.query(
      "UPDATE menu_setup SET bar_open = ?, bar_close = ?, kitchen_open = ?, kitchen_close = ? WHERE business_id = ?",
      [bar_open, bar_close, kitchen_open, kitchen_close, business_id]
    );

    res.json({ success: true, message: "Intervalele orare au fost actualizate." });
  } catch (error) {
    console.error("❌ Eroare la actualizarea intervalelor orare:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 4. Setarea modului de primire a comenzilor
 */
router.put("/set-order-mode", async (req, res) => {
  try {
    const { business_id, receive_orders_together } = req.body;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    await ensureBusinessExists(business_id);

    await pool.query("UPDATE menu_setup SET receive_orders_together = ? WHERE business_id = ?", [receive_orders_together, business_id]);
    res.json({ success: true, message: "Modul de primire a comenzilor a fost actualizat." });
  } catch (error) {
    console.error("❌ Eroare la setarea modului de primire a comenzilor:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 5. Setarea confirmării comenzilor
 */
router.put("/set-confirmation", async (req, res) => {
  try {
    const { business_id, confirm_orders } = req.body;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    await ensureBusinessExists(business_id);

    await pool.query("UPDATE menu_setup SET confirm_orders = ? WHERE business_id = ?", [confirm_orders, business_id]);
    res.json({ success: true, message: "Confirmarea comenzilor a fost activată." });
  } catch (error) {
    console.error("❌ Eroare la setarea confirmării comenzilor:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 6. Suspendarea comenzilor online
 */
router.put("/suspend-orders", async (req, res) => {
  try {
    const { business_id, suspend_online_orders } = req.body;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    await ensureBusinessExists(business_id);

    await pool.query("UPDATE menu_setup SET suspend_online_orders = ? WHERE business_id = ?", [suspend_online_orders, business_id]);
    res.json({ success: true, message: "Comenzile online au fost suspendate temporar." });
  } catch (error) {
    console.error("❌ Eroare la suspendarea comenzilor online:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
