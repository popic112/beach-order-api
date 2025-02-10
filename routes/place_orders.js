const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Importăm conexiunea DB

/**
 * 🟢 Plasare comandă (cu preluarea `umbrella_number` din `qr_codes`)
 * Endpoint: POST /api/place_orders
 */
router.post("/", async (req, res) => {
<<<<<<< HEAD
    const { business_id, qr_code, order_items, payment_method, session_id, position_verified } = req.body;
=======
    const { business_id, qr_code, umbrella_number, order_items, payment_method, session_id, position_verified } = req.body;
>>>>>>> parent of 87bf8e2 (Update place_orders.js)

    if (!position_verified) {
        return res.status(400).json({ success: false, message: "Poziția clientului nu a fost verificată!" });
    }

<<<<<<< HEAD
    if (!business_id || !qr_code || !order_items.length || !payment_method || !session_id) {
=======
    if (!business_id || !qr_code || !umbrella_number || !order_items.length || !payment_method || !session_id) {
>>>>>>> parent of 87bf8e2 (Update place_orders.js)
        return res.status(400).json({ success: false, message: "Toate câmpurile sunt necesare!" });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
<<<<<<< HEAD
        // 🔹 1️⃣ Găsim `umbrella_number` asociat cu `qr_code`
        const [umbrellaResult] = await connection.execute(
            "SELECT umbrella_number FROM qr_codes WHERE qr_code = ? AND business_id = ?",
            [qr_code, business_id]
        );

        if (umbrellaResult.length === 0) {
            throw new Error(`⚠️ Nu s-a găsit o umbrelă pentru acest QR Code: ${qr_code}`);
        }

        const umbrella_number = umbrellaResult[0].umbrella_number;
        console.log(`🌂 Umbrella Number găsit: ${umbrella_number}`);

        // 🔹 2️⃣ Calculăm totalul comenzii și determinăm `type` pentru fiecare produs
=======
        // 🔹 1️⃣ Calculăm totalul comenzii și determinăm `type` pentru fiecare produs
>>>>>>> parent of 87bf8e2 (Update place_orders.js)
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

<<<<<<< HEAD
        // 🔹 3️⃣ Inserăm comanda în `orders` cu status inițial "pending"
=======
        // 🔹 2️⃣ Inserăm comanda în `orders` cu status inițial "pending"
>>>>>>> parent of 87bf8e2 (Update place_orders.js)
        const [orderResult] = await connection.execute(
            "INSERT INTO orders (business_id, qr_code, umbrella_number, session_id, total_price, payment_method, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
            [business_id, qr_code, umbrella_number, session_id, total_price, payment_method, "pending"]
        );

        const order_id = orderResult.insertId;

<<<<<<< HEAD
        // 🔹 4️⃣ Inserăm fiecare produs în `order_items`
=======
        // 🔹 3️⃣ Inserăm fiecare produs în `order_items`
>>>>>>> parent of 87bf8e2 (Update place_orders.js)
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
