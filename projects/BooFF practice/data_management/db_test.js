const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  password: "98user2i81",
  host: "localhost",
  port: "5432",
  database: "booff_data",
});

module.exports = pool;