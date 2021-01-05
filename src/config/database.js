require("dotenv").config();
const fs = require('fs');
const path = require('path');

module.exports = {
  dialect: "postgres",
  dialectOptions: {
    ssl: true,
    key: fs.readFileSync(__dirname + '..', 'cert', 'key.pem').toString(),
    ca: fs.readFileSync(__dirname + '..', 'cert', 'csr.pem').toString(),
    cert: fs.readFileSync(__dirname + '..', 'cert', 'cert.pem').toString(),
  },
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  define: { timestamp: true, underscored: true },
};
