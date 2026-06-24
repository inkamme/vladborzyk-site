from playwright.sync_api import sync_playwright
import pathlib
url='file://'+str(pathlib.Path('index.html').resolve())
with sync_playwright() as p:
    b=p.chromium.launch()
    pg=b.new_page(viewport={'width':1280,'height':900})
    pg.goto(url); pg.wait_for_timeout(800)
    # медленно, маленькими шагами, до конца
    h = pg.evaluate("document.body.scrollHeight")
    y=0
    while y < h:
        pg.evaluate(f"window.scrollTo(0,{y})"); pg.wait_for_timeout(60); y+=200
    pg.wait_for_timeout(800)
    info = pg.evaluate("""() => {
      const out=[];
      document.querySelectorAll('.reveal').forEach(el=>{
        const cs=getComputedStyle(el);
        out.push({cls:el.className, op:cs.opacity, hasIn:el.classList.contains('in')});
      });
      return out;
    }""")
    for r in info: print(r)
    b.close()
