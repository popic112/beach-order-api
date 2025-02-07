const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

/**
 * 🟢 Generare un ID de sesiune unic
 * Endpoint: GET /api/session/create
 */
router.get("/create", async (req, res) => {
  try {
    const session_id = uuidv4(); // Generăm un ID unic
    console.log("🔹 Generare session_id:", session_id);

    const connection = await pool.getConnection();
    try {
      await connection.query("INSERT INTO sessions (session_id) VALUES (?)", [session_id]);
      res.json({ session_id });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Eroare la crearea sesiunii:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

/**
 * 🟢 Verifică dacă un session_id există
 * Endpoint: GET /api/session/validate?session_id={session_id}
 */
 router.get("/validate", async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id) {
        return res.status(400).json({ error: "session_id este obligatoriu." });
      }
  
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.query(
          "SELECT session_id, created_at FROM sessions WHERE session_id = ?",
          [session_id]
        );
  
        if (result.length === 0) {
          return res.status(404).json({ error: "Sesiunea nu există." });
        }
  
        res.json({ valid: true, session: result[0] });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("❌ Eroare la verificarea sesiunii:", error);
      res.status(500).json({ error: "Eroare internă la server." });
    }
  });

/**
 * 🟢 Verifică dacă un session_id există
 * Endpoint: GET /api/session/validate?session_id={session_id}
 */
router.get("/validate", async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ error: "session_id este obligatoriu." });
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        "SELECT session_id, created_at FROM sessions WHERE session_id = ?",
        [session_id]
      );

      if (result.length === 0) {
        return res.status(404).json({ error: "Sesiunea nu există." });
      }

      res.json({ valid: true, session: result[0] });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("❌ Eroare la verificarea sesiunii:", error);
    res.status(500).json({ error: "Eroare internă la server." });
  }
});

module.exports = router;
