from pathlib import Path
root=Path(__file__).resolve().parents[2]
files=Path(__file__).resolve().parent
css=(files/'style.css').read_text(encoding='utf-8')
js=(files/'engine.js').read_text(encoding='utf-8')
template=(files/'template.html').read_text(encoding='utf-8')
for filename,topic,title in [
    ('formulas.html','identities','Формулы сокращённого умножения'),
    ('zero_product.html','zero','Нулевое произведение'),
]:
    output=(template.replace('{{STYLE}}',css)
        .replace('{{SCRIPT}}',js)
        .replace('{{TITLE}}',title)
        .replace('{{TOPIC}}',topic))
    (root/'trainers'/filename).write_text(output,encoding='utf-8')
print('Пересобраны 2 тренажёра')
