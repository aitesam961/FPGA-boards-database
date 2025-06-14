document.addEventListener('DOMContentLoaded', function() {
    // Set current year
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Loading state
    const resultsCount = document.getElementById('results-count');
    resultsCount.textContent = 'Loading data...';
    
    // Add loading spinner
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    resultsCount.appendChild(spinner);
    
    // Timeout fallback
    const loadTimeout = setTimeout(() => {
        resultsCount.textContent = 'Loading is taking longer than expected...';
    }, 5000);
    
    // Fetch data with cache busting
    fetch(`data/boards.json?t=${Date.now()}`)
        .then(response => {
            clearTimeout(loadTimeout);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!data || !data.length) throw new Error('No data available');
            // Process and display data...
            resultsCount.textContent = `${data.length} boards loaded`;
        })
        .catch(error => {
            console.error('Error:', error);
            resultsCount.textContent = 'Failed to load data';
            document.getElementById('boards-container').innerHTML = `
                <div class="error-message">
                    <h3>Data Loading Error</h3>
                    <p>${error.message}</p>
                    <p>Please try refreshing the page.</p>
                    <button onclick="window.location.reload()">Refresh</button>
                </div>
            `;
        });
});