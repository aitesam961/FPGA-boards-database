-- FPGA Boards Database Schema
CREATE TABLE IF NOT EXISTS manufacturers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    website TEXT,
    founded_year INTEGER
);

CREATE TABLE IF NOT EXISTS fpga_families (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_name TEXT NOT NULL UNIQUE,
    manufacturer_id INTEGER,
    typical_use_case TEXT,
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id)
);

CREATE TABLE IF NOT EXISTS fpga_boards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    family_id INTEGER,
    manufacturer_id INTEGER,
    release_year INTEGER,
    description TEXT,
    dimensions TEXT,
    weight_grams REAL,
    typical_price_usd REAL,
    is_available INTEGER DEFAULT 1,
    documentation_url TEXT,
    FOREIGN KEY (family_id) REFERENCES fpga_families(id),
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id)
);

CREATE TABLE IF NOT EXISTS specifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    board_id INTEGER NOT NULL,
    logic_elements INTEGER,
    flip_flops INTEGER,
    block_ram_kb INTEGER,
    dsp_blocks INTEGER,
    plls INTEGER,
    max_user_io INTEGER,
    transceivers INTEGER,
    transceiver_speed_gbps REAL,
    FOREIGN KEY (board_id) REFERENCES fpga_boards(id)
);

CREATE TABLE IF NOT EXISTS peripherals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS board_peripherals (
    board_id INTEGER NOT NULL,
    peripheral_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    PRIMARY KEY (board_id, peripheral_id),
    FOREIGN KEY (board_id) REFERENCES fpga_boards(id),
    FOREIGN KEY (peripheral_id) REFERENCES peripherals(id)
);

CREATE TABLE IF NOT EXISTS features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS board_features (
    board_id INTEGER NOT NULL,
    feature_id INTEGER NOT NULL,
    PRIMARY KEY (board_id, feature_id),
    FOREIGN KEY (board_id) REFERENCES fpga_boards(id),
    FOREIGN KEY (feature_id) REFERENCES features(id)
);