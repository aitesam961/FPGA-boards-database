// Replace your entire app.js with:
alert("Debug: Script loaded!"); // You should see this popup
setTimeout(async () => {
    const dbPath = 'https://aitesam961.github.io/FPGA-boards-database/fpga_boards.db';
    const response = await fetch(dbPath);
    alert(`Database status: ${response.status}`);
}, 1000);