require("dotenv").config();
const fs = require('fs')
const path = require('path')

module.exports = {
  ssl: true,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      key: fs.readFileSync(path.join(__dirname, '..', 'cert', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, '..', 'cert', 'cert.pem')),
    },
    rejectUnauthorized: false
  },
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  define: { timestamp: true, underscored: true },
};
