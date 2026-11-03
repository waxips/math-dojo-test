# SPDX-License-Identifier: GPL-3.0-or-later
from pathlib import Path
from urllib.parse import urlsplit
from bs4 import BeautifulSoup
root=Path(__file__).resolve().parents[1]
files=sorted((root/'trainers').glob('*.html'))
assert len(files)==15, f'Expected 15 trainer HTML pages (12 normal + mixed + orientation + library); found {len(files)}'
broken=[]
for p in [root/'index.html',*files]:
 s=BeautifulSoup(p.read_text(encoding='utf-8'),'html.parser')
 for tag in s.find_all(['a','script','link']):
  attr='href' if tag.name in ('a','link') else 'src'
  value=tag.get(attr,'')
  if not value or value.startswith(('http:','https:','mailto:','tel:','#','data:')):continue
  uri=urlsplit(value).path
  if uri and not (p.parent/uri).exists():broken.append((p.name,uri))
 for field in s.select('input[aria-label="Ответ"], input[aria-label="Введи свой ответ"], input.answer-input, #answer'):
  if field.get('type')!='text' or field.get('inputmode')!='text':broken.append((p.name,'keyboard:'+str(field)))
assert not broken,broken
print('Site audit passed:',len(files),'trainer pages and relative references, text input mode verified.')
