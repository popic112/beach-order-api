const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * 🟢 1. Obținere meniu
 * Endpoint: GET /dashboard/menu?business_id=1234
 */
router.get("/menu", async (req, res) => {
  try {
    const { business_id } = req.query;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    const [menu] = await pool.query(
      "SELECT id, name, description, price, type, visible FROM menu WHERE business_id = ?",
      [business_id]
    );

    res.json({ business_id, menu });
  } catch (error) {
    console.error("Eroare la obținerea meniului:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 2. Adăugare produs în meniu
 * Endpoint: POST /dashboard/menu/add
 */
 router.post("/menu/add", async (req, res) => {
    console.log("🔹 POST /menu/add - Request Body:", req.body);
  
    try {
      const { business_id, name, description, price, type, visible, image } = req.body;
  
      if (!business_id || !name || !price || !type) {
        console.log("❌ Eroare: Lipsesc date obligatorii.");
        return res.status(400).json({ error: "Toate câmpurile sunt obligatorii." });
      }
  
      console.log("✅ Datele sunt valide. Inserăm în DB...");
      const [result] = await pool.query(
        "INSERT INTO menu (business_id, name, description, price, type, visible, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [business_id, name, description, price, type, visible, image]
      );
  
      console.log("✅ Inserare reușită. ID produs:", result.insertId);
      res.json({ success: true, message: "Produs adăugat în meniu.", menu_item_id: result.insertId });
  
    } catch (error) {
      console.error("❌ Eroare la adăugare produs:", error);
      res.status(500).json({ error: "Eroare internă la server.", details: error.message });
    }
  });
  

/**
 * 🟢 3. Editare produs în meniu
 * Endpoint: PUT /dashboard/menu/update
 */
router.put("/menu/update", async (req, res) => {
  try {
    const { menu_item_id, name, description, price, visible } = req.body;
    if (!menu_item_id) {
      return res.status(400).json({ error: "menu_item_id este obligatoriu." });
    }

    await pool.query(
      "UPDATE menu SET name = ?, description = ?, price = ?, visible = ? WHERE id = ?",
      [name, description, price, visible, menu_item_id]
    );

    res.json({ success: true, message: "Produsul a fost actualizat." });
  } catch (error) {
    console.error("Eroare la actualizare produs:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 4. Ștergere produs din meniu
 * Endpoint: DELETE /dashboard/menu/delete
 */
router.delete("/menu/delete", async (req, res) => {
  try {
    const { menu_item_id } = req.body;
    if (!menu_item_id) {
      return res.status(400).json({ error: "menu_item_id este obligatoriu." });
    }

    await pool.query("DELETE FROM menu WHERE id = ?", [menu_item_id]);
    res.json({ success: true, message: "Produsul a fost șters." });
  } catch (error) {
    console.error("Eroare la ștergerea produsului:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 5. Toggle vizibilitate produs
 * Endpoint: PUT /dashboard/menu/toggle-visibility
 */
router.put("/menu/toggle-visibility", async (req, res) => {
  try {
    const { menu_item_id, visible } = req.body;
    if (!menu_item_id) {
      return res.status(400).json({ error: "menu_item_id este obligatoriu." });
    }

    await pool.query("UPDATE menu SET visible = ? WHERE id = ?", [visible, menu_item_id]);
    res.json({ success: true, message: visible ? "Produsul este acum vizibil." : "Produsul a fost suspendat." });
  } catch (error) {
    console.error("Eroare la toggle vizibilitate:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
