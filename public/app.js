// API endpoint (will be replaced with your deployment URL)
const API_URL = 'https://your-deployed-api.example.com';

// DOM elements
const familyFilter = document.getElementById('family-filter');
const priceFilter = document.getElementById('price-filter');
const manufacturerFilter = document.getElementById('manufacturer-filter');
const searchBtn = document.getElementById('search-btn');
const exportBtn = document.getElementById('export-btn');
const resultsContainer = document.getElementById('results');

// Initialize filters
async function initFilters() {
  try {
    const response = await fetch(`${API_URL}/api/boards?limit=1`);
    if (!response.ok) throw new Error('Failed to fetch data');
    
    const boards = await response.json();
    if (!boards.length) return;
    
    // Extract unique values
    const families = [...new Set(boards.map(b => b.fpga_family))];
    const manufacturers = [...new Set(boards.map(b => b.manufacturer))];
    
    // Populate family filter
    families.forEach(family => {
      const option = document.createElement('option');
      option.value = family;
      option.textContent = family;
      familyFilter.appendChild(option);
    });
    
    // Populate manufacturer filter
    manufacturers.forEach(manufacturer => {
      const option = document.createElement('option');
      option.value = manufacturer;
      option.textContent = manufacturer;
      manufacturerFilter.appendChild(option);
    });
  } catch (error) {
    console.error('Error initializing filters:', error);
    resultsContainer.innerHTML = `<div class="alert alert-danger">Error loading data: ${error.message}</div>`;
  }
}

// Fetch and display boards
async function fetchAndDisplayBoards() {
  try {
    resultsContainer.innerHTML = '<div class="text-center my-4"><div class="spinner-border" role="status"></div></div>';
    
    // Build query parameters
    const params = new URLSearchParams();
    if (familyFilter.value) params.append('family', familyFilter.value);
    if (priceFilter.value) params.append('max_price', priceFilter.value);
    if (manufacturerFilter.value) params.append('manufacturer', manufacturerFilter.value);
    
    const response = await fetch(`${API_URL}/api/boards?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch data');
    
    const boards = await response.json();
    renderBoards(boards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    resultsContainer.innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
  }
}

// Render boards to the page
function renderBoards(boards) {
  if (!boards.length) {
    resultsContainer.innerHTML = '<div class="alert alert-info">No boards found matching your criteria</div>';
    return;
  }
  
  resultsContainer.innerHTML = '';
  
  boards.forEach(board => {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    card.innerHTML = `
      <div class="card board-card h-100">
        <div class="card-body">
          <h5 class="card-title">${board.name}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${board.manufacturer}</h6>
          <p class="card-text">
            <strong>FPGA Family:</strong> ${board.fpga_family}<br>
            <strong>Price:</strong> $${board.price.toFixed(2)}<br>
            <a href="${board.vendor_link}" target="_blank">Product Page</a>
          </p>
          <div class="mt-2">
            <span class="badge bg-primary">${board.fpga_family}</span>
            <span class="badge bg-success">$${board.price.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
    resultsContainer.appendChild(card);
  });
}

// Export to CSV
function exportToCSV() {
  const params = new URLSearchParams();
  if (familyFilter.value) params.append('family', familyFilter.value);
  if (priceFilter.value) params.append('max_price', priceFilter.value);
  if (manufacturerFilter.value) params.append('manufacturer', manufacturerFilter.value);
  
  window.open(`${API_URL}/api/export?${params.toString()}`, '_blank');
}

// Event listeners
searchBtn.addEventListener('click', fetchAndDisplayBoards);
exportBtn.addEventListener('click', exportToCSV);

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  fetchAndDisplayBoards();
});