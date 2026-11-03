# SPDX-License-Identifier: GPL-3.0-or-later
from pathlib import Path
from html import escape
base=Path(__file__).resolve().parents[2]
assets=Path(__file__).resolve().parent
css=(assets/'style.css').read_text(encoding='utf-8')
js=(assets/'app.js').read_text(encoding='utf-8')
topics=['arithmetic','fractions','percentages','powers','linear_equations','quadratic_equations','linear_functions','quadratic_functions','geometry','mixed']
for topic in topics:
    # Easy per-student customization: edit this block in the generated HTML.
    config=f'''<script>
/* === НАСТРОЙКА ДЛЯ УЧЕНИКА: меняйте только значения ниже ===
   locale: ru | uk | en | pl | de
   sessionLength: количество заданий в тренировке
   seed: null = разные задания при каждом открытии; число = воспроизводимый набор
*/
window.MATH_DOJO_CONFIG = {{
  topic: "{topic}",
  locale: "ru",
  studentName: "",
  sessionLength: 6,
  seed: null
}};
</script>'''
    page=f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f7f4fd"><title>Math Dojo</title><style>{css}</style></head>
<body><div class="app"><header class="header"><div class="brand"><span class="logo" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3.4c1.5 0 2.2 3.2 2.2 4.5 1-1 3.7-2.8 4.8-1.7 1 1-1 3.7-2.1 4.7 1.3 0 4.5.7 4.5 2.2s-3.2 2.2-4.5 2.2c1 1 3 3.7 2.1 4.8-1.1 1-3.8-.9-4.8-2.1 0 1.3-.7 4.5-2.2 4.5s-2.2-3.2-2.2-4.5c-1 1.2-3.7 3.1-4.8 2.1-1-1.1 1-3.8 2.1-4.8-1.3 0-4.5-.7-4.5-2.2s3.2-2.2 4.5-2.2C5.7 10.9 3.8 8.2 4.8 7.2c1.1-1.1 3.8.8 4.8 1.7C9.6 7.6 10.3 3.4 12 3.4Z" stroke="white" stroke-width="1.6"/><circle cx="12" cy="12" r="2" fill="white"/></svg></span><span id="brand-text">Math Dojo</span></div><div class="head-actions"><span class="topic-label" id="topic-title"></span><button type="button" class="nav-btn" id="topics-button"></button></div></header>
<main class="layout"><div class="status"><span id="task-index"></span><span id="score"></span></div><div class="progress" id="progress"></div>
<section class="card" id="exercise"><div class="eyebrow" id="topic-eyebrow">MATH DOJO</div><h1 class="prompt" id="prompt"></h1><div class="math" id="math"></div><div class="visual-wrap" id="visual"></div><div class="answers"><label class="answer-label" id="answer-label" for="answer-0"></label><div class="inputs" id="inputs"></div><div class="choice-grid hidden" id="choices"></div></div><div id="feedback" class="feedback hidden" role="status" aria-live="polite"></div><div class="actions"><button type="button" class="primary" id="primary"></button></div></section>
<section class="card hidden" id="summary"><div class="summary"><div class="summary-icon">✦</div><h2 id="summary-title"></h2><p id="summary-detail"></p><button type="button" class="primary" id="again"></button></div></section>
<div class="bottom"><button type="button" class="small-btn" id="hint"></button><div class="bottom-right"><button type="button" class="small-btn hidden" id="reveal"></button><button type="button" class="small-btn" id="skip"></button></div></div></main></div>
<div id="topic-overlay" class="topic-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="topics-heading"><div class="topic-dialog"><div class="dialog-head"><h2 id="topics-heading"></h2><button class="close-btn" id="close-topics" aria-label="Close" type="button">×</button></div><div id="topic-list" class="topic-grid"></div></div></div>
{config}<script>{js}</script></body></html>'''
    if topic == 'linear_equations':
        page=page.replace('<div class="bottom"><button', '<div style="margin:4px 0 16px"><a class="hub-nav" href="how_to_start.html?topic=linear">Попробовать «Как начать?» · эксперимент</a></div><div class="bottom"><button', 1)
    page=page.replace('<!doctype html>', '<!doctype html>\n<!-- SPDX-License-Identifier: GPL-3.0-or-later -->', 1)
    (base/'trainers'/f'{topic}.html').write_text(page.replace('</style></head>', '.hub-nav{display:inline-flex;align-items:center;padding:9px 13px;border:1px solid #e8e0f2;background:white;color:#624b94;border-radius:12px;text-decoration:none;font-weight:800;font-size:13px;margin-left:auto}\n</style></head>').replace('<div class="head-actions">','<a class="hub-nav" href="../index.html">← Каталог</a><div class="head-actions">',1).replace('</head>', '<link rel="stylesheet" href="../assets/math.css"></head>').replace('<script>'+js+'</script>', '<script src="../assets/math.js"></script><script>'+js+'</script>'),encoding='utf-8')
print('Built',len(topics),'standalone legacy pages in trainers/')
