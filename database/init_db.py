import sqlite3
import csv
from pathlib import Path

def initialize_database():
    db_path = Path(__file__).parent / "fpga_boards.db"
    
    # Connect to SQLite database (creates if not exists)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create tables
    with open(Path(__file__).parent / "schema.sql") as f:
        cursor.executescript(f.read())
    
    # Insert sample data (optional)
    insert_sample_data(cursor)
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {db_path}")

def insert_sample_data(cursor):
    # Sample manufacturers
    manufacturers = [
        ("Xilinx", "https://www.xilinx.com", 1984),
        ("Intel FPGA", "https://www.intel.com", 1983),
        ("Lattice Semiconductor", "https://www.latticesemi.com", 1983),
        ("Microchip (Microsemi)", "https://www.microchip.com", 1987),
        ("Achronix", "https://www.achronix.com", 2004),
    ]
    cursor.executemany("INSERT INTO manufacturers (name, website, founded_year) VALUES (?, ?, ?)", manufacturers)
    
    # Sample FPGA families
    fpga_families = [
        ("Artix", 1, "Cost-sensitive applications"),
        ("Kintex", 1, "Mid-range applications"),
        ("Virtex", 1, "High-performance applications"),
        ("Cyclone", 2, "Low-cost applications"),
        ("Arria", 2, "Mid-range applications"),
        ("Stratix", 2, "High-performance applications"),
        ("ECP5", 3, "Low-power applications"),
        ("iCE40", 3, "Ultra-low-power applications"),
        ("PolarFire", 4, "Low-power mid-range applications"),
        ("Speedster", 5, "High-performance applications"),
    ]
    cursor.executemany("INSERT INTO fpga_families (family_name, manufacturer_id, typical_use_case) VALUES (?, ?, ?)", fpga_families)
    
    # Sample peripherals
    peripherals = [
        ("USB 2.0", "USB 2.0 interface"),
        ("USB 3.0", "USB 3.0 interface"),
        ("Ethernet", "10/100/1000 Mbps Ethernet"),
        ("HDMI", "HDMI video output"),
        ("VGA", "VGA video output"),
        ("PCIe", "PCI Express interface"),
        ("GPIO", "General Purpose I/O pins"),
        ("ADC", "Analog-to-Digital Converter"),
        ("DAC", "Digital-to-Analog Converter"),
        ("Flash", "Non-volatile flash memory"),
        ("SDRAM", "Synchronous DRAM"),
        ("DDR", "DDR Memory"),
        ("SD Card", "SD Card slot"),
        ("WiFi", "Wireless networking"),
        ("Bluetooth", "Bluetooth connectivity"),
    ]
    cursor.executemany("INSERT INTO peripherals (name, description) VALUES (?, ?)", peripherals)
    
    # Sample features
    features = [
        ("Open Source", "Board has open source design/tools"),
        ("Arduino Compatible", "Arduino shield compatible"),
        ("Raspberry Pi Compatible", "Raspberry Pi HAT compatible"),
        ("Breadboard Friendly", "Designed for breadboard use"),
        ("Low Power", "Optimized for low power consumption"),
        ("High Speed", "Optimized for high-speed applications"),
        ("Industrial Temp", "Industrial temperature range"),
        ("Military Grade", "Military temperature range"),
        ("Certified", "Industry certifications available"),
    ]
    cursor.executemany("INSERT INTO features (name, description) VALUES (?, ?)", features)
    
    # Sample boards
    boards = [
        ("Basys 3", 1, 1, 2013, "Entry-level FPGA development board", "160mm x 100mm", 200, 149.00, 1, "https://reference.digilentinc.com/reference/programmable-logic/basys-3/start"),
        ("Arty A7-100T", 1, 1, 2016, "Artix-7 FPGA Development Board", "228mm x 127mm", 250, 249.00, 1, "https://reference.digilentinc.com/reference/programmable-logic/arty-a7/start"),
        ("Nexys A7", 1, 1, 2017, "Artix-7 FPGA Board with rich peripherals", "165mm x 115mm", 300, 349.00, 1, "https://reference.digilentinc.com/reference/programmable-logic/nexys-a7/start"),
        ("DE10-Nano", 4, 2, 2016, "Cyclone V SoC FPGA Development Kit", "100mm x 75mm", 150, 199.00, 1, "https://www.terasic.com.tw/cgi-bin/page/archive.pl?Language=English&CategoryNo=205&No=1046"),
        ("TinyFPGA BX", 7, 3, 2018, "Small form-factor iCE40 FPGA board", "36mm x 18mm", 5, 39.00, 1, "https://tinyfpga.com/bx/guide.html"),
    ]
    cursor.executemany(
        "INSERT INTO fpga_boards (name, family_id, manufacturer_id, release_year, description, dimensions, weight_grams, typical_price_usd, is_available, documentation_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        boards
    )
    
    # Sample specifications
    specifications = [
        (1, 33440, 66880, 1800, 90, 5, 108, 0, 0),
        (2, 101440, 202880, 4860, 240, 6, 100, 0, 0),
        (3, 101440, 202880, 4860, 240, 6, 100, 0, 0),
        (4, 110000, 55000, 3150, 112, 2, 84, 0, 0),
        (5, 7680, 7680, 128, 8, 1, 36, 0, 0),
    ]
    cursor.executemany(
        "INSERT INTO specifications (board_id, logic_elements, flip_flops, block_ram_kb, dsp_blocks, plls, max_user_io, transceivers, transceiver_speed_gbps) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        specifications
    )
    
    # Sample board peripherals
    board_peripherals = [
        (1, 1, 1, "USB-UART bridge"),
        (1, 3, 1, "10/100 Ethernet"),
        (1, 4, 1, "HDMI sink"),
        (1, 7, 100, "PMOD connectors"),
        (2, 1, 1, "USB-UART bridge"),
        (2, 7, 100, "PMOD connectors"),
        (2, 13, 1, "MicroSD slot"),
        (3, 1, 1, "USB-UART bridge"),
        (3, 3, 1, "Gigabit Ethernet"),
        (3, 4, 1, "HDMI sink"),
        (3, 7, 100, "PMOD connectors"),
        (3, 13, 1, "MicroSD slot"),
        (4, 1, 1, "USB-UART bridge"),
        (4, 3, 1, "Gigabit Ethernet"),
        (4, 4, 1, "HDMI sink"),
        (4, 7, 100, "Arduino headers"),
        (5, 1, 1, "USB programming"),
    ]
    cursor.executemany(
        "INSERT INTO board_peripherals (board_id, peripheral_id, quantity, notes) VALUES (?, ?, ?, ?)",
        board_peripherals
    )
    
    # Sample board features
    board_features = [
        (1, 1),
        (1, 2),
        (2, 1),
        (2, 2),
        (3, 1),
        (3, 2),
        (4, 2),
        (5, 1),
        (5, 4),
    ]
    cursor.executemany(
        "INSERT INTO board_features (board_id, feature_id) VALUES (?, ?)",
        board_features
    )

if __name__ == "__main__":
    initialize_database()