'use client';

import {useEffect,useId,useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import {ArrowRight,Sparkles,X} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {SearchCombobox} from '@/components/ui/search-combobox';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {activeOrganizationId,can} from '@/lib/organization-engine';
import {copilotAnswer} from '@/lib/copilot';
import {PropertyCopyProposal} from './property-copy-proposal';

const eventName='maxpro-open-ai';
type AIRequest={prompt?:string;propertyId?:string};
export function CopilotButton({prompt,propertyId,className='px-button px-button-outline'}:AIRequest&{className?:string}){
 const ar=useLocale()==='ar';return <button type="button" className={className} onClick={()=>window.dispatchEvent(new CustomEvent<AIRequest>(eventName,{detail:{prompt,propertyId}}))}><Sparkles size={16}/>{ar?'اسأل ماكس برو AI':'Ask MaxPro AI'}</button>;
}
export function MaxProAI({path}:{path:string}){
 const {state}=useGeminiDemo(),search=useSearchParams(),ar=useLocale()==='ar';
 const [request,setRequest]=useState<AIRequest|null>(null);
 useEffect(()=>{const onOpen=(event:Event)=>setRequest((event as CustomEvent<AIRequest>).detail||{});window.addEventListener(eventName,onOpen);return()=>window.removeEventListener(eventName,onOpen);},[]);
 const campaign=state.campaigns.find(c=>path===`/workspace/campaigns/${c.id}`),leadId=search.get('lead')||path.match(/^\/workspace\/leads\/([^/]+)$/)?.[1];
 const lead=state.crm.leads.find(l=>l.id===leadId);
 const propertyId=request?.propertyId||path.match(/^\/workspace\/inventory\/([^/]+)/)?.[1]||search.get('property')||campaign?.input.propertyId||lead?.propertyId;
 return <><button type="button" className="ws-ai-entry" aria-haspopup="dialog" onClick={()=>setRequest({})}><Sparkles size={17}/><span>{ar?'ماكس برو AI':'MaxPro AI'}</span></button>{request&&<CopilotDrawer key={`${activeOrganizationId(state.organization)}-${path}-${search.toString()}`} propertyId={propertyId} leadId={leadId||undefined} prompt={request.prompt} path={path} onClose={()=>setRequest(null)}/>}</>;
}
function CopilotDrawer({propertyId,leadId,prompt,path,onClose}:{propertyId?:string;leadId?:string;prompt?:string;path:string;onClose:()=>void}){
 const {state}=useGeminiDemo(),ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const dialog=useRef<HTMLDialogElement>(null),id=useId();const [selected,setSelected]=useState(propertyId||''),[input,setInput]=useState(''),[submitted,setSubmitted]=useState(prompt||''),[proposal,setProposal]=useState(false);
 const org=activeOrganizationId(state.organization),properties=Object.values(state.properties).filter(p=>p.organizationId===org),p=properties.find(p=>p.id===selected);
 const answer=submitted?copilotAnswer(state,submitted,selected,leadId,ar):null;
 const prompts=[
  t('Which properties need attention?','أي عقارات تحتاج إلى اهتمام؟'),
  t('Why is this listing not ready?','لماذا هذا الإعلان غير جاهز؟'),
  t('Improve bilingual descriptions','حسّن الوصف باللغتين'),
  t('Prepare a Facebook campaign','تجهيز حملة فيسبوك'),
  t('Show unanswered enquiries','عرض الاستفسارات دون رد'),
  t('Prepare a WhatsApp follow-up','تجهيز متابعة واتساب'),
  t('Explain channel requirements','شرح متطلبات القنوات'),
  t('Explain recorded performance','شرح الأداء المسجل'),
 ];
 const contextual=path.includes('analytics')?7:/leads|inbox/.test(path)?4:path.includes('campaign')?3:path.includes('publish')?6:p?1:0;
 const ordered=[prompts[contextual],...prompts.filter((_,i)=>i!==contextual)];
 useEffect(()=>{const node=dialog.current,trigger=document.activeElement instanceof HTMLElement?document.activeElement:null,overflow=document.body.style.overflow;node?.showModal();document.body.style.overflow='hidden';return()=>{node?.close();document.body.style.overflow=overflow;if(trigger?.isConnected)trigger.focus();};},[]);
 return <><dialog ref={dialog} className="ai-copilot" aria-labelledby={`${id}-title`} aria-describedby={`${id}-limit`} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="ai-copilot-inner"><header><div><span className="ag-ai-label"><Sparkles size={16}/>{t('Local demo · no live AI provider','تجربة محلية · لا توجد خدمة AI فعلية')}</span><h2 id={`${id}-title`}>{t('MaxPro AI','ماكس برو AI')}</h2></div><button type="button" className="ag-icon-button" autoFocus aria-label={t('Close MaxPro AI','إغلاق ماكس برو AI')} onClick={onClose}><X size={20}/></button></header>
  <div className="ai-copilot-body"><p id={`${id}-limit`} className="ag-help">{t('Bounded assistance from your saved demo records. No model request, remote publication, message delivery or spend.','مساعدة محددة من سجلاتك التجريبية المحفوظة. لا طلب لخدمة AI ولا نشر خارجي ولا إرسال رسائل ولا إنفاق.')}</p>
   <SearchCombobox label={t('AI property context','سياق العقار للمساعد')} value={selected} options={[{value:'',label:t('Agency-wide context','سياق الوكالة بالكامل')},...properties.map(p=>({value:p.id,label:(ar?p.facts.titleAr:p.facts.titleEn)||t('Untitled draft','مسودة دون عنوان'),description:p.id}))]} onValueChange={value=>{setSelected(value);setSubmitted('');setProposal(false);}}/>
   {p&&<p className="ai-source-ref"><bdi>{p.id} · r{p.revision}</bdi> · <Link href={`/workspace/inventory/${p.id}`}>{t('Open property','فتح العقار')}</Link></p>}
   <div className="ai-prompt-list" aria-label={t('Suggested AI tasks','مهام المساعد المقترحة')}>{ordered.map(text=><button type="button" key={text} aria-pressed={submitted===text} onClick={()=>setSubmitted(text)}>{text}<ArrowRight size={14}/></button>)}</div>
   {answer&&<section className="ai-answer" aria-label={t('Local assistance result','نتيجة المساعدة المحلية')} aria-live="polite"><h3>{answer.title}</h3><p>{answer.body}</p>{answer.items.length>0&&<ul>{answer.items.map((item,i)=><li key={`${item.label}-${i}`}>{item.href?<Link href={item.href}><strong>{item.label}</strong>{item.detail&&<small>{item.detail}</small>}<ArrowRight size={14}/></Link>:<span>{item.label}{item.detail&&<small>{item.detail}</small>}</span>}</li>)}</ul>}{answer.proposeCopy&&p&&<button type="button" className="px-button px-button-dark" disabled={!can(state.organization,'property.edit')} onClick={()=>setProposal(true)}>{t('Review copy proposal','مراجعة اقتراح الوصف')}</button>}{answer.proposeCopy&&!can(state.organization,'property.edit')&&<p>{t('Your demo role cannot edit property content.','دورك التجريبي لا يسمح بتعديل محتوى العقار.')}</p>}<details open><summary>{t('Sources & scope','المصادر والنطاق')}</summary><ul>{answer.sources.map(source=><li key={source}><bdi>{source}</bdi></li>)}</ul></details></section>}
  </div><form className="ai-composer" onSubmit={e=>{e.preventDefault();if(input.trim()){setSubmitted(input.trim());setInput('');}}}><label htmlFor={`${id}-prompt`}>{t('Ask about your saved work','اسأل عن عملك المحفوظ')}</label><div><input id={`${id}-prompt`} value={input} maxLength={500} onChange={e=>setInput(e.target.value)} placeholder={t('What should I do next?','ما الخطوة التالية؟')}/><button type="submit" className="px-button px-button-dark" disabled={!input.trim()}>{t('Ask','اسأل')}</button></div></form></div>
 </dialog>{proposal&&p&&<PropertyCopyProposal property={p} onClose={()=>setProposal(false)}/>}</>;
}
