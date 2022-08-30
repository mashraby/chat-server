const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    "postgres://uinorwri:y_ai75ccF9B5bd_BSasndExBhljT0wPx@arjuna.db.elephantsql.com/uinorwri",
});

const fetch = async (SQL, ...params) => {
  const client = await pool.connect();
  try {
    const {
      rows: [row],
    } = await client.query(SQL, params.length ? params : null);
    return row;
  } finally {
    client.release();
  }
};

const fetchAll = async (SQL, ...params) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(SQL, params.length ? params : null);
    return rows;
  } finally {
    client.release();
  }
};

module.exports = {
  fetch,
  fetchAll,
};
