const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./.env" });


const qrRoutes = require("./routes/qrRoutes"); // Importăm ruta QR Codes
// const orderRoutes = require("./routes/orders"); // Comentează dacă nu e implementat
// const userRoutes = require("./routes/users");   // Comentează dacă nu e implementat

const app = express(); // ✅ Inițializăm Express
app.use(express.json()); // ✅ Permite procesarea JSON în request-uri
app.use(cors()); // ✅ Permite cereri de la orice origine

app.get("/", (req, res) => {
  res.send("Beach Order API Running! 🚀");
});

// 🔗 Conectăm rutele API
app.use("/api/qrcodes", qrRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/users", userRoutes);

// Pornim serverul
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
