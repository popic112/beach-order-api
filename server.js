require("dotenv").config({ path: "./.env" });
const pool = require("./config/db"); // ← Mutat la început!
const express = require("express");
const cors = require("cors");

const qrRoutes = require("./routes/qrRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Beach Order API Running! 🚀");
});

app.use("/api/qrcodes", qrRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

// Test conexiune DB la pornire
pool.query("SELECT 1")
  .then(() => console.log("✅ Conectat la DB!"))
  .catch((err) => console.error("❌ Conexiunea la DB a eșuat:", err));
