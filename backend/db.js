const Pool = require('pg').Pool;

// Change according to your database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lab3db',
    password: 'aniket',
    port: 5432,
});

module.exports = pool;