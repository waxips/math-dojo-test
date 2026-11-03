# SPDX-License-Identifier: GPL-3.0-or-later
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import json
root=Path(__file__).resolve().parents[1]
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--allow-file-access-from-files'])
    page=browser.new_page(viewport={'width':1280,'height':900},accept_downloads=True)
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content((root/'trainers/strategy_library.html').read_text(encoding='utf-8'))
    assert page.locator('#bank-rows tr').count()==10
    assert '30 заданий' in page.locator('#library-count').inner_text()
    # Filter only linear, hard questions, and verify readable table sorting.
    page.locator('#filter-topic').select_option('linear')
    assert 'показано 10' in page.locator('#library-count').inner_text()
    page.locator('#filter-difficulty').select_option('3')
    assert 'показано 1' in page.locator('#library-count').inner_text()
    assert 'L09' in page.locator('#bank-rows').inner_text()
    page.locator('#filter-difficulty').select_option('all')
    page.locator('#filter-sort').select_option('id_desc')
    assert 'L10' in page.locator('#bank-rows tr').first.inner_text()
    page.locator('#filter-sort').select_option('skill')
    assert page.locator('#bank-rows tr').count()==10
    page.locator('#filter-topic').select_option('all')
    page.locator('#filter-skill').select_option('start')
    assert 'показано ' in page.locator('#library-count').inner_text()
    page.locator('#filter-skill').select_option('all')
    page.locator('#filter-query').fill('C03')
    assert 'показано 1' in page.locator('#library-count').inner_text()
    page.locator('#filter-query').fill('')
    # Selected questions survive a filter change.
    page.locator('#bank-rows input[type=checkbox]').first.check()
    assert 'Отмечено: 1' in page.locator('#chosen-counter').inner_text()
    page.locator('#filter-topic').select_option('linear')
    assert 'Отмечено: 1' in page.locator('#chosen-counter').inner_text()
    page.locator('#session-limit').select_option('all')
    page.locator('#session-order').select_option('sorted')
    page.locator('#start').click()
    assert page.locator('#practice:not(.hidden)').count()==1
    assert 'Вопрос 1 из 1' in page.locator('#progress-label').inner_text()
    qid=page.locator('#progress-help').inner_text()
    page.locator('#hint').click()
    assert page.locator('#hint-message:not(.hidden)').count()==1
    page.locator('#skip').click()
    assert page.locator('#explanation:not(.hidden)').count()==1
    assert page.locator('#variants button.correct').count()==1
    page.locator('#next').click()
    assert page.locator('#results:not(.hidden)').count()==1
    page.locator('#back-to-catalog').click()
    page.locator('#clear-selected').click()
    page.locator('#filter-topic').select_option('identities')
    page.locator('#session-limit').select_option('10')
    page.locator('#start').click()
    for i in range(10):
        assert page.locator('#variants button.choice').count()==4
        page.locator('#variants button.choice').first.click()
        page.locator('#next').click()
        if page.locator('#next').inner_text()=='Проверить выбор':
            assert page.locator('#explanation.hidden').count()==1
            page.locator('#reveal').click()
        assert page.locator('#variants button.correct').count()==1
        page.locator('#next').click()
    assert page.locator('#results:not(.hidden)').count()==1
    page.locator('#repeat').click()
    assert page.locator('#practice:not(.hidden)').count()==1
    # Dataset exports and import as independent browser operations.
    page.locator('#back-to-library').click()
    page.locator('summary').click()
    with page.expect_download() as dl:
        page.locator('#export-json').click()
    download=dl.value
    assert download.suggested_filename=='math-dojo-curated-library.json'
    # test empty/invalid import and valid tiny custom topic
    invalid=root/'tests'/'invalid_library_for_test.json'
    invalid.write_text('{"nonsense":true}',encoding='utf-8')
    page.locator('#import-file').set_input_files(str(invalid))
    expect(page.locator('#import-status')).to_contain_text('Импорт отклонён')
    raw=json.loads((root/'source/library/questions.json').read_text(encoding='utf-8'))
    raw['topics']['new_topic']='Новая тема'
    raw['questions'][0]['topic']='new_topic'
    edited=root/'tests'/'temporary_library_for_test.json'
    edited.write_text(json.dumps(raw,ensure_ascii=False),encoding='utf-8')
    page.locator('#import-file').set_input_files(str(edited))
    expect(page.locator('#import-status')).to_contain_text('Загружено 30 заданий')
    assert page.locator('#filter-topic option[value="new_topic"]').count()==1
    invalid.unlink();edited.unlink()
    assert not errors, '\n'.join(errors)
    print('Browser library: sorting, filtering, selection, 11-session paths, hints, export/import, custom topics passed.')
    page.close()
    mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    mobile.on('pageerror',lambda err:errors.append(str(err)))
    mobile.set_content((root/'trainers/strategy_library.html').read_text(encoding='utf-8'))
    assert mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'), 'Mobile overflow on catalog'
    mobile.locator('#start').click()
    assert mobile.evaluate('document.documentElement.scrollWidth<=window.innerWidth+1'), 'Mobile overflow on practice'
    mobile.screenshot(path=str(root/'tests/library_mobile.png'),full_page=True)
    print('Mobile library layout passed')
    page=browser.new_page()
    page.on('pageerror',lambda err:errors.append(str(err)))
    page.set_content((root/'index.html').read_text(encoding='utf-8'))
    assert page.locator('.topic-card').count()==12
    assert page.locator('.modes-grid .route-card').count()==3
    assert page.locator('a[href="trainers/strategy_library.html"]').count()==1
    assert page.locator('a[href^="trainers/how_to_start.html?topic="]').count()==3
    print('Home 12 legacy topic cards + 3 modes passed')
    page.close();browser.close()
assert not errors,'\n'.join(errors)
print('Library browser smoke passed')
# Independent full run through all 30 prepared questions, answer key read from embedded data
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page()
    page.set_content((root/'trainers/strategy_library.html').read_text(encoding='utf-8'))
    page.locator('#session-limit').select_option('all')
    page.locator('#session-order').select_option('sorted')
    page.locator('#start').click()
    for i in range(30):
        q=page.evaluate('''() => {const x=window.MathDojoCuratedData.questions;
          return x.find(q => q.id === document.querySelector('#progress-help').textContent.split(' · ')[0]);}''')
        assert q and q['correct']
        page.locator(f'#variants button[data-id="{q["correct"]}"]').click()
        page.locator('#next').click()
        assert page.locator('#feedback.good').count()==1, (i,q['id'])
        page.locator('#next').click()
    assert '30 из 30' in page.locator('#total-independent').inner_text()
    print('Full 30-question first-attempt walkthrough passed')
    browser.close()
