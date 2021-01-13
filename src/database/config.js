const fs = require('fs');
require("dotenv").config();

module.exports = {
  dialect: "postgres",
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
    ca: fs.readFileSync('src/cert/csr.pem').toString(),
    key: fs.readFileSync('src/cert/key.pem').toString(),
    cert: fs.readFileSync('src/cert/cert.pem').toString(),
  },
  url: process.env.DATABASE_URL,
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  define: { timestamp: true, underscored: true },
};
