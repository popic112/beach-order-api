require("dotenv").config({ path: "./.env" });
const mysql = require("mysql2/promise");

async function testDB() {
    try {
        console.log("🔍 Încercăm conectarea la baza de date...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log("✅ Conexiunea la baza de date funcționează!");
        await connection.end();
    } catch (error) {
        console.error("❌ Eroare la conectare:");
        console.error("   ➜ Cod eroare:", error.code);
        console.error("   ➜ Mesaj:", error.message);
        console.error("   ➜ Stack:", error.stack);
    }
}

testDB();
