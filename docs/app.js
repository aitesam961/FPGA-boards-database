document.addEventListener('DOMContentLoaded', async () => {
    console.log("Initializing database...");
    try {
        // Load SQL.js
        const SQL = await initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        console.log("SQL.js loaded");

        // Determine database path
        const isGitHubPages = window.location.hostname === 'aitesam961.github.io';
        const dbPath = isGitHubPages 
            ? '/FPGA-boards-database/fpga_boards.db' 
            : 'fpga_boards.db';
        
        console.log("Database path:", dbPath);

        // Load database
        console.log("Fetching database...");
        const response = await fetch(dbPath);
        
        if (!response.ok) {
            throw new Error(`Database fetch failed: ${response.status} ${response.statusText}`);
        }
        
        console.log(`Response status: ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();
        console.log(`Received ${arrayBuffer.byteLength} bytes`);
        
        // Check if data looks like SQLite database
        const header = new Uint8Array(arrayBuffer, 0, 16);
        const headerStr = Array.from(header).map(b => String.fromCharCode(b)).join('');
        console.log("Database header:", headerStr);
        
        // Initialize database
        const db = new SQL.Database(new Uint8Array(arrayBuffer));
        console.log("Database initialized");
        
        // Test query to verify database content
        console.log("Executing test query...");
        const testResult = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
        console.log("Tables in database:", testResult);
        
        // Check for boards table
        const hasBoardsTable = testResult.length > 0 && 
                               testResult[0].values.some(row => row[0] === 'boards');
        console.log("Has boards table:", hasBoardsTable);
        
        if (!hasBoardsTable) {
            throw new Error("Boards table not found in database");
        }
        
        // Get row count
        const countResult = db.exec("SELECT COUNT(*) AS count FROM boards");
        const rowCount = countResult[0].values[0][0];
        console.log(`Number of boards: ${rowCount}`);
        
        // Initial display
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
        console.log("Executing query:", query);
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
        
        // Display each row
        results[0].values.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row[columns.indexOf('name')]}</td>
                <td>${row[columns.indexOf('manufacturer')]}</td>
                <td>$${parseFloat(row[columns.indexOf('price')]).toLocaleString()}</td>
                <td>${parseInt(row[columns.indexOf('logic_elements')]).toLocaleString()}</td>
                <td>${parseInt(row[columns.indexOf('memory_kb')]).toLocaleString()} KB</td>
                <td>${parseInt(row[columns.indexOf('dsp_blocks')]).toLocaleString()}</td>
            `;
            tbody.appendChild(tr);
        });
        
        console.log(`Displayed ${results[0].values.length} boards`);
    } catch (error) {
        console.error('Query error:', error);
        document.querySelector('#results-table tbody').innerHTML = 
            `<tr><td colspan="6">Query error: ${error.message}</td></tr>`;
    }
}