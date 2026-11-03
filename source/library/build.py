# SPDX-License-Identifier: GPL-3.0-or-later
"""Build a self-contained static HTML page, usable from file:// and GitHub Pages."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
here=Path(__file__).resolve().parent
src=(here/'template.html').read_text(encoding='utf-8')
data=json.loads((here/'questions.json').read_text(encoding='utf-8'))
for token, path in [('STYLE',root/'source'/'focused'/'style.css'),('EXTRA_STYLE',root/'source'/'orientation'/'extra.css'),('LIBRARY_STYLE',here/'extra.css'),('APP',here/'app.js')]:
    src=src.replace('{{'+token+'}}',path.read_text(encoding='utf-8'))
src=src.replace('</style></head>','</style><link rel="stylesheet" href="../assets/math.css"></head>')
src=src.replace('<script>{{APP}}</script>', '<script src="../assets/math.js"></script><script>{{APP}}</script>')
src=src.replace('{{DATA}}', json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c'))
assert '{{' not in src
(root/'trainers'/'strategy_library.html').write_text(src,encoding='utf-8')
print('Built trainers/strategy_library.html with',len(data['questions']),'curated records')
