from playwright.sync_api import sync_playwright
import json
URL="file:///home/claude/smart-campus/code-based/index.html"
out=[]
def check(pg,s,d,b=False):
    pg.fill('#start',s); pg.fill('#duration',d)
    pg.set_checked('#blocked',b); pg.click('#check')
    return pg.inner_text('#result')
with sync_playwright() as p:
    br=p.chromium.launch()
    pg=br.new_page(viewport={'width':1280,'height':800})
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e))); pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(URL)
    # UI run of T1..T7
    cases=[('T1','10:30','60',False),('T2','09:30','60',False),('T3','10:30','60',True),('T4','10:30','0',False),
           ('T5','10:30','121',False),('T6','07:00','60',False),('T7','10:00','30',False)]
    for t,s,d,b in cases:
        out.append((t,s,d,b,check(pg,s,d,b)))
    # desktop screenshots
    check(pg,'10:30','60'); pg.screenshot(path='ui_available_desktop.png')
    check(pg,'09:30','60'); pg.screenshot(path='ui_overlap_desktop.png')
    # narrow screen
    pg2=br.new_page(viewport={'width':390,'height':760}); pg2.goto(URL); check(pg2,'10:30','121'); pg2.screenshot(path='ui_toolong_390.png')
    ow=pg2.evaluate("document.documentElement.scrollWidth<=window.innerWidth")
    # security: fuzz / XSS payloads
    payloads=['<img src=x onerror=window.__x=1>','<script>window.__x=1</script>','"><svg onload=window.__x=1>',"' OR '1'='1",'99999999999999999999','-1','1e3','12:60','\u0000']
    fuzz=[]
    for pl in payloads:
        pg.evaluate("window.__x=0")
        r1=check(pg,pl,'60'); r2=check(pg,'10:30',pl)
        fuzz.append((pl,r1.split(':')[0],r2.split(':')[0],pg.evaluate("window.__x")))
    # booking data unchanged in DOM/model
    model=pg.evaluate("JSON.stringify(window.CampusData.bookings)")
    br.close()
print("UI results:")
for r in out: print(r)
print("narrow 390px no horizontal scroll:",ow)
print("console/page errors:",errs)
print("fuzz (payload, start-result, duration-result, script-executed flag):")
for f in fuzz: print(f)
print("bookings model:",model)
