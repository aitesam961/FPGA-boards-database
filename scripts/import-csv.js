const fs = require('fs');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/fpga.db');

// Process CSV file
fs.createReadStream('./data/boards.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Insert board
    db.run(`INSERT INTO boards (name, manufacturer, fpga_family, price, vendor_link)
            VALUES (?, ?, ?, ?, ?)`, 
            [row.name, row.manufacturer, row.fpga_family, row.price, row.vendor_link], 
            function(err) {
              if (err) return console.error(err.message);
              
              const boardId = this.lastID;
              
              // Process features
              row.features.split(';').forEach(feature => {
                feature = feature.trim();
                if (feature) {
                  // Insert or get existing feature
                  db.get(`SELECT id FROM features WHERE name = ?`, [feature], (err, row) => {
                    if (err) return console.error(err.message);
                    
                    let featureId;
                    if (row) {
                      featureId = row.id;
                    } else {
                      db.run(`INSERT INTO features (name) VALUES (?)`, [feature], function(err) {
                        if (err) return console.error(err.message);
                        featureId = this.lastID;
                        linkFeature();
                      });
                      return;
                    }
                    
                    linkFeature();
                    
                    function linkFeature() {
                      db.run(`INSERT OR IGNORE INTO board_features (board_id, feature_id)
                              VALUES (?, ?)`, [boardId, featureId]);
                    }
                  });
                }
              });
              
              // Repeat for peripherals and connectivity...
            });
  })
  .on('end', () => {
    console.log('CSV import completed');
    db.close();
  });