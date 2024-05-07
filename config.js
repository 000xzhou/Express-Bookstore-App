/** Common config for bookstore. */
require("dotenv").config();

let DB_URI = process.env.DATABASE_URL;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}_test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}_test`;
}

module.exports = { DB_URI };
