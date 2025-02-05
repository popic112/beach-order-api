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
console.log("✅ Rutele încărcate:");
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`- ${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
  }
});

// app.use("/api/orders", orderRoutes);
// app.use("/api/users", userRoutes);

// Pornim serverul
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

const pool = require("./config/db"); // Importă conexiunea DB

pool.query("SELECT 1", (err, results) => {
    if (err) {
        console.error("❌ Conexiunea la DB a eșuat:", err);
    } else {
        console.log("✅ Conectat la DB!");
    }
});

