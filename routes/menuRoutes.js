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
 * 🟢 Obține meniul pe baza slug-ului
 * Endpoint: GET /dashboard/menu-by-slug/:slug
 */
 router.get("/menu-by-slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: "Slug-ul este obligatoriu." });
    }

    // Obține business_id pe baza slug-ului
    const [businessResult] = await pool.query(
      "SELECT id FROM businesses WHERE slug = ?",
      [slug]
    );

    if (businessResult.length === 0) {
      return res.status(404).json({ error: "Business-ul nu există." });
    }

    const business_id = businessResult[0].id;

    // Obține meniul bazat pe business_id
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
  try {
    const { business_id, name, description, price, type, visible, image } = req.body;
    if (!business_id || !name || !price || !type) {
      return res.status(400).json({ error: "Toate câmpurile sunt obligatorii." });
    }

    const [result] = await pool.query(
      "INSERT INTO menu (business_id, name, description, price, type, visible, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [business_id, name, description, price, type, visible, image]
    );

    res.json({ success: true, message: "Produs adăugat în meniu.", menu_item_id: result.insertId });
  } catch (error) {
    console.error("Eroare la adăugare produs:", error);
    res.status(500).json({ error: "Eroare internă la server." });
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

    const [result] = await pool.query(
      "UPDATE menu SET name = ?, description = ?, price = ?, visible = ? WHERE id = ?",
      [name, description, price, visible, menu_item_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produsul nu a fost găsit." });
    }

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

    const [result] = await pool.query("DELETE FROM menu WHERE id = ?", [menu_item_id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produsul nu a fost găsit." });
    }

    res.json({ success: true, message: "Produsul a fost șters." });
  } catch (error) {
    console.error("Eroare la ștergerea produsului:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 5. Ștergere toate produsele dintr-un business
 * Endpoint: DELETE /dashboard/menu/delete-all
 */
router.delete("/menu/delete-all", async (req, res) => {
  try {
    const { business_id } = req.body;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    const [result] = await pool.query("DELETE FROM menu WHERE business_id = ?", [business_id]);
    res.json({ success: true, message: `${result.affectedRows} produse au fost șterse.` });
  } catch (error) {
    console.error("Eroare la ștergerea produselor:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 6. Ștergere produse selectate
 * Endpoint: DELETE /dashboard/menu/delete-select
 */
router.delete("/menu/delete-select", async (req, res) => {
  try {
    const { menu_item_ids } = req.body;
    if (!Array.isArray(menu_item_ids) || menu_item_ids.length === 0) {
      return res.status(400).json({ error: "Trebuie să trimiți un array cu ID-uri valide." });
    }

    const placeholders = menu_item_ids.map(() => "?").join(", ");
    const [result] = await pool.query(`DELETE FROM menu WHERE id IN (${placeholders})`, menu_item_ids);

    res.json({ success: true, message: `${result.affectedRows} produse au fost șterse.` });
  } catch (error) {
    console.error("Eroare la ștergerea produselor selectate:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;