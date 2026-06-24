from playwright.sync_api import sync_playwright
import pathlib
url='file://'+str(pathlib.Path('index.html').resolve())
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1280,'height':900})
    pg.goto(url); pg.wait_for_timeout(900)
    pg.evaluate("document.getElementById('teaching').scrollIntoView({block:'center'})")
    pg.wait_for_timeout(2600)  # дать transition доехать
    pg.screenshot(path='s_teach_ok.png')
    b.close()
print('ok')
