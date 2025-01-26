// Import dependencies
const express = require("express");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const multer = require("multer");
const morgan = require("morgan");
const helmet = require("helmet");
require("dotenv").config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(morgan("combined")); // HTTP request logging
app.use(helmet()); // Secure HTTP headers

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

// Utility function: Parse CSV without libraries
const parseCSV = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const lines = data.trim().split("\n");
    const headers = lines[0].split(",");

    return lines.slice(1).map((line) => {
      const values = line.split(",");
      const obj = {};

      headers.forEach((header, index) => {
        const keys = header.split(".");
        let current = obj;

        keys.forEach((key, i) => {
          if (i === keys.length - 1) {
            current[key] = values[index]?.trim();
          } else {
            current[key] = current[key] || {};
            current = current[key];
          }
        });
      });

      return obj;
    });
  } catch (error) {
    throw new Error("Error parsing CSV file.");
  }
};

// Database utility function: Insert users into MySQL
const insertUsersIntoDB = async (users) => {
  const connection = await pool.getConnection();

  try {
    const query = `
      INSERT INTO users (first_name, last_name, age, email, additional_info)
      VALUES (?, ?, ?, ?, ?)
    `;
    const insertPromises = users.map((user) =>
      connection.execute(query, [
        user.name?.firstName || "Unknown",
        user.name?.lastName || "Unknown",
        parseInt(user.age, 10) || null,
        user.email || null,
        JSON.stringify(user.additional_info || {}),
      ])
    );

    await Promise.all(insertPromises);
  } catch (error) {
    console.error("Error inserting users into database:", error);
    throw new Error("Database insertion failed.");
  } finally {
    connection.release();
  }
};

// Route handler: Upload CSV and insert into MySQL table
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const filePath = path.join(__dirname, req.file.path);

  try {
    const users = parseCSV(filePath);
    await insertUsersIntoDB(users);
    fs.unlinkSync(filePath); // Clean up uploaded file
    res.status(200).json({ message: "CSV uploaded and data inserted successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error processing CSV file." });
  }
});

// Database utility function: Generate age distribution report
const generateAgeDistributionReport = async () => {
  try {
    const query = `
      SELECT 
        CASE 
          WHEN age < 18 THEN 'Under 18'
          WHEN age BETWEEN 18 AND 35 THEN '18-35'
          WHEN age BETWEEN 36 AND 50 THEN '36-50'
          ELSE '51+'
        END AS age_group,
        COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users) AS percentage
      FROM users
      GROUP BY age_group;
    `;

    const [rows] = await pool.query(query);
    return rows;
  } catch (error) {
    console.error("Error generating age distribution report:", error);
    throw new Error("Report generation failed.");
  }
};

// Route handler: Generate age distribution report
app.get("/report/age-distribution", async (req, res) => {
  try {
    const report = await generateAgeDistributionReport();
    res.status(200).json(report);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error generating report." });
  }
});

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("\nShutting down server...");
  pool.end(() => {
    console.log("Database connection pool closed.");
    process.exit(0);
  });
};

// Handle termination signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


