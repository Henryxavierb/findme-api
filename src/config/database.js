require("dotenv").config();

module.exports = {
  dialect: "postgres",
  database: process.env.DATABASE,
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  define: { timestamp: true, underscored: true },
  ssl: true,
};
