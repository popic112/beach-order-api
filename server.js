require("dotenv").config({ path: "./.env" });
const pool = require("./config/db");
const express = require("express");
const cors = require("cors");

const qrRoutes = require("./routes/qrRoutes");
const menuRoutes = require("./routes/menuRoutes");
const menuSetupRoutes = require("./routes/menuSetupRoutes");
const clientQrRoutes = require("./routes/clientQrCodes"); // 🔥 Importăm noul fișier de rute

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Beach Order API Running! 🚀");
});

// 🔗 Înregistrăm toate rutele pentru QR Codes (Dashboard)
app.use("/api/qrcodes", qrRoutes);

// 🔗 Înregistrăm toate rutele pentru client (QR Code → Business ID)
app.use("/api/client", clientQrRoutes); // 🔥 Adăugat API-ul pentru client

// 🔗 Înregistrăm toate rutele pentru meniu
app.use("/dashboard", menuRoutes);

// 🔗 Înregistrăm toate rutele pentru setările meniului și comenzilor
app.use("/dashboard/menu-setup", menuSetupRoutes);

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
