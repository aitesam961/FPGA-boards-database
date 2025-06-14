document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Load board data
    let boards = [];
    let uniqueManufacturers = new Set();
    let uniqueFamilies = new Set();
    let uniquePeripherals = new Set();
    let uniqueFeatures = new Set();
    
    fetch('data/boards.json')
        .then(response => response.json())
        .then(data => {
            boards = data;
            processData(boards);
            renderBoards(boards);
            renderFilters();
            attachEventListeners();
        })
        .catch(error => {
            console.error('Error loading board data:', error);
            document.getElementById('results-count').textContent = 'Error loading data';
        });
    
    function processData(boards) {
        boards.forEach(board => {
            uniqueManufacturers.add(board.manufacturer);
            uniqueFamilies.add(board.family);
            
            board.peripherals.forEach(peripheral => {
                uniquePeripherals.add(peripheral);
            });
            
            board.features.forEach(feature => {
                uniqueFeatures.add(feature);
            });
        });
    }
    
    function renderFilters() {
        // Manufacturer filters
        const manufacturerContainer = document.getElementById('manufacturer-filters');
        uniqueManufacturers.forEach(manufacturer => {
            manufacturerContainer.appendChild(createCheckboxFilter('manufacturer', manufacturer));
        });
        
        // Family filters
        const familyContainer = document.getElementById('family-filters');
        uniqueFamilies.forEach(family => {
            familyContainer.appendChild(createCheckboxFilter('family', family));
        });
        
        // Peripheral filters
        const peripheralContainer = document.getElementById('peripheral-filters');
        uniquePeripherals.forEach(peripheral => {
            peripheralContainer.appendChild(createCheckboxFilter('peripheral', peripheral));
        });
        
        // Feature filters
        const featureContainer = document.getElementById('feature-filters');
        uniqueFeatures.forEach(feature => {
            featureContainer.appendChild(createCheckboxFilter('feature', feature));
        });
    }
    
    function createCheckboxFilter(type, value) {
        const container = document.createElement('div');
        container.className = 'filter-option';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `${type}-${value.replace(/\s+/g, '-').toLowerCase()}`;
        input.dataset.filterType = type;
        input.dataset.filterValue = value;
        
        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = value;
        
        container.appendChild(input);
        container.appendChild(label);
        
        return container;
    }
    
    function renderBoards(filteredBoards) {
        const container = document.getElementById('boards-container');
        container.innerHTML = '';
        
        if (filteredBoards.length === 0) {
            container.innerHTML = '<p class="no-results">No boards match your criteria. Try adjusting your filters.</p>';
            document.getElementById('results-count').textContent = '0 boards found';
            return;
        }
        
        document.getElementById('results-count').textContent = `${filteredBoards.length} ${filteredBoards.length === 1 ? 'board' : 'boards'} found`;
        
        filteredBoards.forEach(board => {
            const card = document.createElement('div');
            card.className = 'board-card';
            
            // Board image placeholder (you could add actual images later)
            const imageDiv = document.createElement('div');
            imageDiv.className = 'board-image';
            imageDiv.style.backgroundColor = getRandomColor();
            
            // Board info
            const infoDiv = document.createElement('div');
            infoDiv.className = 'board-info';
            
            const title = document.createElement('h2');
            title.textContent = board.name;
            
            const manufacturer = document.createElement('span');
            manufacturer.className = 'board-manufacturer';
            manufacturer.textContent = board.manufacturer;
            
            const family = document.createElement('span');
            family.className = 'board-family';
            family.textContent = board.family;
            
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
            
            board.peripherals.forEach(peripheral => {
                const tag = document.createElement('span');
                tag.className = 'peripheral-tag';
                tag.textContent = peripheral;
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
                docLink = `<a href="${board.documentation_url}" target="_blank" class="board-link">View Documentation</a>`;
            }
            
            infoDiv.innerHTML = `
                ${title.outerHTML}
                ${manufacturer.outerHTML}
                ${family.outerHTML}
                ${price.outerHTML}
                ${specsDiv.outerHTML}
                ${peripheralsDiv.outerHTML}
                ${featuresDiv.outerHTML}
                ${docLink}
            `;
            
            card.appendChild(imageDiv);
            card.appendChild(infoDiv);
            container.appendChild(card);
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
        // Search functionality
        document.getElementById('search-btn').addEventListener('click', applyFilters);
        document.getElementById('search').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
        
        // Filter checkboxes
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
        
        // Price range
        document.getElementById('min-price').addEventListener('change', applyFilters);
        document.getElementById('max-price').addEventListener('change', applyFilters);
        
        // Logic elements range
        const logicRange = document.getElementById('logic-elements-range');
        const logicValue = document.getElementById('logic-elements-value');
        
        logicRange.addEventListener('input', function() {
            const value = parseInt(this.value);
            logicValue.textContent = value === 1000000 ? 'Up to 1,000,000' : `Up to ${value.toLocaleString()}`;
        });
        
        logicRange.addEventListener('change', applyFilters);
        
        // Sort options
        document.getElementById('sort-by').addEventListener('change', applyFilters);
        
        // Reset filters
        document.getElementById('reset-filters').addEventListener('click', resetFilters);
    }
    
    function applyFilters() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const minPrice = parseFloat(document.getElementById('min-price').value) || 0;
        const maxPrice = parseFloat(document.getElementById('max-price').value) || Infinity;
        const maxLogicElements = parseInt(document.getElementById('logic-elements-range').value);
        const sortOption = document.getElementById('sort-by').value;
        
        // Get selected filters
        const selectedManufacturers = getSelectedFilters('manufacturer');
        const selectedFamilies = getSelectedFilters('family');
        const selectedPeripherals = getSelectedFilters('peripheral');
        const selectedFeatures = getSelectedFilters('feature');
        
        // Filter boards
        let filteredBoards = boards.filter(board => {
            // Search term
            if (searchTerm && !board.name.toLowerCase().includes(searchTerm) && 
                !board.manufacturer.toLowerCase().includes(searchTerm) && 
                !board.family.toLowerCase().includes(searchTerm)) {
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
                const hasAllSelectedPeripherals = Array.from(selectedPeripherals).every(peripheral => 
                    board.peripherals.includes(peripheral)
                );
                if (!hasAllSelectedPeripherals) return false;
            }
            
            // Features
            if (selectedFeatures.size > 0) {
                const hasAllSelectedFeatures = Array.from(selectedFeatures).every(feature => 
                    board.features.includes(feature)
                );
                if (!hasAllSelectedFeatures) return false;
            }
            
            return true;
        });
        
        // Sort boards
        filteredBoards.sort((a, b) => {
            switch (sortOption) {
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'price-asc':
                    return (a.typical_price_usd || 0) - (b.typical_price_usd || 0);
                case 'price-desc':
                    return (b.typical_price_usd || 0) - (a.typical_price_usd || 0);
                case 'logic-asc':
                    return (a.logic_elements || 0) - (b.logic_elements || 0);
                case 'logic-desc':
                    return (b.logic_elements || 0) - (a.logic_elements || 0);
                default:
                    return 0;
            }
        });
        
        renderBoards(filteredBoards);
    }
    
    function getSelectedFilters(type) {
        const checkboxes = document.querySelectorAll(`input[data-filter-type="${type}"]:checked`);
        return new Set(Array.from(checkboxes).map(checkbox => checkbox.dataset.filterValue));
    }
    
    function resetFilters() {
        // Reset search
        document.getElementById('search').value = '';
        
        // Reset checkboxes
        document.querySelectorAll('.filter-options input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset price range
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        
        // Reset logic elements range
        const logicRange = document.getElementById('logic-elements-range');
        logicRange.value = 1000000;
        document.getElementById('logic-elements-value').textContent = 'Up to 1,000,000';
        
        // Reset sort
        document.getElementById('sort-by').value = 'name-asc';
        
        // Reapply filters
        applyFilters();
    }
});