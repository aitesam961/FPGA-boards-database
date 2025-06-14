document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Load board data
    let boards = [];
    let uniqueManufacturers = new Set();
    let uniqueFamilies = new Set();
    let uniquePeripherals = new Set();
    let uniqueFeatures = new Set();
    
    // DOM elements
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const logicRange = document.getElementById('logic-elements-range');
    const logicValue = document.getElementById('logic-elements-value');
    const sortSelect = document.getElementById('sort-by');
    const resetBtn = document.getElementById('reset-filters');
    const resultsCount = document.getElementById('results-count');
    const boardsContainer = document.getElementById('boards-container');
    
    // Initialize
    fetchData();
    
    async function fetchData() {
        try {
            const response = await fetch('data/boards.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            boards = await response.json();
            processData(boards);
            renderBoards(boards);
            renderFilters();
            attachEventListeners();
            addDownloadButtons();
        } catch (error) {
            console.error('Error loading board data:', error);
            showError(error);
        }
    }
    
    function processData(boards) {
        boards.forEach(board => {
            uniqueManufacturers.add(board.manufacturer);
            uniqueFamilies.add(board.family);
            
            board.peripherals.forEach(p => {
                uniquePeripherals.add(p.name);
            });
            
            board.features.forEach(feature => {
                uniqueFeatures.add(feature);
            });
        });
    }
    
    function renderFilters() {
        renderFilterOptions('manufacturer', uniqueManufacturers, 'manufacturer-filters');
        renderFilterOptions('family', uniqueFamilies, 'family-filters');
        renderFilterOptions('peripheral', uniquePeripherals, 'peripheral-filters');
        renderFilterOptions('feature', uniqueFeatures, 'feature-filters');
        
        // Initialize range display
        updateLogicRangeDisplay();
    }
    
    function renderFilterOptions(type, values, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        const sortedValues = Array.from(values).sort();
        sortedValues.forEach(value => {
            const div = document.createElement('div');
            div.className = 'filter-option';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `${type}-${value.replace(/\s+/g, '-').toLowerCase()}`;
            input.dataset.filterType = type;
            input.dataset.filterValue = value;
            
            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = value;
            
            div.appendChild(input);
            div.appendChild(label);
            container.appendChild(div);
        });
    }
    
    function renderBoards(filteredBoards) {
        boardsContainer.innerHTML = '';
        
        if (!filteredBoards || filteredBoards.length === 0) {
            boardsContainer.innerHTML = '<p class="no-results">No boards match your criteria. Try adjusting your filters.</p>';
            resultsCount.textContent = '0 boards found';
            return;
        }
        
        resultsCount.textContent = `${filteredBoards.length} ${filteredBoards.length === 1 ? 'board' : 'boards'} found`;
        
        filteredBoards.forEach(board => {
            const card = document.createElement('div');
            card.className = 'board-card';
            
            // Board image placeholder
            const imageDiv = document.createElement('div');
            imageDiv.className = 'board-image';
            imageDiv.style.backgroundColor = getRandomColor();
            
            // Board info
            const infoDiv = document.createElement('div');
            infoDiv.className = 'board-info';
            
            // Create elements
            const title = document.createElement('h2');
            title.textContent = board.name;
            
            const manufacturer = document.createElement('span');
            manufacturer.className = 'board-manufacturer';
            manufacturer.textContent = board.manufacturer;
            
            const family = document.createElement('span');
            family.className = 'board-family';
            family.textContent = board.family;
            
            const year = document.createElement('span');
            year.className = 'board-year';
            year.textContent = `Released: ${board.release_year || 'N/A'}`;
            
            const price = document.createElement('div');
            price.className = 'board-price';
            price.textContent = board.typical_price_usd ? `$${board.typical_price_usd.toFixed(2)}` : 'Price not available';
            
            // Specifications
            const specsDiv = document.createElement('div');
            specsDiv.className = 'board-specs';
            
            if (board.logic_elements) {
                specsDiv.appendChild(createSpecItem('Logic Elements', board.logic_elements.toLocaleString()));
            }
            
            if (board.block_ram_kb) {
                specsDiv.appendChild(createSpecItem('Block RAM', `${board.block_ram_kb} KB`));
            }
            
            if (board.dsp_blocks) {
                specsDiv.appendChild(createSpecItem('DSP Blocks', board.dsp_blocks));
            }
            
            if (board.max_user_io) {
                specsDiv.appendChild(createSpecItem('User I/O', board.max_user_io));
            }
            
            // Peripherals
            const peripheralsDiv = document.createElement('div');
            peripheralsDiv.className = 'board-peripherals';
            
            board.peripherals.forEach(p => {
                const tag = document.createElement('span');
                tag.className = 'peripheral-tag';
                tag.textContent = `${p.name}${p.quantity > 1 ? ` (${p.quantity})` : ''}`;
                if (p.notes) tag.title = p.notes;
                peripheralsDiv.appendChild(tag);
            });
            
            // Features
            const featuresDiv = document.createElement('div');
            featuresDiv.className = 'board-features';
            
            board.features.forEach(feature => {
                const tag = document.createElement('span');
                tag.className = 'feature-tag';
                tag.textContent = feature;
                featuresDiv.appendChild(tag);
            });
            
            // Documentation link
            let docLink = '';
            if (board.documentation_url) {
                docLink = `<a href="${board.documentation_url}" target="_blank" class="board-link">
                    <i class="fas fa-book"></i> Documentation
                </a>`;
            }
            
            // Dimensions
            let dimensions = '';
            if (board.dimensions) {
                dimensions = `<div class="board-dimensions">
                    <i class="fas fa-ruler-combined"></i> ${board.dimensions}
                </div>`;
            }
            
            // Assemble the card
            infoDiv.innerHTML = `
                ${title.outerHTML}
                <div class="board-meta">
                    ${manufacturer.outerHTML}
                    ${family.outerHTML}
                    ${year.outerHTML}
                </div>
                ${price.outerHTML}
                ${dimensions}
                ${specsDiv.outerHTML}
                <div class="board-description">${board.description || ''}</div>
                <h3>Peripherals</h3>
                ${peripheralsDiv.outerHTML}
                <h3>Features</h3>
                ${featuresDiv.outerHTML}
                ${docLink}
            `;
            
            card.appendChild(imageDiv);
            card.appendChild(infoDiv);
            boardsContainer.appendChild(card);
        });
    }
    
    function createSpecItem(label, value) {
        const div = document.createElement('div');
        div.className = 'spec-item';
        div.innerHTML = `<span>${label}:</span> ${value}`;
        return div;
    }
    
    function getRandomColor() {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    function attachEventListeners() {
        // Search
        searchBtn.addEventListener('click', applyFilters);
        searchInput.addEventListener('keyup', (e) => e.key === 'Enter' && applyFilters());
        
        // Filters
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
        
        // Price range
        minPriceInput.addEventListener('change', applyFilters);
        maxPriceInput.addEventListener('change', applyFilters);
        
        // Logic elements range
        logicRange.addEventListener('input', updateLogicRangeDisplay);
        logicRange.addEventListener('change', applyFilters);
        
        // Sort
        sortSelect.addEventListener('change', applyFilters);
        
        // Reset
        resetBtn.addEventListener('click', resetFilters);
    }
    
    function updateLogicRangeDisplay() {
        const value = parseInt(logicRange.value);
        logicValue.textContent = value === 1000000 ? 'Up to 1,000,000' : `Up to ${value.toLocaleString()}`;
    }
    
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const minPrice = parseFloat(minPriceInput.value) || 0;
        const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
        const maxLogicElements = parseInt(logicRange.value);
        const sortOption = sortSelect.value;
        
        // Get selected filters
        const selectedManufacturers = getSelectedFilters('manufacturer');
        const selectedFamilies = getSelectedFilters('family');
        const selectedPeripherals = getSelectedFilters('peripheral');
        const selectedFeatures = getSelectedFilters('feature');
        
        // Filter boards
        let filteredBoards = boards.filter(board => {
            // Search term
            if (searchTerm && !(
                board.name.toLowerCase().includes(searchTerm) || 
                board.manufacturer.toLowerCase().includes(searchTerm) || 
                board.family.toLowerCase().includes(searchTerm) ||
                (board.description && board.description.toLowerCase().includes(searchTerm))
            ) {
                return false;
            }
            
            // Price range
            if (board.typical_price_usd && 
                (board.typical_price_usd < minPrice || board.typical_price_usd > maxPrice)) {
                return false;
            }
            
            // Logic elements
            if (board.logic_elements && board.logic_elements > maxLogicElements) {
                return false;
            }
            
            // Manufacturers
            if (selectedManufacturers.size > 0 && !selectedManufacturers.has(board.manufacturer)) {
                return false;
            }
            
            // Families
            if (selectedFamilies.size > 0 && !selectedFamilies.has(board.family)) {
                return false;
            }
            
            // Peripherals
            if (selectedPeripherals.size > 0) {
                const boardPeripherals = board.peripherals.map(p => p.name);
                const hasAllSelected = Array.from(selectedPeripherals).every(p => 
                    boardPeripherals.includes(p)
                );
                if (!hasAllSelected) return false;
            }
            
            // Features
            if (selectedFeatures.size > 0) {
                const hasAllSelected = Array.from(selectedFeatures).every(f => 
                    board.features.includes(f)
                );
                if (!hasAllSelected) return false;
            }
            
            return true;
        });
        
        // Sort boards
        filteredBoards.sort((a, b) => {
            switch (sortOption) {
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'price-asc': return (a.typical_price_usd || 0) - (b.typical_price_usd || 0);
                case 'price-desc': return (b.typical_price_usd || 0) - (a.typical_price_usd || 0);
                case 'logic-asc': return (a.logic_elements || 0) - (b.logic_elements || 0);
                case 'logic-desc': return (b.logic_elements || 0) - (a.logic_elements || 0);
                default: return 0;
            }
        });
        
        renderBoards(filteredBoards);
    }
    
    function getSelectedFilters(type) {
        const checkboxes = document.querySelectorAll(`input[data-filter-type="${type}"]:checked`);
        return new Set(Array.from(checkboxes).map(cb => cb.dataset.filterValue));
    }
    
    function resetFilters() {
        // Reset search
        searchInput.value = '';
        
        // Reset checkboxes
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        // Reset price range
        minPriceInput.value = '';
        maxPriceInput.value = '';
        
        // Reset logic elements range
        logicRange.value = 1000000;
        updateLogicRangeDisplay();
        
        // Reset sort
        sortSelect.value = 'name-asc';
        
        // Reapply filters
        applyFilters();
    }
    
    function showError(error) {
        resultsCount.textContent = 'Error loading data';
        boardsContainer.innerHTML = `
            <div class="error-message">
                <h3>Failed to load data</h3>
                <p>${error.message}</p>
                <p>Please try refreshing the page or check back later.</p>
            </div>
        `;
    }
    
    function addDownloadButtons() {
        document.getElementById('download-csv').addEventListener('click', () => {
            const filteredBoards = getFilteredBoardsForExport();
            const csvContent = convertToCSV(filteredBoards);
            downloadFile(csvContent, 'fpga_boards.csv', 'text/csv');
        });
        
        document.getElementById('download-json').addEventListener('click', () => {
            const filteredBoards = getFilteredBoardsForExport();
            downloadFile(
                JSON.stringify(filteredBoards, null, 2),
                'fpga_boards.json',
                'application/json'
            );
        });
    }
    
    function getFilteredBoardsForExport() {
        // Get current filtered boards or all boards if no filters active
        const cards = document.querySelectorAll('.board-card');
        if (cards.length === boards.length || cards.length === 0) {
            return boards;
        }
        
        // Reconstruct filtered boards from visible cards
        const filteredBoards = [];
        cards.forEach(card => {
            const boardName = card.querySelector('h2').textContent;
            const board = boards.find(b => b.name === boardName);
            if (board) filteredBoards.push(board);
        });
        
        return filteredBoards;
    }
    
    function convertToCSV(data) {
        if (data.length === 0) return '';
        
        // Flatten the data structure for CSV
        const flatData = data.map(board => ({
            ...board,
            peripherals: board.peripherals.map(p => 
                `${p.name}${p.quantity > 1 ? ` (${p.quantity})` : ''}${p.notes ? ` [${p.notes}]` : ''}`
            ).join('; '),
            features: board.features.join('; ')
        }));
        
        const headers = Object.keys(flatData[0]);
        const rows = flatData.map(obj => 
            headers.map(header => 
                JSON.stringify(obj[header], (_, val) => val === null ? '' : val)
            )
        );
        
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }
    
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});