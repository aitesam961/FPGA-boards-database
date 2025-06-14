import sqlite3
import json
from pathlib import Path

def export_to_json():
    db_path = Path(__file__).parent.parent / "database" / "fpga_boards.db"
    output_path = Path(__file__).parent.parent / "docs" / "data" / "boards.json"
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Updated query with proper GROUP_CONCAT syntax
    query = """
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
        s.transceiver_speed_gbps,
        (SELECT GROUP_CONCAT(DISTINCT p.name, '||') 
         FROM board_peripherals bp
         JOIN peripherals p ON bp.peripheral_id = p.id
         WHERE bp.board_id = b.id) as peripherals,
        (SELECT GROUP_CONCAT(DISTINCT fe.name, '||') 
         FROM board_features bf
         JOIN features fe ON bf.feature_id = fe.id
         WHERE bf.board_id = b.id) as features
    FROM fpga_boards b
    LEFT JOIN manufacturers m ON b.manufacturer_id = m.id
    LEFT JOIN fpga_families f ON b.family_id = f.id
    LEFT JOIN specifications s ON b.id = s.board_id
    GROUP BY b.id
    """
    
    cursor.execute(query)
    rows = cursor.fetchall()
    
    # Convert rows to dictionaries
    boards = []
    for row in rows:
        board = dict(row)
        # Split concatenated strings into lists
        board['peripherals'] = board['peripherals'].split('||') if board['peripherals'] else []
        board['features'] = board['features'].split('||') if board['features'] else []
        boards.append(board)
    
    # Write to JSON file
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(boards, f, indent=2)
    
    conn.close()
    print(f"Data exported to {output_path}")

if __name__ == "__main__":
    export_to_json()