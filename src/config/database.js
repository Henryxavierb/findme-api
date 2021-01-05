require("dotenv").config();

module.exports = {
  ssl: true,
  dialect: "postgres",
  url: process.env.DATABASE_URL,
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  define: { timestamp: true, underscored: true },
};
