'use client';

import {useLocale} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {GeminiDemoProvider,useGeminiDemo} from '@/components/gemini/demo-provider';
import {SiteHeader} from '@/components/marketing/site-header';
import {SiteFooter} from '@/components/marketing/site-footer';
import {Notice,PropertyImage} from '@/components/prototype/primitives';
import {findProperty,propertyListing} from '@/lib/canonical-property';
import {workspaceOrganization} from '@/lib/organization-engine';
import {useState} from 'react';

/** Same-browser preview only. An ID never grants access to another organization. */
export function LocalPropertyPreview({id}:{id:string}){
 return <GeminiDemoProvider><Preview id={id}/></GeminiDemoProvider>;
}
function Preview({id}:{id:string}){
 const {state,hydrated}=useGeminiDemo(),ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const [prepared,setPrepared]=useState(false),[message,setMessage]=useState('');
 const p=findProperty(state.properties,id),org=workspaceOrganization(state.organization);
 return <><SiteHeader/><main id="main-content" className="container ag-local-preview">
 {!hydrated?<p role="status">{t('Loading local preview…','جارٍ تحميل المعاينة المحلية…')}</p>:!p||p.status==='archived'?<><h1>{t('Property preview unavailable','معاينة العقار غير متاحة')}</h1><p>{t('This draft is not available in the selected demo agency on this browser.','هذه المسودة غير متاحة في الوكالة التجريبية المختارة في هذا المتصفح.')}</p><Link className="px-button px-button-dark" href="/sign-in">{t('Choose demo agency','اختيار وكالة تجريبية')}</Link></>:<>
 <Link className="px-text-link" href={`/workspace/inventory/${p.id}`}>{t('Back to property workspace','العودة إلى مساحة العقار')}</Link>
 <Notice>{t('Fictional local preview · not a published or verified listing. This link only works where this agency’s browser-local record is available.','معاينة محلية خيالية · ليست إعلاناً منشوراً أو متحققاً منه. يعمل الرابط فقط حيث يتوفر سجل الوكالة المحلي في المتصفح.')}</Notice>
 <div className="px-public-detail-title"><div><span className="px-overline">{org.brand} · {id}</span><h1>{(ar?p.facts.titleAr:p.facts.titleEn)||t('Untitled draft','مسودة دون عنوان')}</h1><p>{p.facts.district} · {p.facts.city}</p></div><strong>{p.facts.priceQar.toLocaleString(ar?'ar-QA':'en-US')} {t('QAR','ر.ق')}{p.facts.purpose==='rent'&&` / ${p.facts.rentalFrequency==='year'?t('year','سنة'):t('month','شهر')}`}</strong></div>
 <Link className="px-text-link" href={`/workspace/publish?property=${p.id}&goal=direct&channels=message&channel=message`}>{t('Prepare WhatsApp sharing in the demo','تجهيز مشاركة واتساب في التجربة')}</Link><div className="ag-local-preview-grid"><div><PropertyImage listing={propertyListing(p,ar)}/><div className="ag-local-gallery">{p.media.filter(m=>m.kind==='image'&&m.availability==='sample').map(m=><figure key={m.id}><PropertyImage listing={propertyListing({...p,media:[m]},ar)}/><figcaption>{m.name}</figcaption></figure>)}</div><p>{p.facts.beds} {t('bedrooms','غرف نوم')} · {p.facts.baths} {t('bathrooms','حمامات')} · {p.facts.areaSqm} {t('m²','م²')}</p><p lang={ar?'ar':'en'} dir={ar?'rtl':'ltr'}>{(ar?p.facts.descriptionAr:p.facts.descriptionEn)||t('No description supplied yet.','لم يُضف وصف بعد.')}</p></div>
 <aside className="ag-local-enquiry"><h2>{t('Prepare an enquiry','تجهيز استفسار')}</h2><p>{t('Preview your message locally. Nothing is sent or stored. Use fictional information only.','عاين رسالتك محلياً. لا تُرسل أو تُحفظ أي بيانات. استخدم معلومات خيالية فقط.')}</p><form onSubmit={e=>{e.preventDefault();setPrepared(true);}}><label className="px-field">{t('Message','الرسالة')}<textarea required rows={5} value={message} onChange={e=>{setMessage(e.target.value);setPrepared(false);}}/></label><button className="px-button px-button-dark" type="submit">{t('Preview enquiry','معاينة الاستفسار')}</button>{prepared&&<p role="status">{t('Enquiry prepared locally. Nothing was sent.','تم تجهيز الاستفسار محلياً. لم يُرسل شيء.')}</p>}</form></aside></div>
 </>}
 </main><SiteFooter/></>;
}
