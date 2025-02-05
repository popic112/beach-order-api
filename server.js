require("dotenv").config({ path: "./.env" });
const pool = require("./config/db");
const express = require("express");
const cors = require("cors");

const qrRoutes = require("./routes/qrRoutes");
const menuRoutes = require("./routes/menuRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Beach Order API Running! 🚀");
});

// 🔗 Înregistrăm toate rutele pentru QR Codes
app.use("/api/qrcodes", qrRoutes);

// 🔗 Înregistrăm toate rutele pentru meniu
app.use("/dashboard", menuRoutes);

const PORT = process.env.PORT || 4000;

// 🛠 Afișează toate rutele disponibile în terminal
console.log("📡 Rute disponibile:");
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`➡️  ${r.route.stack[0].method.toUpperCase()} ${r.route.path}`);
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

// ✅ Test conexiune DB la pornire
pool.query("SELECT 1")
  .then(() => console.log("✅ Conectat la DB!"))
  .catch((err) => console.error("❌ Conexiunea la DB a eșuat:", err));
