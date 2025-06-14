import sqlite3
import json
import csv
from pathlib import Path

def export_data():
    db_path = Path(__file__).parent.parent / "database" / "fpga_boards.db"
    output_dir = Path(__file__).parent.parent / "docs" / "data"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all boards with basic info
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
    ORDER BY b.name
    """)
    
    boards = []
    for board_row in cursor.fetchall():
        board = dict(board_row)
        
        # Get peripherals
        cursor.execute("""
        SELECT p.name, bp.quantity, bp.notes
        FROM board_peripherals bp
        JOIN peripherals p ON bp.peripheral_id = p.id
        WHERE bp.board_id = ?
        """, (board['id'],))
        board['peripherals'] = [dict(row) for row in cursor.fetchall()]
        
        # Get features
        cursor.execute("""
        SELECT f.name
        FROM board_features bf
        JOIN features f ON bf.feature_id = f.id
        WHERE bf.board_id = ?
        """, (board['id'],))
        board['features'] = [row[0] for row in cursor.fetchall()]
        
        boards.append(board)
    
    # Export to JSON
    json_path = output_dir / "boards.json"
    with open(json_path, 'w') as f:
        json.dump(boards, f, indent=2)
    
    # Export to CSV
    csv_path = output_dir / "boards.csv"
    if boards:
        # Flatten the data for CSV
        flat_boards = []
        for board in boards:
            flat_board = board.copy()
            flat_board['peripherals'] = '; '.join(
                f"{p['name']} ({p['quantity']})" for p in board['peripherals']
            )
            flat_board['features'] = '; '.join(board['features'])
            flat_boards.append(flat_board)
        
        with open(csv_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=flat_boards[0].keys())
            writer.writeheader()
            writer.writerows(flat_boards)
    
    conn.close()
    print(f"Data exported to:\n- {json_path}\n- {csv_path}")

if __name__ == "__main__":
    export_data()