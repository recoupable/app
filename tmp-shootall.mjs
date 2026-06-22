import { chromium } from 'playwright';
import fs from 'fs';
const OUT = process.argv[2] || 'docs/tool-ui-audit/states/before';
const idx = JSON.parse(fs.readFileSync('storybook-static/index.json','utf8'));
const stories = Object.values(idx.entries).filter(e=>e.type==='story');
const browser = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const s of stories) {
  const page = await browser.newPage({ viewport:{width:480,height:800}, deviceScaleFactor:2 });
  try {
    await page.goto(`http://localhost:6010/iframe.html?id=${s.id}&viewMode=story`,{waitUntil:'networkidle',timeout:30000});
    await page.evaluate(()=>document.documentElement.classList.remove('dark'));
    let h = await page.evaluate(()=>document.body.scrollHeight);
    await page.setViewportSize({width:480,height:Math.min(Math.max(Math.ceil(h)+24,120),2400)});
    await page.waitForTimeout(900);
    await page.screenshot({ path:`${OUT}/${s.id}.png` });
  } catch(e){ console.log('FAIL', s.id, e.message.slice(0,60)); }
  await page.close();
}
console.log('done', stories.length);
await browser.close();
