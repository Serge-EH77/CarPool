require('dotenv').config();

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

(async () => {
  try {
    const conn = await db.getConnection();
    console.log("MySQL connected");
    conn.release();
  } catch (err) {
    console.error("DB connection error:", err);
  }
})();

app.listen(5001, "0.0.0.0", () => {
  console.log("Server running on port 5001");
});
