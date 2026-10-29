import os
import re
import subprocess

def generate_pdf():
    md_path = os.path.join(os.path.dirname(__file__), '..', 'docs', 'BUSINESS_DECK.md')
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split slides
    raw_slides = re.split(r'<!--\s*SLIDE\s*\d+\s*-->', content)
    slides = [s.strip() for s in raw_slides if s.strip()]

    html_parts = []
    html_parts.append("""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>KioskDrop Enterprise - 12-Page Executive Business Deck</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

  @page {
    size: A4 landscape;
    margin: 12mm 15mm 12mm 15mm;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #1e293b;
    background: #ffffff;
    font-size: 13px;
    line-height: 1.5;
  }

  .slide-container {
    width: 100%;
    height: 100%;
    min-height: 175mm;
    max-height: 185mm;
    page-break-after: always;
    page-break-inside: avoid;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 10px 0;
    position: relative;
  }

  .slide-container:last-child {
    page-break-after: avoid;
  }

  .slide-header {
    border-bottom: 2px solid #0284c7;
    padding-bottom: 8px;
    margin-bottom: 14px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .slide-title {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
  }

  .slide-badge {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #0284c7;
    background: #e0f2fe;
    padding: 3px 8px;
    border-radius: 4px;
  }

  .slide-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .slide-footer {
    border-top: 1px solid #e2e8f0;
    padding-top: 6px;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #64748b;
    font-weight: 600;
  }

  h1 { font-size: 26px; font-weight: 800; color: #0f172a; }
  h2 { font-size: 18px; font-weight: 700; color: #0f172a; }
  h3 { font-size: 14px; font-weight: 700; color: #0369a1; margin-top: 4px; }

  p { margin-bottom: 6px; color: #334155; }

  .highlight-quote {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-left: 4px solid #0284c7;
    padding: 10px 14px;
    border-radius: 0 6px 6px 0;
    font-size: 13.5px;
    font-weight: 600;
    color: #0369a1;
    margin: 6px 0;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }

  .card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
  }

  .card-header {
    font-size: 12.5px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    margin: 6px 0;
  }

  th, td {
    padding: 6px 10px;
    text-align: left;
    border: 1px solid #cbd5e1;
  }

  th {
    background: #0f172a;
    color: #ffffff;
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.02em;
  }

  tr:nth-child(even) {
    background: #f8fafc;
  }

  ul, ol {
    margin-left: 18px;
    margin-bottom: 6px;
  }

  li {
    margin-bottom: 4px;
    color: #334155;
  }

  pre {
    background: #0f172a;
    color: #e2e8f0;
    padding: 10px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 9.5px;
    line-height: 1.4;
    overflow: hidden;
    white-space: pre;
  }

  .stat-callout {
    background: #0f172a;
    color: #ffffff;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 800;
    color: #38bdf8;
  }

  .stat-label {
    font-size: 11px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
</head>
<body>
""")

    slide_num = 1
    for slide_md in slides:
        lines = slide_md.split('\n')
        
        # Extract title
        title = f"Slide {slide_num}"
        for line in lines:
            if line.startswith('## Slide '):
                title = line.replace('## ', '').strip()
                break
            elif line.startswith('# '):
                title = line.replace('# ', '').strip()
                break

        html_parts.append(f"""
<div class="slide-container">
  <div class="slide-header">
    <div class="slide-title">{title}</div>
    <div class="slide-badge">KioskDrop Enterprise • Executive Pitch Deck</div>
  </div>
  <div class="slide-body">
""")

        # Process lines into html
        i = 0
        in_code = False
        code_lines = []

        while i < len(lines):
            line = lines[i]

            if line.strip().startswith('```'):
                if in_code:
                    in_code = False
                    raw_block = '\n'.join(code_lines)
                    html_parts.append(f"<pre>{raw_block}</pre>")
                    code_lines = []
                else:
                    in_code = True
                    code_lines = []
                i += 1
                continue

            if in_code:
                code_lines.append(line.replace('<', '&lt;').replace('>', '&gt;'))
                i += 1
                continue

            # Ignore slide header itself
            if line.startswith('## Slide ') or line.startswith('# 📊') or line.startswith('# ⚡'):
                i += 1
                continue

            if line.startswith('### '):
                h3_text = line.replace('### ', '').strip()
                html_parts.append(f"<h3>{h3_text}</h3>")
                i += 1
                continue

            if line.startswith('> '):
                quote_text = line.replace('> ', '').strip().replace('**', '<strong>').replace('**', '</strong>')
                html_parts.append(f'<div class="highlight-quote">{quote_text}</div>')
                i += 1
                continue

            # Table
            if line.strip().startswith('|') and '|' in line[1:]:
                table_lines = []
                while i < len(lines) and lines[i].strip().startswith('|'):
                    table_lines.append(lines[i].strip())
                    i += 1

                headers = [c.strip() for c in table_lines[0].split('|')[1:-1]]
                data_rows = []
                for row_line in table_lines[2:]:
                    cols = [c.strip() for c in row_line.split('|')[1:-1]]
                    if len(cols) == len(headers):
                        data_rows.append(cols)

                if headers and data_rows:
                    html_parts.append("<table><thead><tr>")
                    for h in headers:
                        html_parts.append(f"<th>{h.replace('**', '')}</th>")
                    html_parts.append("</tr></thead><tbody>")
                    for row in data_rows:
                        html_parts.append("<tr>")
                        for cell in row:
                            cell_formatted = cell.replace('**', '<strong>').replace('**', '</strong>')
                            html_parts.append(f"<td>{cell_formatted}</td>")
                        html_parts.append("</tr>")
                    html_parts.append("</tbody></table>")
                continue

            # Bullets
            if line.strip().startswith('* ') or line.strip().startswith('- '):
                b_text = line.strip()[2:].strip().replace('**', '<strong>').replace('**', '</strong>')
                html_parts.append(f"<ul><li>{b_text}</li></ul>")
                i += 1
                continue

            # Numbered
            num_match = re.match(r'^\d+\.\s+(.*)', line.strip())
            if num_match:
                n_text = num_match.group(1).strip().replace('**', '<strong>').replace('**', '</strong>')
                html_parts.append(f"<ol><li>{n_text}</li></ol>")
                i += 1
                continue

            clean = line.strip()
            if clean and not clean.startswith('---') and not clean.startswith('<'):
                p_text = clean.replace('**', '<strong>').replace('**', '</strong>')
                html_parts.append(f"<p>{p_text}</p>")

            i += 1

        html_parts.append(f"""
  </div>
  <div class="slide-footer">
    <div>CONFIDENTIAL • FOR AUTHORIZED REVIEW ONLY</div>
    <div>KIOSKDROP ENTERPRISE — SLIDE {slide_num} OF 12</div>
    <div>SEED ROUND PITCH DECK</div>
  </div>
</div>
""")
        slide_num += 1

    html_parts.append("</body></html>")
    full_html = '\n'.join(html_parts)

    temp_html = os.path.join(os.path.dirname(__file__), '..', 'docs', 'temp_deck.html')
    output_pdf = os.path.join(os.path.dirname(__file__), '..', 'docs', 'KioskDrop_Enterprise_12_Page_Business_Deck.pdf')

    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(full_html)

    edge_bin = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
    cmd = [
        edge_bin,
        '--headless',
        '--disable-gpu',
        '--no-pdf-header-footer',
        f'--print-to-pdf={output_pdf}',
        temp_html
    ]

    print("Running Edge print-to-pdf...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    
    if os.path.exists(temp_html):
        os.remove(temp_html)

    if os.path.exists(output_pdf):
        print(f"SUCCESS: Generated PDF at {output_pdf} (Size: {os.path.getsize(output_pdf)} bytes)")
    else:
        print(f"FAILED: PDF not created. Error: {res.stderr}")

if __name__ == '__main__':
    generate_pdf()
