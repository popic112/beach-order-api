router.get("/qrcode-to-business", async (req, res) => {
    console.log("🔹 GET /qrcode-to-business - Query Params:", req.query);
  
    try {
      const { qr_code } = req.query;
      if (!qr_code) {
        return res.status(400).json({ error: "qr_code este obligatoriu." });
      }
  
      console.log("🔹 Searching for qr_code:", qr_code);
  
      const connection = await pool.getConnection();
      try {
        const [result] = await connection.query(
          "SELECT business_id FROM qr_codes WHERE qr_code = ?",
          [qr_code]
        );
  
        console.log("🔹 Query Result:", result);
  
        if (result.length === 0) {
          return res.status(404).json({ error: "QR Code-ul nu este valid." });
        }
  
        res.json({ business_id: result[0].business_id });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("❌ Eroare la obținerea business_id:", error);
      res.status(500).json({ error: "Eroare internă la server." });
    }
  });
  