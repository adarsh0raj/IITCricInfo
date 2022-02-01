const Pool = require('pg').Pool;

// Change according to your database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'temp',
    password: 'adarsh',
    port: 5432,
});

module.exports = pool;