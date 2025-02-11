const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Conexiunea DB

/**
 * 🍹🍽 API pentru statusul comenzilor la bar și bucătărie
 * Endpoint: GET /api/orders/status
 */
router.get("/status", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        // 🔹 1️⃣ Numărăm produsele active în pregătire la bar și bucătărie
        const [result] = await connection.execute(`
            SELECT 
                oi.type, 
                COUNT(oi.id) AS total_items
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.status NOT IN ('completed', 'canceled') 
            GROUP BY oi.type;
        `);

        connection.release();

        // 🔹 2️⃣ Extragem numărul total de produse active
        let barItems = 0;
        let kitchenItems = 0;

        result.forEach(row => {
            if (row.type === "bar") barItems = row.total_items;
            if (row.type === "kitchen") kitchenItems = row.total_items;
        });

        // 🔹 3️⃣ Funcție pentru mesaje
        const getStatusMessage = (productCount, type) => {
            let section = type === "bar" ? "🍹 Barul" : "🍽 Bucătăria";

            if (productCount < 10) return `${section} deloc aglomerat. Servirea va fi rapidă! 🚀`;
            if (productCount < 20) return `${section} puțin aglomerat. Nu ar trebui să așteptați mult! 😊`;
            if (productCount < 30) return `${section} ușor aglomerat. Servirea ar trebui să fie ok. ⏳`;
            if (productCount < 50) return `${section} relativ aglomerat. Ai putea aștepta puțin mai mult. ⏰`;
            if (productCount < 75) return `${section} aglomerat. Pregătirea durează mai mult! ⚠️`;
            if (productCount < 100) return `${section} foarte aglomerat. Servirea produselor va dura! 🔥`;
            return `${section} extrem de aglomerat! Servirea poate dura considerabil mai mult! ⚠️`;
        };

        res.json({
            success: true,
            bar_status: getStatusMessage(barItems, "bar"),
            kitchen_status: getStatusMessage(kitchenItems, "kitchen")
        });

    } catch (error) {
        connection.release();
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
