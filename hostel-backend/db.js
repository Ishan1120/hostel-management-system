const mysql = require('mysql2');

// Use a connection pool for production stability (handles dropped connections & concurrent requests)
const poolConfig = process.env.MYSQL_URL
  ? {
      uri: process.env.MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Ishan@2005',
      database: process.env.DB_NAME || 'hostel_management',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    };

const pool = process.env.MYSQL_URL
  ? mysql.createPool({ uri: process.env.MYSQL_URL, waitForConnections: true, connectionLimit: 10, queueLimit: 0 })
  : mysql.createPool(poolConfig);

// Test connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.code, '-', err.message);
  } else {
    console.log('✅ Connected to MySQL database (pool)');
    connection.release();
  }
});

module.exports = pool;
