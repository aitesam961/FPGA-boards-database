document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let boards = [];
    const resultsCount = document.getElementById('results-count');
    const boardsContainer = document.getElementById('boards-container');
    
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Show loading state
    resultsCount.innerHTML = 'Loading data <div class="spinner"></div>';
    
    // Load data with cache busting
    fetch(`data/boards.json?t=${Date.now()}`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!data || !Array.isArray(data)) throw new Error('Invalid data format');
            boards = data;
            renderBoards(boards);
            setupDownloadButtons();
            resultsCount.textContent = `${boards.length} boards loaded`;
        })
        .catch(error => {
            console.error('Load error:', error);
            resultsCount.textContent = 'Data load failed';
            boardsContainer.innerHTML = `
                <div class="error-message">
                    <h3>Loading Error</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()">Retry</button>
                </div>
            `;
        });

    function renderBoards(boardsToRender) {
        boardsContainer.innerHTML = '';
        
        if (!boardsToRender || boardsToRender.length === 0) {
            boardsContainer.innerHTML = '<p class="no-results">No boards found</p>';
            return;
        }
        
        boardsToRender.forEach(board => {
            const card = document.createElement('div');
            card.className = 'board-card';
            
            // Board image placeholder
            const imgDiv = document.createElement('div');
            imgDiv.className = 'board-image';
            imgDiv.style.backgroundColor = getRandomColor();
            
            // Board info
            const infoDiv = document.createElement('div');
            infoDiv.className = 'board-info';
            
            // Create board elements (title, specs, etc.)
            infoDiv.innerHTML = `
                <h2>${board.name}</h2>
                <div class="board-meta">
                    <span class="manufacturer">${board.manufacturer || 'Unknown'}</span>
                    <span class="family">${board.family || ''}</span>
                </div>
                <div class="board-price">${board.typical_price_usd ? `$${board.typical_price_usd.toFixed(2)}` : 'Price N/A'}</div>
                ${renderSpecs(board)}
                ${renderPeripherals(board)}
                ${renderFeatures(board)}
                ${board.documentation_url ? `<a href="${board.documentation_url}" target="_blank" class="doc-link">Documentation</a>` : ''}
            `;
            
            card.appendChild(imgDiv);
            card.appendChild(infoDiv);
            boardsContainer.appendChild(card);
        });
    }
    
    function renderSpecs(board) {
        if (!board.logic_elements && !board.block_ram_kb) return '';
        return `
            <div class="specs">
                ${board.logic_elements ? `<div><span>Logic:</span> ${board.logic_elements.toLocaleString()}</div>` : ''}
                ${board.block_ram_kb ? `<div><span>Block RAM:</span> ${board.block_ram_kb} KB</div>` : ''}
                ${board.max_user_io ? `<div><span>I/O Pins:</span> ${board.max_user_io}</div>` : ''}
            </div>
        `;
    }
    
    function renderPeripherals(board) {
        if (!board.peripherals || board.peripherals.length === 0) return '';
        return `
            <div class="peripherals">
                <h3>Peripherals</h3>
                <div class="peripheral-list">
                    ${board.peripherals.map(p => 
                        `<span class="peripheral-tag" title="${p.notes || ''}">
                            ${p.name}${p.quantity > 1 ? ` (${p.quantity})` : ''}
                        </span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    function renderFeatures(board) {
        if (!board.features || board.features.length === 0) return '';
        return `
            <div class="features">
                <h3>Features</h3>
                <div class="feature-list">
                    ${board.features.map(f => 
                        `<span class="feature-tag">${f}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    function setupDownloadButtons() {
        document.getElementById('download-csv').addEventListener('click', () => {
            const csvContent = convertToCSV(boards);
            downloadFile(csvContent, 'fpga_boards.csv', 'text/csv');
        });
        
        document.getElementById('download-json').addEventListener('click', () => {
            downloadFile(JSON.stringify(boards, null, 2), 'fpga_boards.json', 'application/json');
        });
    }
    
    function convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const rows = data.map(obj => 
            headers.map(field => 
                JSON.stringify(obj[field], (_, val) => val === null ? '' : val)
            ).join(',')
        );
        return [headers.join(','), ...rows].join('\n');
    }
    
    function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function getRandomColor() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
});