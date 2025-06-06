// API endpoint (will be replaced with your deployment URL)
const API_URL = 'https://your-deployed-function.workers.dev';

async function fetchData(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}${endpoint}?${query}`);
  return response.json();
}

async function init() {
  // Fetch initial data
  const boards = await fetchData('/api/boards');
  
  // Populate family dropdown
  const families = [...new Set(boards.map(b => b.fpga_family))];
  const familySelect = document.getElementById('family');
  families.forEach(family => {
    const option = document.createElement('option');
    option.value = family;
    option.textContent = family;
    familySelect.appendChild(option);
  });
  
  // Render results
  renderResults(boards);
  
  // Setup event listeners
  document.getElementById('search').addEventListener('click', search);
  document.getElementById('export').addEventListener('click', exportCSV);
}

async function search() {
  const family = document.getElementById('family').value;
  const price = document.getElementById('price').value;
  
  const boards = await fetchData('/api/boards', {
    family: family,
    max_price: price
  });
  
  renderResults(boards);
}

function renderResults(boards) {
  const container = document.getElementById('results');
  container.innerHTML = '';
  
  if (boards.length === 0) {
    container.innerHTML = '<p>No boards found</p>';
    return;
  }
  
  boards.forEach(board => {
    const card = document.createElement('div');
    card.className = 'board-card';
    card.innerHTML = `
      <h3>${board.name}</h3>
      <p><strong>Manufacturer:</strong> ${board.manufacturer}</p>
      <p><strong>FPGA Family:</strong> ${board.fpga_family}</p>
      <p><strong>Price:</strong> $${board.price.toFixed(2)}</p>
      <a href="${board.vendor_link}" target="_blank">Product Page</a>
    `;
    container.appendChild(card);
  });
}

async function exportCSV() {
  window.location.href = `${API_URL}/api/export`;
}

// Initialize the app
init();