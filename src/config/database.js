require("dotenv").config();
const fs = require('fs');

module.exports = {
  dialect: "postgres",
  dialectOptions: {
    ssl: true,
    ca: fs.readFileSync('../cert/csr.pem').toString(),
    key: fs.readFileSync('../cert/key.pem').toString(),
    cert: fs.readFileSync('../cert/cert.pem').toString(),
  },
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  define: { timestamp: true, underscored: true },
};
