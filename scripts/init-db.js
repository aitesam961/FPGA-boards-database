const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

// Create database
const db = new sqlite3.Database('./data/fpga.db');

db.serialize(() => {
  // Create boards table
  db.run(`CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    manufacturer TEXT NOT NULL,
    fpga_family TEXT NOT NULL,
    price REAL,
    vendor_link TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create features table (many-to-many relationship)
  db.run(`CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  )`);

  // Create board_features junction table
  db.run(`CREATE TABLE IF NOT EXISTS board_features (
    board_id INTEGER,
    feature_id INTEGER,
    FOREIGN KEY(board_id) REFERENCES boards(id),
    FOREIGN KEY(feature_id) REFERENCES features(id),
    PRIMARY KEY(board_id, feature_id)
  )`);
  
  // Create similar tables for peripherals and connectivity...

  console.log('Database initialized');
});

db.close();