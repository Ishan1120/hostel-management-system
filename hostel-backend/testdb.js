const mysql = require("mysql2");
const db = mysql.createConnection("mysql://root:qknGsOFLecvGZjSeYlVsXnTWyMIOwtvx@monorail.proxy.rlwy.net:48255/railway");
db.query("SHOW TABLES", (err, results) => {
  if (err) console.error(err);
  console.log(results);
  db.end();
});
