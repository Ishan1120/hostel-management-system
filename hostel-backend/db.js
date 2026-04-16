const mysql = require('mysql2');

// create connection
const db = process.env.MYSQL_URL 
  ? mysql.createConnection(process.env.MYSQL_URL)
  : mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Ishan@2005',
      database: process.env.DB_NAME || 'hostel_management'
    });

// connect to database
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database');
  }
});

module.exports = db;
