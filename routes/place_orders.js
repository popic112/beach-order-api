const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Importăm conexiunea DB

/**
 * 🟢 Plasare comandă (cu separare `bar` vs `kitchen`)
 * Endpoint: POST /api/place_orders
 */
router.post("/", async (req, res) => {
    const { business_id, qr_code, umbrella_number, order_items, payment_method, session_id, position_verified } = req.body;

    if (!position_verified) {
        return res.status(400).json({ success: false, message: "Poziția clientului nu a fost verificată!" });
    }

    if (!business_id || !qr_code || !umbrella_number || !order_items.length || !payment_method || !session_id) {
        return res.status(400).json({ success: false, message: "Toate câmpurile sunt necesare!" });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
        // 🔹 1️⃣ Calculăm totalul comenzii și determinăm `type` pentru fiecare produs
        let total_price = 0;
        for (const item of order_items) {
            const [rows] = await connection.execute(
                "SELECT price, type FROM menu WHERE id = ? AND business_id = ? AND visible = 1",
                [item.menu_item_id, business_id]
            );

            if (!rows.length) {
                throw new Error(`Produsul cu ID ${item.menu_item_id} nu există sau nu este disponibil.`);
            }

            total_price += rows[0].price * item.quantity;
            item.price = rows[0].price;
            item.type = rows[0].type; // 🟢 `bar` sau `kitchen`
        }

        // 🔹 2️⃣ Inserăm comanda în `orders` cu status inițial "pending"
        const [orderResult] = await connection.execute(
            "INSERT INTO orders (business_id, qr_code, umbrella_number, session_id, total_price, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
            [business_id, qr_code, umbrella_number, session_id, total_price, payment_method, "pending"]
        );

        const order_id = orderResult.insertId;

        // 🔹 3️⃣ Inserăm fiecare produs în `order_items`
        for (const item of order_items) {
            await connection.execute(
                "INSERT INTO order_items (order_id, menu_item_id, quantity, note, price, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [order_id, item.menu_item_id, item.quantity, item.note || null, item.price, item.type, "pending"]
            );
        }

        await connection.commit();
        connection.release();

        res.json({ success: true, message: "Comanda a fost plasată!", order_id });

    } catch (error) {
        await connection.rollback();
        connection.release();
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
