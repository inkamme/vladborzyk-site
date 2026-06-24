from playwright.sync_api import sync_playwright
import pathlib
url='file://'+str(pathlib.Path('index.html').resolve())
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1280,'height':900})
    pg.goto(url); pg.wait_for_timeout(1500)
    pg.screenshot(path='s_hero.png')
    for y in range(0,4600,260): pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(80)
    pg.evaluate("document.getElementById('teaching').scrollIntoView({block:'center'})"); pg.wait_for_timeout(700)
    pg.screenshot(path='s_teach.png')
    pg.evaluate("document.getElementById('work').scrollIntoView({block:'start'})"); pg.wait_for_timeout(600)
    pg.screenshot(path='s_work.png')
    b.close()
print('ok')
