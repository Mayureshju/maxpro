import {test,expect,selectChoice,selectDemoOrganization} from './fixtures';

for(const locale of ['en','ar']){
 const ar=locale==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 test(`client reference ${locale}: registration, canonical preview and organization recovery`,async({page})=>{
  const mutations:string[]=[];page.on('request',r=>{if(['POST','PUT','PATCH','DELETE'].includes(r.method()))mutations.push(r.url());});
  await page.goto(`/${locale}/register`);await page.getByRole('textbox',{name:t('Agency name','اسم الوكالة'),exact:true}).fill('Demo Reference Agency');
  await page.getByRole('button',{name:t('Create demo agency','إنشاء وكالة تجريبية'),exact:true}).click();await expect(page.locator('.ag-getting-started')).toBeVisible();
  await expect(page.locator('.ag-workspace-totals b')).toHaveText(['0','0','0','0','0']);
  await page.goto(`/${locale}/workspace/inventory/new`);
  await page.getByRole('textbox',{name:t('Property title','عنوان العقار'),exact:true}).fill('Demo reference courtyard');await page.getByRole('textbox',{name:t('City','المدينة'),exact:true}).fill('Doha');await page.getByRole('spinbutton',{name:t('Asking price (QAR)','السعر المطلوب (ر.ق)'),exact:true}).fill('8200');
  await page.getByRole('button',{name:t('Save & continue','حفظ ومتابعة'),exact:true}).click();await expect(page).toHaveURL(/\/edit$/);const id=page.url().split('/').at(-2)!;
  await page.goto(`/${locale}/properties/${id}`);await expect(page.locator('h1')).toHaveText('Demo reference courtyard');await expect(page.locator('main')).toContainText(ar?'٨٬٢٠٠':'8,200');
  await expect(page.locator('main')).toContainText(t('not a published or verified listing','ليست إعلاناً منشوراً أو متحققاً منه'));
  await page.getByRole('textbox',{name:t('Message','الرسالة'),exact:true}).fill('Fictional enquiry for this saved property.');await page.getByRole('button',{name:t('Preview enquiry','معاينة الاستفسار'),exact:true}).click();await expect(page.getByRole('status')).toContainText(t('Nothing was sent','لم يُرسل شيء'));
  const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('maxpro-gemini-v3-demo-state')!));
  await page.getByRole('link',{name:t('Prepare WhatsApp sharing in the demo','تجهيز مشاركة واتساب في التجربة'),exact:true}).click();await expect(page).toHaveURL(/goal=direct/);await expect(page.locator('.ag-channel-tabs')).toContainText(t('WhatsApp Business message','رسالة واتساب للأعمال'));
  await selectDemoOrganization(page,'ORG-DEMO-PEARL');await page.goto(`/${locale}/properties/${id}`);await expect(page.locator('h1')).toHaveText(t('Property preview unavailable','معاينة العقار غير متاحة'));await expect(page.locator('main')).not.toContainText('Demo reference courtyard');
  await page.goto(`/${locale}/sign-in`);const agency=page.getByRole('combobox',{name:t('Demo agency','الوكالة التجريبية'),exact:true});await selectChoice(page,agency,before.organization.activeOrganizationId);await page.getByRole('button',{name:t('Enter demo workspace','دخول مساحة العمل التجريبية'),exact:true}).click();await expect(page.locator('.ag-workspace-totals b').first()).toHaveText('1');
  expect(mutations).toEqual([]);
 });
 test(`client reference ${locale}: compact navigation, fonts, keyboard and reduced motion`,async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto(`/${locale}`);await page.evaluate(async()=>{await Promise.all([document.fonts.load('16px Manrope'),document.fonts.load('16px "IBM Plex Sans Arabic"')]);await document.fonts.ready;});
  expect(await page.evaluate(()=>document.fonts.check('16px Manrope'))).toBe(true);expect(await page.evaluate(()=>document.fonts.check('16px "IBM Plex Sans Arabic"'))).toBe(true);
  await expect(page.locator('.desktop-nav>details,.desktop-nav>a')).toHaveCount(4);
  const platform=page.locator('.mk-nav-disclosure summary');await platform.focus();await page.keyboard.press('Enter');await expect(page.locator('.mk-nav-disclosure')).toHaveAttribute('open','');await page.keyboard.press('Escape');await expect(platform).toBeFocused();
  await page.locator('.header-cta').click();await expect(page).toHaveURL(new RegExp(`/${locale}/register$`));await expect(page.getByRole('combobox',{name:/persona|شخصية/})).toHaveCount(0);
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(`/${locale}/workspace`);await expect(page.locator('html')).toHaveAttribute('dir',ar?'rtl':'ltr');
  const collapse=page.getByRole('button',{name:t('Collapse sidebar','طي الشريط الجانبي'),exact:true});await collapse.click();await page.reload();await expect(page.locator('.prototype-shell')).toHaveClass(/sidebar-collapsed/);expect(await page.locator('.prototype-shell').evaluate(el=>parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(.01);
 });
 test(`client reference ${locale}: sharing preview reflects canonical edits without replacing catalogue examples`,async({page})=>{
  await page.goto(`/${locale}/workspace/inventory/AQ-10233/edit?step=1`);
  await page.getByRole('textbox',{name:ar?'العنوان بالعربية':'Title — English',exact:true}).fill('Demo edited canonical title');await page.getByRole('button',{name:t('Save draft','حفظ المسودة'),exact:true}).click();
  await page.goto(`/${locale}/properties/AQ-10233?preview=local`);await expect(page.locator('h1')).toHaveText('Demo edited canonical title');
  await page.goto(`/${locale}/properties/AQ-10233`);await expect(page.locator('h1')).not.toHaveText('Demo edited canonical title');
 });
 test(`client reference ${locale}: core journeys fit six widths and short viewports`,async({page},info)=>{
  test.skip(info.project.name==='mobile-chromium','One full width matrix per locale; workflow interactions run in both device projects.');test.setTimeout(180000);
  const routes=['','/properties/AQ-10233?preview=local','/register','/workspace','/workspace/inventory/new','/workspace/inventory/AQ-10233/edit','/workspace/publish?property=AQ-10233&goal=portals&channels=qatar-living&channel=qatar-living','/workspace/inbox','/pricing'];
  for(const width of [1440,1280,1024,768,375,320])for(const route of routes){await page.setViewportSize({width,height:width<=375?600:900});await page.goto(`/${locale}${route}`);await expect(page.locator('main h1').first()).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${locale}${route}@${width}`).toBeLessThanOrEqual(width+1);}
 });
}
