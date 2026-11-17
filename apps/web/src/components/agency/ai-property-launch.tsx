'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';
import {ArrowRight,Sparkles} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {SearchCombobox} from '@/components/ui/search-combobox';
import {propertyContentChecks} from '@/lib/property-completeness';
import {destinationReadiness} from '@/lib/syndication-engine';
import {activeOrganizationId} from '@/lib/organization-engine';
import type {CanonicalProperty} from '@/lib/canonical-property';
import {PropertyCopyProposal} from './property-copy-proposal';
import {CopilotButton} from './maxpro-ai';

export function LaunchPropertyPicker(){
 const {state}=useGeminiDemo(),ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const properties=Object.values(state.properties).filter(p=>p.organizationId===activeOrganizationId(state.organization)&&p.status!=='archived');
 return <section className="ai-launch-picker"><span className="ag-ai-label"><Sparkles size={16}/>{t('Local preparation · human approval','تجهيز محلي · موافقة بشرية')}</span><h1>{t('AI Property Launch','إطلاق العقار بمساعدة AI')}</h1><p>{t('Create once. Prepare the content, review the requirements and launch each channel from the same property.','أنشئ العقار مرة واحدة. جهّز المحتوى وراجع المتطلبات ثم جهّز كل قناة من العقار نفسه.')}</p>{properties.length>0&&<SearchCombobox label={t('Select a property to launch','اختر عقاراً للإطلاق')} value="" placeholder={t('Choose a saved property','اختر عقاراً محفوظاً')} options={properties.map(p=>({value:p.id,label:(ar?p.facts.titleAr:p.facts.titleEn)||p.id,description:p.id}))} onValueChange={id=>document.getElementById(`launch-select-${id}`)?.click()}/>}<Link className="px-button px-button-dark" href="/workspace/inventory/new">{t('Create a property draft','إنشاء مسودة عقار')}<ArrowRight size={16}/></Link><p className="ag-help">{t('Deterministic assistance. No live AI provider, delivery or spend.','مساعدة حتمية. لا توجد خدمة AI فعلية أو إرسال أو إنفاق.')}</p><div hidden>{properties.map(p=><Link id={`launch-select-${p.id}`} href={`/workspace/publish?mode=launch&property=${p.id}`} key={p.id}>{p.id}</Link>)}</div></section>;
}
/** Content and navigation orchestration only. All downstream commands remain in PublishPromote. */
export function LaunchPreparation({property:p}:{property:CanonicalProperty}){
 const {state}=useGeminiDemo(),ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const [proposal,setProposal]=useState(false);const checks=propertyContentChecks(p),missing=checks.filter(c=>!c.complete),reviewed=p.source.factsReviewed&&p.source.copyReviewed;
 const base=`/workspace/inventory/${p.id}`,ready=(['qatar-living','property-finder','bayut-dubizzle'] as const).some(id=>destinationReadiness(state,p,id).canQueue);
 return <section className="ai-launch-preparation" aria-label={t('AI launch preparation','تجهيز إطلاق العقار')}>
  <div className="ai-launch-grid"><section><span className="ai-step-label">{t('2–3 · Content & suggestions','٢–٣ · المحتوى والاقتراحات')}</span><h2>{t('Prepare your listing','تجهيز إعلانك')}</h2><p>{checks.filter(c=>c.complete).length} / {checks.length} {t('content items supplied. Suggestions use saved facts only.','عناصر محتوى مكتملة. تستخدم الاقتراحات الحقائق المحفوظة فقط.')}</p><div className="ag-action-row"><button type="button" className="px-button px-button-outline" disabled={p.status==='archived'} onClick={()=>setProposal(true)}><Sparkles size={15}/>{t('Review bilingual suggestion','مراجعة اقتراح باللغتين')}</button><Link className="px-text-link" href={`${base}/media`}>{t('Review media','مراجعة الوسائط')}</Link></div></section>
  <section><span className="ai-step-label">{t('4 · Readiness & compliance','٤ · الجاهزية والامتثال')}</span><h2>{reviewed?t('Reviewed locally','تمت المراجعة محلياً'):t('Human review required','مراجعة بشرية مطلوبة')}</h2><p>{ready?t('A portal passes the current example checks. Each selected channel still needs its own approval.','تجتاز بوابة الفحوصات النموذجية الحالية. لا تزال كل قناة مختارة تحتاج إلى موافقتها.'):t('Inspect missing content and channel-specific requirements before approving a local queue.','افحص المحتوى الناقص ومتطلبات كل قناة قبل الموافقة على قائمة محلية.')}</p><div className="ag-action-row"><Link className="px-text-link" href={`${base}/edit?step=${missing.length?missing[0].step:3}${missing.length?`&field=${missing[0].key}`:''}`}>{missing.length?t('Complete missing information','إكمال المعلومات الناقصة'):t('Review facts & languages','مراجعة الحقائق واللغتين')}<ArrowRight size={14}/></Link><CopilotButton propertyId={p.id} prompt={t('Why is this listing not ready?','لماذا هذا الإعلان غير جاهز؟')} className="px-text-button"/></div></section></div>
  <details className="ai-launch-limitations"><summary>{t('Sources, missing information & future integrations','المصادر والمعلومات الناقصة والتكاملات المستقبلية')}</summary><p><bdi>{p.id}@{p.revision}</bdi> · {t('canonical facts, bilingual descriptions and ordered property media','حقائق العقار وأوصافه باللغتين ووسائطه المرتبة')}</p>{missing.length>0&&<ul>{missing.map(c=><li key={c.key}><Link href={`${base}/edit?step=${c.step}&field=${c.key}`}>{ar?c.ar:c.en}</Link></li>)}</ul>}<p>{t('Document/photo extraction needs a future server-side AI provider. Google Business Profile posts need separate eligibility and official access; they are not Google Ads. Neither is available in this demo.','يتطلب استخراج البيانات من المستندات والصور خدمة AI مستقبلية على الخادم. تحتاج منشورات ملف النشاط التجاري على جوجل إلى أهلية ووصول رسمي مستقلين؛ وهي ليست إعلانات جوجل. كلاهما غير متاح في التجربة.')}</p></details>
  {proposal&&<PropertyCopyProposal property={p} onClose={()=>setProposal(false)}/>}
 </section>;
}
