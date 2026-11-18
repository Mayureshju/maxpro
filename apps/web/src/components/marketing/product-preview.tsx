'use client';
import {useId,useState,type KeyboardEvent} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {pick,type MarketingLocale} from '@/lib/marketing-content';
import {FocusedShot,type StoryScreen} from './focused-shot';
const chapters=[
 {screen:'property',label:['Create','أنشئ'],title:['One property. All the essentials.','عقار واحد. وكل التفاصيل.'],body:['Keep facts, photos, pricing and both languages in one record. Your team starts from the same information, every time.','اجمع الحقائق والصور والأسعار واللغتين في سجل واحد. يبدأ فريقك من المعلومات نفسها في كل مرة.'],outcome:['A reliable source for the work ahead.','مصدر موثوق للخطوات التالية.'],href:'/workspace/inventory/AQ-10231'},
 {screen:'prepare',label:['Prepare','جهّز'],title:['A first draft. Your final say.','مسودة أولى. والقرار لك.'],body:['Start from facts. Review every suggestion beside its source, edit the English and Arabic copy, then decide what to keep.','ابدأ بالحقائق. وراجع كل اقتراح بجانب مصدره، وعدّل النص بالعربية والإنجليزية ثم اختر ما تحتفظ به.'],outcome:['Less repeated writing. Human review stays central.','كتابة متكررة أقل. والمراجعة البشرية أساسية.'],href:'/workspace/inventory/AQ-10231/edit?assist=1'},
 {screen:'promote',label:['Promote','روّج'],title:['A plan for the right channels.','خطة للقنوات المناسبة.'],body:['Prepare a portal listing, an ad or a sharing draft from the same property. Keep creative, budget and required approvals in context.','جهّز إعلان بوابة أو إعلاناً مدفوعاً أو مسودة مشاركة من العقار نفسه. اجمع المحتوى والميزانية والموافقات المطلوبة في سياقها.'],outcome:['Approved → queued locally ≠ accepted by a provider.','معتمد ← طابور محلي ≠ قبول المزوّد.'],href:'/workspace/publish?property=AQ-10231'},
 {screen:'follow',label:['Follow up','تابع'],title:['The next enquiry has a next step.','لكل استفسار خطوة تالية.'],body:['Keep the property and first source attached to the conversation. Assign an agent, confirm requirements and record the next follow-up or viewing.','احتفظ بالعقار والمصدر الأول مع المحادثة. عيّن وكيلاً وأكّد المتطلبات وسجّل المتابعة أو المعاينة التالية.'],outcome:['Clear ownership, from conversation to viewing.','مسؤولية واضحة، من المحادثة إلى المعاينة.'],href:'/workspace/inbox?lead=LE-2101'}
] as const;
export function ProductPreview({locale}:{locale:MarketingLocale}){
 const [active,setActive]=useState(0),id=useId(),item=chapters[active],t=(en:string,ar:string)=>pick(locale,[en,ar]);
 function navigate(e:KeyboardEvent<HTMLButtonElement>,index:number){let next=index;const forward=locale==='ar'?'ArrowLeft':'ArrowRight',back=locale==='ar'?'ArrowRight':'ArrowLeft';if(e.key===forward||e.key==='ArrowDown')next=(index+1)%chapters.length;else if(e.key===back||e.key==='ArrowUp')next=(index+chapters.length-1)%chapters.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=chapters.length-1;else return;e.preventDefault();setActive(next);document.getElementById(`${id}-tab-${next}`)?.focus();}
 return <div className="mx-story" data-testid="product-preview">
  <div className="mx-story-rail"><div role="tablist" aria-label={t('The property journey','رحلة العقار')} className="mx-chapter-controls">{chapters.map((chapter,i)=><button type="button" role="tab" id={`${id}-tab-${i}`} key={chapter.screen} aria-selected={active===i} aria-controls={`${id}-panel`} tabIndex={active===i?0:-1} onKeyDown={e=>navigate(e,i)} onClick={()=>setActive(i)}><span aria-hidden="true">0{i+1}</span>{pick(locale,chapter.label)}<ArrowUpRight size={17} aria-hidden="true"/></button>)}</div></div>
  <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} tabIndex={0} className="mx-story-panel" data-chapter={item.screen}>
   <div className="mx-story-copy"><span className="mx-kicker">{t('THE OUTCOME','النتيجة')}</span><h3>{pick(locale,item.title)}</h3><p>{pick(locale,item.body)}</p><p className="mx-story-outcome">{pick(locale,item.outcome)}</p><Link className="mk-text-link" href={item.href}>{t('Try this in the demo','جرّب هذا في النموذج')}<ArrowUpRight size={17}/></Link></div>
   <div className="mx-story-visual" key={item.screen}><FocusedShot locale={locale} screen={item.screen as StoryScreen} alt={pick(locale,item.title)}/></div>
  </div>
 </div>;
}
