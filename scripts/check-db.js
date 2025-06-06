const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/fpga.db');

db.all("SELECT * FROM boards", (err, rows) => {
  if (err) {
    console.error(err);
  } else {
    console.log('FPGA Boards in Database:');
    rows.forEach(row => {
      console.log(`${row.id}: ${row.name} (${row.manufacturer}) - $${row.price}`);
    });
  }
  db.close();
});