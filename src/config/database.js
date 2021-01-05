require("dotenv").config();
const fs = require('fs');
const path = require('path');

module.exports = {
  dialect: "postgres",
  dialectOptions: {
    ssl: true,
    ca: fs.readFileSync('src/cert/csr.pem').toString(),
    key: fs.readFileSync('src/cert/key.pem').toString(),
    cert: fs.readFileSync('src/cert/cert.pem').toString(),
  },
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  define: { timestamp: true, underscored: true },
};
