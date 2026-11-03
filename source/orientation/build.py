# SPDX-License-Identifier: GPL-3.0-or-later
from pathlib import Path
root=Path(__file__).resolve().parents[2]
here=Path(__file__).resolve().parent
src=(here/'template.html').read_text(encoding='utf-8')
for token,file in [('STYLE',root/'source'/'focused'/'style.css'),('EXTRA_STYLE',here/'extra.css'),('ENGINE',here/'engine.js'),('APP',here/'app.js')]:
    src=src.replace('{{'+token+'}}',file.read_text(encoding='utf-8'))
src=src.replace('</style></head>','</style><link rel="stylesheet" href="../assets/math.css"></head>')
src=src.replace('<script>{{APP}}</script>', '<script src="../assets/math.js"></script><script>{{APP}}</script>')
(root/'trainers'/'how_to_start.html').write_text(src,encoding='utf-8')
print('Built orientation pilot')
