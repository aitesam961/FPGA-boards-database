document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initializing database...");
    try {
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        console.log("SQL.js loaded");

        // Use absolute path for GitHub Pages
        const dbPath = window.location.hostname === 'aitesam961.github.io'
            ? '/FPGA-boards-database/fpga_boards.db'
            : 'fpga_boards.db';

        console.log("Loading database from:", dbPath);
        const response = await fetch(dbPath);
        
        if (!response.ok) {
            throw new Error(`Database fetch failed: ${response.status} ${response.statusText}`);
        }
        
        console.log(`Database status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        console.log(`Received ${arrayBuffer.byteLength} bytes`);
        
        const db = new SQL.Database(new Uint8Array(arrayBuffer));
        console.log("Database loaded successfully");
        
        // Test query to check tables
        const testQuery = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        console.log("Tables in database:", testQuery);
        
        // Initial display of all boards
        displayResults(db, "SELECT * FROM boards");

        // Setup search button
        document.getElementById('search-btn').addEventListener('click', () => {
            const minPrice = document.getElementById('min-price').value || 0;
            const maxPrice = document.getElementById('max-price').value || 1000000;
            const minLogic = document.getElementById('min-logic').value || 0;
            const maxLogic = document.getElementById('max-logic').value || 10000000;
            
            const query = `
                SELECT * FROM boards 
                WHERE price BETWEEN ${minPrice} AND ${maxPrice}
                AND logic_elements BETWEEN ${minLogic} AND ${maxLogic}
            `;
            
            console.log("Executing query:", query);
            displayResults(db, query);
        });

    } catch (error) {
        console.error("Initialization failed:", error);
        document.querySelector('#results-table tbody').innerHTML = 
            `<tr><td colspan="6">Error: ${error.message}</td></tr>`;
    }
});

function displayResults(db, query) {
    try {
        const results = db.exec(query);
        console.log("Query results:", results);
        
        const tbody = document.querySelector('#results-table tbody');
        tbody.innerHTML = '';
        
        if (!results.length || !results[0].values.length) {
            tbody.innerHTML = '<tr><td colspan="6">No boards found</td></tr>';
            return;
        }
        
        // Get column names
        const columns = results[0].columns;
        console.log("Columns:", columns);
        
        results[0].values.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row[columns.indexOf('name')]}</td>
                <td>${row[columns.indexOf('manufacturer')]}</td>
                <td>$${parseFloat(row[columns.indexOf('price')]).toLocaleString()}</td>
               