document.addEventListener('DOMContentLoaded', async () => {
    // Load SQL.js
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    // Load database
    const response = await fetch('fpga_boards.db');
    const arrayBuffer = await response.arrayBuffer();
    const db = new SQL.Database(new Uint8Array(arrayBuffer));
    
    // Initialize with all boards
    displayResults(db, "SELECT * FROM boards");

    // Setup search
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
});

function displayResults(db, query) {
    try {
        const results = db.exec(query);
        const tbody = document.querySelector('#results-table tbody');
        tbody.innerHTML = '';
        
        if (!results.length) {
            tbody.innerHTML = '<tr><td colspan="6">No boards found</td></tr>';
            return;
        }
        
        results[0].values.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>