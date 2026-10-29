import os
import re
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def create_word_deck():
    doc = Document()

    # Set page margins (0.75 in)
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Color Palette
    PRIMARY_COLOR = RGBColor(15, 23, 42)      # Slate 900
    SECONDARY_COLOR = RGBColor(2, 132, 199)   # Sky 600
    MUTED_TEXT = RGBColor(100, 116, 139)      # Slate 500
    DARK_TEXT = RGBColor(30, 41, 59)          # Slate 800

    md_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'BUSINESS_DECK.md')
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split slides by "<!-- SLIDE X -->"
    slide_chunks = re.split(r'<!--\s*SLIDE\s*\d+\s*-->', content)
    
    # Process each slide
    first_slide = True
    for chunk in slide_chunks:
        chunk = chunk.strip()
        if not chunk:
            continue

        if not first_slide:
            doc.add_page_break()
        first_slide = False

        lines = chunk.split('\n')
        i = 0
        in_code_block = False
        code_lines = []

        while i < len(lines):
            line = lines[i]

            # Code Block Start/End
            if line.strip().startswith('```'):
                if in_code_block:
                    # End code block
                    in_code_block = False
                    box_text = '\n'.join(code_lines)
                    table = doc.add_table(rows=1, cols=1)
                    table.alignment = WD_TABLE_ALIGNMENT.CENTER
                    cell = table.cell(0, 0)
                    set_cell_background(cell, 'F1F5F9')
                    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
                    p = cell.paragraphs[0]
                    p.paragraph_format.space_before = Pt(4)
                    p.paragraph_format.space_after = Pt(4)
                    run = p.add_run(box_text)
                    run.font.name = 'Consolas'
                    run.font.size = Pt(8.5)
                    run.font.color.rgb = RGBColor(51, 65, 85)
                    doc.add_paragraph().paragraph_format.space_after = Pt(4)
                    code_lines = []
                else:
                    in_code_block = True
                    code_lines = []
                i += 1
                continue

            if in_code_block:
                code_lines.append(line)
                i += 1
                continue

            # Slide Header (## Slide X: Title)
            if line.startswith('## Slide '):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(6)
                run = p.add_run(line.replace('## ', ''))
                run.bold = True
                run.font.name = 'Calibri'
                run.font.size = Pt(20)
                run.font.color.rgb = SECONDARY_COLOR
                i += 1
                continue

            # Document Title / H1
            if line.startswith('# '):
                title_text = line.replace('# ', '').strip()
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(12)
                p.paragraph_format.space_after = Pt(6)
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run(title_text)
                run.bold = True
                run.font.name = 'Calibri'
                run.font.size = Pt(24)
                run.font.color.rgb = PRIMARY_COLOR
                i += 1
                continue

            # Sub-header / H3
            if line.startswith('### '):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(10)
                p.paragraph_format.space_after = Pt(4)
                run = p.add_run(line.replace('### ', '').strip())
                run.bold = True
                run.font.name = 'Calibri'
                run.font.size = Pt(13)
                run.font.color.rgb = PRIMARY_COLOR
                i += 1
                continue

            # Blockquote
            if line.startswith('> '):
                quote_text = line.replace('> ', '').strip()
                table = doc.add_table(rows=1, cols=1)
                table.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = table.cell(0, 0)
                set_cell_background(cell, 'E0F2FE')
                set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                run = p.add_run(quote_text.replace('**', ''))
                run.italic = True
                run.font.name = 'Calibri'
                run.font.size = Pt(10.5)
                run.font.color.rgb = RGBColor(3, 105, 161)
                doc.add_paragraph().paragraph_format.space_after = Pt(4)
                i += 1
                continue

            # Table Parsing (| Col 1 | Col 2 | ...)
            if line.strip().startswith('|') and '|' in line[1:]:
                table_lines = []
                while i < len(lines) and lines[i].strip().startswith('|'):
                    table_lines.append(lines[i].strip())
                    i += 1

                # Parse table lines
                headers = [c.strip() for c in table_lines[0].split('|')[1:-1]]
                data_rows = []
                for row_line in table_lines[2:]: # skip separator line
                    cols = [c.strip() for c in row_line.split('|')[1:-1]]
                    if len(cols) == len(headers):
                        data_rows.append(cols)

                if headers and data_rows:
                    table = doc.add_table(rows=len(data_rows) + 1, cols=len(headers))
                    table.alignment = WD_TABLE_ALIGNMENT.CENTER
                    table.autofit = True

                    # Header Row
                    hdr_cells = table.rows[0].cells
                    for idx, h_text in enumerate(headers):
                        hdr_cells[idx].text = h_text.replace('**', '')
                        set_cell_background(hdr_cells[idx], '0F172A')
                        set_cell_margins(hdr_cells[idx], top=100, bottom=100, left=120, right=120)
                        p = hdr_cells[idx].paragraphs[0]
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        for run in p.runs:
                            run.bold = True
                            run.font.name = 'Calibri'
                            run.font.size = Pt(9.5)
                            run.font.color.rgb = RGBColor(255, 255, 255)

                    # Data Rows
                    for r_idx, row_data in enumerate(data_rows):
                        row_cells = table.rows[r_idx + 1].cells
                        bg_color = 'FFFFFF' if r_idx % 2 == 0 else 'F8FAFC'
                        for c_idx, cell_value in enumerate(row_data):
                            row_cells[c_idx].text = cell_value.replace('**', '')
                            set_cell_background(row_cells[c_idx], bg_color)
                            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
                            p = row_cells[c_idx].paragraphs[0]
                            for run in p.runs:
                                run.font.name = 'Calibri'
                                run.font.size = Pt(9)
                                run.font.color.rgb = DARK_TEXT

                    doc.add_paragraph().paragraph_format.space_after = Pt(4)
                continue

            # Bullet points (* or -)
            if line.strip().startswith('* ') or line.strip().startswith('- '):
                bullet_text = line.strip()[2:].strip()
                p = doc.add_paragraph(style='List Bullet')
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                
                # Simple markdown bold parser
                parts = re.split(r'(\*\*.*?\*\*)', bullet_text)
                for part in parts:
                    if part.startswith('**') and part.endswith('**'):
                        run = p.add_run(part[2:-2])
                        run.bold = True
                    else:
                        run = p.add_run(part)
                    run.font.name = 'Calibri'
                    run.font.size = Pt(10)
                    run.font.color.rgb = DARK_TEXT
                i += 1
                continue

            # Numbered list (1. ...)
            num_match = re.match(r'^\d+\.\s+(.*)', line.strip())
            if num_match:
                item_text = num_match.group(1).strip()
                p = doc.add_paragraph(style='List Number')
                p.paragraph_format.space_before = Pt(2)
                p.paragraph_format.space_after = Pt(2)
                parts = re.split(r'(\*\*.*?\*\*)', item_text)
                for part in parts:
                    if part.startswith('**') and part.endswith('**'):
                        run = p.add_run(part[2:-2])
                        run.bold = True
                    else:
                        run = p.add_run(part)
                    run.font.name = 'Calibri'
                    run.font.size = Pt(10)
                    run.font.color.rgb = DARK_TEXT
                i += 1
                continue

            # General paragraph text
            clean_line = line.strip()
            if clean_line and not clean_line.startswith('---') and not clean_line.startswith('<'):
                p = doc.add_paragraph()
                p.paragraph_format.space_before = Pt(3)
                p.paragraph_format.space_after = Pt(4)
                parts = re.split(r'(\*\*.*?\*\*)', clean_line)
                for part in parts:
                    if part.startswith('**') and part.endswith('**'):
                        run = p.add_run(part[2:-2])
                        run.bold = True
                    else:
                        run = p.add_run(part)
                    run.font.name = 'Calibri'
                    run.font.size = Pt(10)
                    run.font.color.rgb = DARK_TEXT

            i += 1

    out_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'KioskDrop_Enterprise_12_Page_Business_Deck.docx')
    doc.save(out_path)
    print(f"Successfully generated Word document at: {out_path}")

if __name__ == '__main__':
    create_word_deck()
