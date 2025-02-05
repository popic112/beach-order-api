require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");

const pool = require("./config/db"); // Importă conexiunea la DB la început

const qrRoutes = require("./routes/qrRoutes");

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Beach Order API Running! 🚀");
});

app.use("/api/qrcodes", qrRoutes);

console.log("✅ Rutele încărcate:");
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`- ${middleware.route.stack[0].method.toUpperCase()} ${middleware.route.path}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});

pool.query("SELECT 1")
  .then(() => console.log("✅ Conectat la DB!"))
  .catch((err) => console.error("❌ Conexiunea la DB a eșuat:", err));
