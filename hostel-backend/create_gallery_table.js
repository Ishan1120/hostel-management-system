const db = require('./db');

const sql = `
CREATE TABLE IF NOT EXISTS gallery_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category ENUM('main','boys','girls') NOT NULL DEFAULT 'main',
  image_path VARCHAR(500) NOT NULL,
  caption VARCHAR(255) DEFAULT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

db.query(sql, (err) => {
  if (err) {
    console.error('ERROR:', err.message);
  } else {
    console.log('Gallery table created successfully');
  }
  db.end();
});
