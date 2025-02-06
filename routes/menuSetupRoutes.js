const express = require("express");
const router = express.Router();
const pool = require("../config/db");

/**
 * 🟢 API pentru inițializarea setup-ului meniului
 * Verifică dacă business_id există, altfel îl creează
 */
router.post("/initialize", async (req, res) => {
    try {
        const { business_id } = req.body;
        if (!business_id) {
            return res.status(400).json({ error: "business_id este obligatoriu." });
        }

        const [rows] = await pool.query("SELECT business_id FROM menu_setup WHERE business_id = ?", [business_id]);
        if (rows.length === 0) {
            await pool.query("INSERT INTO menu_setup (business_id) VALUES (?)", [business_id]);
            console.log(`✅ Inserat business_id = ${business_id} în menu_setup`);
        }

        res.json({ success: true, message: "Setup-ul meniului este inițializat." });
    } catch (error) {
        console.error("❌ Eroare la inițializarea setup-ului meniului:", error);
        res.status(500).json({ error: "Eroare internă la server." });
    }
});

/**
 * 🟢 Funcție pentru a verifica și insera `business_id` dacă nu există
 */
const ensureBusinessExists = async (business_id) => {
    const [rows] = await pool.query("SELECT business_id FROM menu_setup WHERE business_id = ?", [business_id]);
    if (rows.length === 0) {
        await pool.query("INSERT INTO menu_setup (business_id) VALUES (?)", [business_id]);
        console.log(`✅ Inserat business_id = ${business_id} în menu_setup`);
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

        // Convertim coordonatele JSON în obiect
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
        const [updateResult] = await pool.query(
            "UPDATE menu_setup SET coordinates = ? WHERE business_id = ?",
            [coordinatesJson, business_id]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(500).json({ error: "UPDATE a eșuat, nicio linie afectată." });
        }

        console.log("✅ Coordonate salvate:", coordinatesJson);
        res.json({ success: true, message: "Coordonatele locației au fost salvate." });
    } catch (error) {
        console.error("❌ Eroare la setarea coordonatelor:", error);
        res.status(500).json({ error: "Eroare internă la server." });
    }
});

module.exports = router;
