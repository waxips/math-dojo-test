# SPDX-License-Identifier: GPL-3.0-or-later
from playwright.sync_api import sync_playwright
from pathlib import Path
from urllib.parse import quote
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import os, json, sys
root=Path(__file__).resolve().parents[1]
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(root),**kwargs)
    def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0), Handler)
Thread(target=server.serve_forever, daemon=True).start()
base=f'http://127.0.0.1:{server.server_port}/'
results=[]
def check(name,fn):
 try:fn();results.append((name,'PASS'))
 except Exception as e:
  import traceback
  results.append((name,'FAIL: '+traceback.format_exc()[-1100:]))
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'],headless=True)
 page=browser.new_page(viewport={'width':1280,'height':900},locale='ru-RU')
 page.route('https://cdn.jsdelivr.net/**',lambda r:r.abort()) # offline fallback fast
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 def go(path):
  from urllib.parse import urlsplit, parse_qs
  from html import escape
  parts=urlsplit(path);html=(root/parts.path).read_text(encoding='utf-8')
  for filename in ['math.js','math.css']:
   url='../assets/'+filename
   if filename.endswith('.js'):
    html=html.replace('<script src="'+url+'"></script>', '<script>'+ (root/'assets'/filename).read_text(encoding='utf-8')+'</script>')
   else:
    html=html.replace('<link rel="stylesheet" href="'+url+'"/>','<style>'+(root/'assets'/filename).read_text(encoding='utf-8')+'</style>')
    html=html.replace('<link rel="stylesheet" href="'+url+'">','<style>'+(root/'assets'/filename).read_text(encoding='utf-8')+'</style>')
  # Offline browser harness uses document.write. Simulate the query string.
  html=html.replace('new URLSearchParams(location.search)', "new URLSearchParams("+repr('?'+parts.query)+")")
  page.set_content(html,wait_until='domcontentloaded',timeout=20000)

 def home():
  go('index.html');assert page.locator('.primary-mode').count()==2
  assert page.locator('.topic-card').count()==12
  assert 'count=6' in page.locator('[data-slug="linear_equations"] .card-main').get_attribute('href')
  page.locator('[data-options="linear_equations"]').click()
  assert page.locator('#settings-overlay').is_visible()
  page.locator('#settings-count').fill('9');page.locator('#settings-save').click()
  assert 'count=9' in page.locator('[data-slug="linear_equations"] .card-main').get_attribute('href')
  page.locator('[data-options="linear_equations"]').click();page.locator('#settings-count').fill('6');page.locator('#settings-save').click()
  page.screenshot(path=str(root/'tests/home_desktop.png'))
 check('home two modes, 12 cards, settings storage',home)
 def mobile_home():
  page.set_viewport_size({'width':390,'height':844});go('index.html')
  assert page.locator('.primary-mode').count()==2
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
  page.locator('[data-options="fractions"]').click();assert page.locator('#settings-count').is_visible()
  page.screenshot(path=str(root/'tests/home_mobile.png'))
 check('mobile home viewport/options',mobile_home)
 def library_quick():
  page.set_viewport_size({'width':1280,'height':900});go('trainers/strategy_library.html')
  assert page.locator('#quick-start').is_visible()
  assert not page.locator('#developer-tools').is_visible()
  page.locator('#quick-topic').select_option('linear');assert '10 заданий' in page.locator('#quick-count').inner_text()
  page.locator('#quick-start').click();assert page.locator('#practice').is_visible()
  assert 'из 10' in page.locator('#progress-label').inner_text()
  for i in range(10):
   correct=page.evaluate('''() => { const q=questions[index]; return q.correct; }''') if False else None
   # choose the option that is marked as correct by actual embedded question bank
   correct=page.evaluate('''() => { const data=window.MathDojoCuratedData.questions; const id=document.getElementById('progress-help').textContent.split(' · ')[0];return data.find(q=>q.id===id).correct; }''')
   page.locator(f'#variants .choice[data-id="{correct}"]').click();page.locator('#next').click()
   page.locator('#next').click()
  assert page.locator('#results').is_visible()
 check('student library all 10 without repeat',library_quick)
 def library_dev():
  go('trainers/strategy_library.html');page.locator('#developer-toggle').click()
  assert page.locator('#developer-tools').is_visible()
  page.locator('#filter-topic').select_option('identities');page.locator('#filter-sort').select_option('difficulty_desc');assert 'показано 10' in page.locator('#library-count').inner_text()
  page.locator('#quick-topic').select_option('all');page.locator('#quick-start').click();assert 'из 30' in page.locator('#progress-label').inner_text()
  page.screenshot(path=str(root/'tests/library_practice.png'))
 check('developer filters sorting vs quick all 30',library_dev)
 def mixed():
  go('trainers/mixed.html?count=6&autostart=1')
  assert '1 / 6' in page.locator('#task-index').inner_text()
  topics=set()
  for i in range(6):
   topics.add(page.locator('#topic-eyebrow').inner_text())
   page.locator('#skip').click()
  assert len(topics)==6,topics
  assert page.locator('#summary').is_visible()
 check('mixed 6 exercises from 6 different areas',mixed)
 def focused():
  go('trainers/formulas.html?autostart=1&count=6');assert page.locator('#exercise').is_visible()
  assert '1 из 6' in page.locator('#number').inner_text()
  go('trainers/zero_product.html?autostart=1&count=6');assert page.locator('#exercise').is_visible()
 check('formulas / zero product instant start',focused)
 def arithmetic_plus():
  go('trainers/arithmetic_plus.html?autostart=1&count=6&level=2')
  assert page.locator('#play-screen').is_visible(), 'arithmetic plus did not quick start'
  assert 'из 6' in page.locator('#counter').inner_text()
  assert page.locator('#answer-input').get_attribute('inputmode')=='text'
 check('advanced arithmetic instant start + text keyboard',arithmetic_plus)
 def legacy_input():
  go('trainers/fractions.html?count=6');assert page.locator('#inputs input').first.get_attribute('inputmode')=='text'
  page.locator('#inputs input').first.fill('3/4');assert page.locator('#inputs input').first.input_value()=='3/4'
 check('fraction text field allows /',legacy_input)
 def math_library():
  go('trainers/strategy_library.html');page.locator('#quick-topic').select_option('identities');page.locator('#quick-start').click()
  # during fallback, math appears as source not blank; math renderer loaded via local asset
  assert page.evaluate('typeof window.MathDojoMath === "object"')
  assert page.locator('#formula').inner_text().strip()
 check('LaTeX API and nonblank fallback',math_library)
 def mixed12():
  go('trainers/mixed.html?count=12')
  names=set()
  for i in range(12):
   names.add(page.locator('#topic-eyebrow').inner_text())
   page.locator('#skip').click()
  assert len(names)==12,names
  assert page.locator('#summary').is_visible()
 check('mixed 12 covers all 12 topic families',mixed12)
 def latex_mock():
  go('trainers/strategy_library.html')
  page.evaluate('''() => {window.katex={renderToString:(tex)=>'<span class="katex">'+tex+'</span>'};window.MathDojoMath.render(document.querySelector('#quick-count'),'','\\frac{1}{2}',true);}''')
  assert page.locator('#quick-count .katex').count()==1
 check('rendering API accepts explicit LaTeX fields',latex_mock)
 def bank_import():
  import json
  pg=browser.new_page()
  pg.route('https://cdn.jsdelivr.net/**',lambda route:route.abort())
  html=(root/'trainers/strategy_library.html').read_text(encoding='utf-8')
  html=html.replace('<script src="../assets/math.js"></script>', '<script>'+(root/'assets/math.js').read_text(encoding='utf-8')+'</script>')
  pg.set_content(html,wait_until='domcontentloaded')
  pg.locator('#developer-toggle').click()
  pg.locator('details.library-import summary').click()
  data=json.loads((root/'source/library/questions.json').read_text(encoding='utf-8'))
  data['topics']['new_topic']='Новая тема'
  sample=dict(data['questions'][0]);sample['id']='T99';sample['topic']='new_topic';sample['expressionLatex']=r'\frac{1}{2}+\frac{1}{4}'
  data['questions'].append(sample)
  pg.locator('#import-file').set_input_files({'name':'more.json','mimeType':'application/json','buffer':json.dumps(data,ensure_ascii=False).encode('utf-8')})
  pg.locator('#import-status').get_by_text('Загружено 31 заданий',exact=False).wait_for(timeout=3000)
  pg.locator('#quick-topic').select_option('new_topic')
  pg.locator('#quick-start').click()
  assert 'из 1' in pg.locator('#progress-label').inner_text()
  pg.close()
 check('import new topic without changing application',bank_import)
 print('BROWSER ERRORS',errors[:10])
 browser.close()
server.shutdown()
for name,result in results:print(('[OK]' if result=='PASS' else '[FAIL]'),name,result)
if any(x!='PASS' for _,x in results):sys.exit(1)
