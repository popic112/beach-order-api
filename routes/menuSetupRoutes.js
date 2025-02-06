const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * 🟢 1. Obținerea setărilor meniului
 * Endpoint: GET /dashboard/menu-setup
 */
router.get("/menu-setup", async (req, res) => {
  try {
    const { business_id } = req.query;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    const [settings] = await pool.query("SELECT * FROM menu_setup WHERE business_id = ?", [business_id]);
    if (!settings.length) {
      return res.status(404).json({ error: "Setările meniului nu au fost găsite." });
    }

    res.json(settings[0]);
  } catch (error) {
    console.error("❌ Eroare la obținerea setărilor meniului:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 2. Setarea coordonatelor locației
 * Endpoint: POST /dashboard/menu-setup/set-coordinates
 */
router.post("/menu-setup/set-coordinates", async (req, res) => {
  try {
    const { business_id, coordinates } = req.body;
    if (!business_id || !coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({ error: "Date invalide." });
    }

    await pool.query("DELETE FROM location_coordinates WHERE business_id = ?", [business_id]);
    for (const coord of coordinates) {
      await pool.query("INSERT INTO location_coordinates (business_id, corner_number, latitude, longitude) VALUES (?, ?, ?, ?)",
        [business_id, coord.corner_number, coord.latitude, coord.longitude]
      );
    }

    res.json({ success: true, message: "Coordonatele locației au fost salvate." });
  } catch (error) {
    console.error("❌ Eroare la setarea coordonatelor:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 3. Actualizarea intervalelor orare
 * Endpoint: PUT /dashboard/menu-setup/set-hours
 */
router.put("/menu-setup/set-hours", async (req, res) => {
  try {
    const { business_id, bar_open, bar_close, kitchen_open, kitchen_close } = req.body;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

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
 * Endpoint: PUT /dashboard/menu-setup/set-order-mode
 */
router.put("/menu-setup/set-order-mode", async (req, res) => {
  try {
    const { business_id, receive_orders_together } = req.body;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    await pool.query("UPDATE menu_setup SET receive_orders_together = ? WHERE business_id = ?", [receive_orders_together, business_id]);
    res.json({ success: true, message: "Modul de primire a comenzilor a fost actualizat." });
  } catch (error) {
    console.error("❌ Eroare la setarea modului de primire a comenzilor:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 5. Setarea confirmării comenzilor
 * Endpoint: PUT /dashboard/menu-setup/set-confirmation
 */
router.put("/menu-setup/set-confirmation", async (req, res) => {
  try {
    const { business_id, confirm_orders } = req.body;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    await pool.query("UPDATE menu_setup SET confirm_orders = ? WHERE business_id = ?", [confirm_orders, business_id]);
    res.json({ success: true, message: "Confirmarea comenzilor a fost activată." });
  } catch (error) {
    console.error("❌ Eroare la setarea confirmării comenzilor:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 6. Suspendarea comenzilor online
 * Endpoint: PUT /dashboard/menu-setup/suspend-orders
 */
router.put("/menu-setup/suspend-orders", async (req, res) => {
  try {
    const { business_id, suspend_online_orders } = req.body;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    await pool.query("UPDATE menu_setup SET suspend_online_orders = ? WHERE business_id = ?", [suspend_online_orders, business_id]);
    res.json({ success: true, message: "Comenzile online au fost suspendate temporar." });
  } catch (error) {
    console.error("❌ Eroare la suspendarea comenzilor online:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
