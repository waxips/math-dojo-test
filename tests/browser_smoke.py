# SPDX-License-Identifier: GPL-3.0-or-later
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium', args=['--no-sandbox','--allow-file-access-from-files'])
    for topic in ['calculations','linear','identities']:
        page=browser.new_page(viewport={'width':1280,'height':900})
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content((root/'trainers'/'how_to_start.html').read_text(encoding='utf-8'))
        if topic!='calculations': page.locator('.topic-option',has_text={'linear':'Линейные уравнения','identities':'Формулы сокращённого умножения'}[topic]).click()
        assert page.locator('.topic-option.current').count()==1
        assert page.locator('a#regular-link').get_attribute('href')=={'calculations':'arithmetic_plus.html','linear':'linear_equations.html','identities':'formulas.html'}[topic]
        page.locator('#start').click()
        for i in range(10):
            assert page.locator('#practice:not(.hidden)').count()==1
            assert page.locator('#variants button.choice').count()==4
            # Check that an incorrect choice does not complete the task and does not reveal key
            if i==0:
                page.locator('#hint').click()
                assert page.locator('#hint-message:not(.hidden)').count()==1
                page.locator('#variants button.choice').first.click()
                page.locator('#next').click()
                if page.locator('#next').inner_text()=='Проверить выбор':
                    assert page.locator('#explanation.hidden').count()==1
                    page.locator('#reveal').click()
            else:
                page.locator('#skip').click()
            assert page.locator('#explanation:not(.hidden)').count()==1
            assert page.locator('button.choice.correct').count()==1
            page.locator('#next').click()
        assert page.locator('#results:not(.hidden)').count()==1
        page.locator('#repeat').click()
        assert page.locator('#practice:not(.hidden)').count()==1
        print('Browser pilot',topic,'passed')
        page.close()
    # Mobile accessibility and layout
    page=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.set_content((root/'trainers'/'how_to_start.html').read_text(encoding='utf-8'))
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1')
    page.locator('#start').click()
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth+1')
    page.screenshot(path=str(root/'tests'/'orientation_mobile.png'), full_page=True)
    page.close()
    # Source originals still independently playable
    for file,selector in [('arithmetic_plus.html','#start'),('linear_equations.html','#exercise'),('formulas.html','#start')]:
        page=browser.new_page()
        page.on('pageerror',lambda error:errors.append(str(error)))
        page.set_content((root/'trainers'/file).read_text(encoding='utf-8'))
        assert page.locator(selector).count()==1
        assert page.locator('a[href^="how_to_start.html?topic="]').count()==1
        if file=='arithmetic_plus.html':
            page.locator('#start').click()
            assert page.locator('#play-screen:not(.hidden)').count()==1
        if file=='formulas.html':
            page.locator('#start').click()
            assert page.locator('#exercise:not(.hidden)').count()==1
        print('Original preserved',file)
        page.close()
    page=browser.new_page()
    page.set_content((root/'index.html').read_text(encoding='utf-8'))
    assert page.locator('a[href^="trainers/how_to_start.html?"]').count()==3
    assert page.locator('.topic-card').count()==12
    print('Catalogue preserved 12 regular topic cards, new links 3')
    browser.close()
assert not errors, '\n'.join(errors)
print('Browser smoke passed')
