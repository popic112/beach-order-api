const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Import conexiunea MySQL
const { v4: uuidv4 } = require("uuid");

// 🟢 Obținere lista QR Coduri existente
router.get("/list", async (req, res) => {
  try {
    const { business_id } = req.query;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    const [qrCodes] = await pool.query(
      "SELECT id, qr_code, umbrella_number FROM qr_codes WHERE business_id = ?",
      [business_id]
    );

    res.json({ business_id, qr_codes: qrCodes });
  } catch (error) {
    console.error("Eroare la obținerea QR Codes:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

// 🟢 Generare QR Coduri noi
router.post("/generate", async (req, res) => {
  try {
    const { business_id, count } = req.body;
    if (!business_id || !count || count <= 0) {
      return res.status(400).json({ error: "business_id și count sunt obligatorii." });
    }

    let generatedQrCodes = [];
    for (let i = 0; i < count; i++) {
      const qrCode = `B${business_id}-Q${uuidv4().split("-")[0]}`;
      const [result] = await pool.query(
        "INSERT INTO qr_codes (business_id, umbrella_number, qr_code) VALUES (?, NULL, ?)",
        [business_id, qrCode]
      );
      generatedQrCodes.push({ id: result.insertId, qr_code: qrCode, umbrella_number: null });
    }

    res.json({ success: true, generated_qr_codes: generatedQrCodes });
  } catch (error) {
    console.error("Eroare la generarea QR Codes:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

// 🟢 Editare QR Code pentru a adăuga numărul umbrelei
router.put("/update", async (req, res) => {
  try {
    const { qr_code_id, umbrella_number } = req.body;
    if (!qr_code_id || umbrella_number === undefined) {
      return res.status(400).json({ error: "qr_code_id și umbrella_number sunt obligatorii." });
    }

    const [result] = await pool.query(
      "UPDATE qr_codes SET umbrella_number = ? WHERE id = ?",
      [umbrella_number, qr_code_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "QR Code-ul nu a fost găsit." });
    }

    res.json({
      success: true,
      message: "QR Code-ul a fost actualizat.",
      updated_qr_code: { id: qr_code_id, umbrella_number },
    });
  } catch (error) {
    console.error("Eroare la actualizarea QR Code:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

// 🟢 Ștergere QR Code individual
router.delete("/delete", async (req, res) => {
  try {
    const { qr_code_id } = req.body;
    if (!qr_code_id) {
      return res.status(400).json({ error: "qr_code_id este obligatoriu." });
    }

    const [result] = await pool.query("DELETE FROM qr_codes WHERE id = ?", [qr_code_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "QR Code-ul nu a fost găsit." });
    }

    res.json({ success: true, message: `QR Code-ul ${qr_code_id} a fost șters.` });
  } catch (error) {
    console.error("Eroare la ștergerea QR Code:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

// 🟢 Ștergere QR Coduri în grup
router.delete("/delete-multiple", async (req, res) => {
  try {
    const { qr_code_ids } = req.body;
    if (!qr_code_ids || !Array.isArray(qr_code_ids) || qr_code_ids.length === 0) {
      return res.status(400).json({ error: "qr_code_ids trebuie să fie un array cu ID-uri valide." });
    }

    const [result] = await pool.query(
      `DELETE FROM qr_codes WHERE id IN (${qr_code_ids.map(() => "?").join(", ")})`,
      qr_code_ids
    );

    res.json({ success: true, message: `${result.affectedRows} QR Coduri au fost șterse.` });
  } catch (error) {
    console.error("Eroare la ștergerea multiplă a QR Codes:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

// 🟢 Ștergere toate QR Codurile dintr-un business
router.delete("/delete-all", async (req, res) => {
  try {
    const { business_id } = req.body;
    if (!business_id) {
      return res.status(400).json({ error: "business_id este obligatoriu." });
    }

    const [result] = await pool.query("DELETE FROM qr_codes WHERE business_id = ?", [business_id]);

    res.json({ success: true, message: `Toate QR Codurile pentru business-ul ${business_id} au fost șterse.` });
  } catch (error) {
    console.error("Eroare la ștergerea tuturor QR Codes:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
