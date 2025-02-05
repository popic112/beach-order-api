const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

/**
 * 🟢 1. Generare QR Coduri noi
 * Endpoint: POST /api/qrcodes/generate-qr
 */
router.post("/generate-qr", async (req, res) => {
  try {
    const { numCodes, business_id } = req.body;
    if (!numCodes || numCodes <= 0 || !business_id) {
      return res.status(400).json({ error: "Date invalide." });
    }

    let qrCodes = [];
    for (let i = 0; i < numCodes; i++) {
      const qrCode = uuidv4();
      await pool.query("INSERT INTO qr_codes (business_id, umbrella_number, qr_code) VALUES (?, NULL, ?)", 
        [business_id, qrCode]);

      qrCodes.push(qrCode);
    }

    res.json({ success: true, qrCodes });
  } catch (error) {
    console.error("Eroare:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 2. Obținere lista QR Coduri existente
 * Endpoint: GET /api/qrcodes/list?business_id=1
 */
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

/**
 * 🟢 3. Editare QR Code pentru a adăuga numărul umbrelei
 * Endpoint: PUT /api/qrcodes/update
 */
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

/**
 * 🟢 4. Ștergere QR Code individual
 * Endpoint: DELETE /api/qrcodes/delete
 */
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

module.exports = router;
