import sqlite3
import json
from pathlib import Path

def export_to_json():
    db_path = Path(__file__).parent.parent / "database" / "fpga_boards.db"
    output_path = Path(__file__).parent.parent / "docs" / "data" / "boards.json"
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # First get all boards with their basic info
    cursor.execute("""
    SELECT 
        b.id,
        b.name,
        m.name as manufacturer,
        f.family_name as family,
        b.release_year,
        b.description,
        b.dimensions,
        b.weight_grams,
        b.typical_price_usd,
        b.documentation_url,
        s.logic_elements,
        s.flip_flops,
        s.block_ram_kb,
        s.dsp_blocks,
        s.plls,
        s.max_user_io,
        s.transceivers,
        s.transceiver_speed_gbps
    FROM fpga_boards b
    LEFT JOIN manufacturers m ON b.manufacturer_id = m.id
    LEFT JOIN fpga_families f ON b.family_id = f.id
    LEFT JOIN specifications s ON b.id = s.board_id
    """)
    
    boards = []
    for board_row in cursor.fetchall():
        board = dict(board_row)
        
        # Get peripherals for this board
        cursor.execute("""
        SELECT p.name 
        FROM board_peripherals bp
        JOIN peripherals p ON bp.peripheral_id = p.id
        WHERE bp.board_id = ?
        """, (board['id'],))
        board['peripherals'] = [row[0] for row in cursor.fetchall()]
        
        # Get features for this board
        cursor.execute("""
        SELECT f.name 
        FROM board_features bf
        JOIN features f ON bf.feature_id = f.id
        WHERE bf.board_id = ?
        """, (board['id'],))
        board['features'] = [row[0] for row in cursor.fetchall()]
        
        boards.append(board)
    
    # Write to JSON file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(boards, f, indent=2)
    
    conn.close()
    print(f"Data exported to {output_path}")

if __name__ == "__main__":
    export_to_json()