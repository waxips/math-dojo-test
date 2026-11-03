# SPDX-License-Identifier: GPL-3.0-or-later
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
    if topic == 'identities':
        output=output.replace('<p class="note">Чередуются', '<p><a class="go-back" href="how_to_start.html?topic=identities">Попробовать «Как начать?» · эксперимент</a></p><p class="note">Чередуются',1)
    output=output.replace('</style></head>', '</style><link rel="stylesheet" href="../assets/math.css"></head>')
    output=output.replace('<script>'+js+'</script>', '<script src="../assets/math.js"></script><script>'+js+'</script>')
    output=output.replace('<!doctype html>', '<!doctype html>\n<!-- SPDX-License-Identifier: GPL-3.0-or-later -->',1)
    (root/'trainers'/filename).write_text(output,encoding='utf-8')
print('Пересобраны 2 тренажёра')
