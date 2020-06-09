require("dotenv").config();

module.exports = {
  host: process.env.DATABASE_HOST,
  dialect: "postgres",
  database: process.env.DATABASE,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  define: {
    timestamp: true,
    underscored: true,
  },
};
