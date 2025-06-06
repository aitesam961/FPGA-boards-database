
import csv
import sqlite3
import os
from pathlib import Path

# Get current directory
current_dir = Path(__file__).parent
CSV_PATH = current_dir / '../data/boards.csv'
DB_DIR = current_dir / '../docs/'
DB_PATH = DB_DIR / 'fpga_boards.db'

# Create docs directory if not exists
DB_DIR.mkdir(parents=True, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()


c.execute('''CREATE TABLE IF NOT EXISTS boards (
    id INTEGER PRIMARY KEY,
    name TEXT,
    manufacturer TEXT,
    price REAL,
    logic_elements INTEGER,
    memory_kb INTEGER,
    dsp_blocks INTEGER,
    io_pins INTEGER,
    transceivers INTEGER,
    flash_mb INTEGER,
    ram_mb INTEGER
)''')

with open(CSV_PATH, 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        c.execute('''INSERT INTO boards (
            name, manufacturer, price, logic_elements, memory_kb, 
            dsp_blocks, io_pins, transceivers, flash_mb, ram_mb
        ) VALUES (?,?,?,?,?,?,?,?,?,?)''', (
            row['name'],
            row['manufacturer'],
            float(row['price']),
            int(row['logic_elements']),
            int(row['memory_kb']),
            int(row['dsp_blocks']),
            int(row['io_pins']),
            int(row['transceivers']),
            int(row['flash_mb']),
            int(row['ram_mb'])
        ))

conn.commit()
conn.close()
print(f"Database generated at {DB_PATH}")
