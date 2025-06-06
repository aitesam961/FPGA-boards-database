const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/fpga.db');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const params = url.searchParams;

    switch (url.pathname) {
      case '/api/boards':
        // Build SQL query based on filters
        let query = `SELECT * FROM boards WHERE 1=1`;
        const filters = [];
        
        if (params.get('family')) {
          query += ` AND fpga_family = ?`;
          filters.push(params.get('family'));
        }
        
        if (params.get('max_price')) {
          query += ` AND price <= ?`;
          filters.push(parseFloat(params.get('max_price')));
        }
        
        // Add pagination
        const limit = params.get('limit') || 20;
        const offset = params.get('offset') || 0;
        query += ` LIMIT ? OFFSET ?`;
        filters.push(limit, offset);
        
        db.all(query, filters, (err, rows) => {
          if (err) throw err;
          res.end(JSON.stringify(rows));
        });
        break;
        
      case '/api/export':
        // CSV export
        db.all(`SELECT * FROM boards`, [], (err, rows) => {
          if (err) throw err;
          const csv = rows.map(row => 
            `"${row.name}",${row.manufacturer},${row.fpga_family},${row.price},"${row.vendor_link}"`
          ).join('\n');
          
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename="fpga_boards.csv"');
          res.end('Name,Manufacturer,FPGA Family,Price,Vendor Link\n' + csv);
        });
        break;
        
      default:
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message }));
  }
};