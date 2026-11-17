'use client';

import {useEffect,useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {useSearchParams} from 'next/navigation';
import {ArrowRight,Sparkles} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {SearchCombobox} from '@/components/ui/search-combobox';
import {useGeminiDemo} from '@/components/gemini/demo-provider';
import {activeOrganizationId,can} from '@/lib/organization-engine';
import {copilotAnswer,type CopilotAnswer} from '@/lib/copilot';
import {PropertyCopyProposal} from './property-copy-proposal';
import {AssistantComposer,AssistantFrame,AssistantLauncher} from './assistant-frame';

const eventName='maxpro-open-ai';
type AIRequest={prompt?:string;propertyId?:string};
type Turn={question:string;answer:CopilotAnswer;propertyId?:string;revision?:number};
export function CopilotButton({prompt,propertyId,className='px-button px-button-outline'}:AIRequest&{className?:string}){
 const ar=useLocale()==='ar';return <button type="button" className={className} onClick={()=>window.dispatchEvent(new CustomEvent<AIRequest>(eventName,{detail:{prompt,propertyId}}))}><Sparkles size={16}/>{ar?'اسأل ماكس برو AI':'Ask MaxPro AI'}</button>;
}

/** The shell keys this memory-only session by organization and persona, never route. */
export function MaxProAI({path}:{path:string}){
 const {state}=useGeminiDemo(),search=useSearchParams(),ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const [open,setOpen]=useState(false),[override,setOverride]=useState<{route:string;id:string}|null>(null),[input,setInput]=useState(''),[turns,setTurns]=useState<Turn[]>([]),[proposal,setProposal]=useState(false);
 const result=useRef<HTMLElement>(null),route=`${path}?${search.toString()}`;
 const org=activeOrganizationId(state.organization),properties=Object.values(state.properties).filter(p=>p.organizationId===org);
 const campaign=state.campaigns.find(c=>path===`/workspace/campaigns/${c.id}`),leadId=search.get('lead')||path.match(/^\/workspace\/leads\/([^/]+)$/)?.[1];
 const lead=state.crm.leads.find(l=>l.id===leadId&&l.organizationId===org);
 const routeProperty=path.match(/^\/workspace\/inventory\/([^/]+)/)?.[1]||search.get('property')||campaign?.input.propertyId||lead?.propertyId||'';
 const selected=override?.route===route?override.id:routeProperty,p=properties.find(p=>p.id===selected);
 function ask(question:string,propertyId=selected){
  const record=properties.find(p=>p.id===propertyId);
  const turn:Turn={question,answer:copilotAnswer(state,question,propertyId,leadId||undefined,ar),propertyId:record?.id,revision:record?.revision};
  setTurns(previous=>[...previous.slice(-19),turn]);setProposal(false);
 }
 useEffect(()=>{const onOpen=(event:Event)=>{const request=(event as CustomEvent<AIRequest>).detail||{};if(request.propertyId)setOverride({route,id:request.propertyId});if(request.prompt)ask(request.prompt,request.propertyId||selected);setOpen(true);};window.addEventListener(eventName,onOpen);return()=>window.removeEventListener(eventName,onOpen);});
 useEffect(()=>{if(open&&turns.length)result.current?.scrollIntoView({block:'nearest'});},[open,turns.length]);
 const prompts=[t('Which properties need attention?','أي عقارات تحتاج إلى اهتمام؟'),t('Why is this listing not ready?','لماذا هذا الإعلان غير جاهز؟'),t('Improve bilingual descriptions','حسّن الوصف باللغتين'),t('Prepare a Facebook campaign','تجهيز حملة فيسبوك'),t('Show unanswered enquiries','عرض الاستفسارات دون رد'),t('Prepare a WhatsApp follow-up','تجهيز متابعة واتساب'),t('Explain channel requirements','شرح متطلبات القنوات'),t('Explain recorded performance','شرح الأداء المسجل')];
 const contextual=path.includes('analytics')?7:path.includes('inbox')?5:path.includes('leads')?4:path.includes('campaign')?3:path.includes('publish')?6:p?1:0;
 const ordered=[prompts[contextual],...prompts.filter((_,i)=>i!==contextual)],latest=turns.at(-1),answer=latest?.answer;
 const source=latest?.propertyId?properties.find(p=>p.id===latest.propertyId):undefined;
 const stale=!!latest?.propertyId&&source?.revision!==latest.revision;
 const close=()=>{setOpen(false);setProposal(false);};
 return <><AssistantLauncher raised={/\/edit$|\/inbox$/.test(path)} onOpen={()=>setOpen(true)}/>{open&&<AssistantFrame mode={t('Local demo · no live AI provider','تجربة محلية · لا توجد خدمة AI فعلية')} intro={t('Ask about your saved work, then review the next step. Suggestions use demo rules and saved facts. Nothing is published, sent or spent.','اسأل عن عملك المحفوظ ثم راجع الخطوة التالية. تستخدم الاقتراحات قواعد تجريبية وحقائق محفوظة. لا يُنشر أو يُرسل شيء ولا يُنفق مال.')} onClose={close} composer={<AssistantComposer value={input} onChange={setInput} onSubmit={()=>{ask(input.trim());setInput('');}}/>}>
   <SearchCombobox label={t('AI property context','سياق العقار للمساعد')} value={p?.id||''} options={[{value:'',label:t('Agency-wide context','سياق الوكالة بالكامل')},...properties.map(p=>({value:p.id,label:(ar?p.facts.titleAr:p.facts.titleEn)||t('Untitled draft','مسودة دون عنوان'),description:p.id}))]} onValueChange={id=>{setOverride({route,id});setProposal(false);}}/>
   {p&&<p className="ai-source-ref"><bdi>{p.id} · r{p.revision}</bdi> · <Link href={`/workspace/inventory/${p.id}`}>{t('Open property','فتح العقار')}</Link></p>}
   {lead&&<p className="ai-source-ref">{t('Current enquiry','الاستفسار الحالي')}: {lead.identity.alias} · <bdi>{lead.id}</bdi></p>}
   <details className="ai-task-menu" open><summary>{t('Suggested tasks for this page','مهام مقترحة لهذه الصفحة')}</summary><div className="ai-prompt-list" aria-label={t('Suggested AI tasks','مهام المساعد المقترحة')}>{ordered.map(text=><button type="button" key={text} aria-pressed={latest?.question===text} onClick={()=>ask(text)}>{text}<ArrowRight size={14}/></button>)}</div></details>
   {turns.length>1&&<details className="ai-history"><summary>{t('Earlier in this session','سابقاً في هذه الجلسة')} · {turns.length-1}</summary>{turns.slice(0,-1).map((turn,i)=><article key={i}><p className="ai-question">{turn.question}</p><h3>{turn.answer.title}</h3><p>{turn.answer.body}</p><small>{turn.answer.sources.join(' · ')}</small></article>)}</details>}
   {answer&&<section ref={result} className="ai-answer" aria-label={t('Local assistance result','نتيجة المساعدة المحلية')} aria-live="polite"><p className="ai-question">{latest.question}</p><h3>{answer.title}</h3><p>{answer.body}</p>{stale&&<p className="ai-session-note" role="status">{t('The property changed since this answer. Ask again to check the saved version before taking action.','تغيّر العقار منذ هذا الرد. اسأل مجدداً لفحص النسخة المحفوظة قبل اتخاذ إجراء.')}</p>}{answer.items.length>0&&<ul>{answer.items.map((item,i)=><li key={`${item.label}-${i}`}>{item.href?<Link href={item.href}><strong>{item.label}</strong>{item.detail&&<small>{item.detail}</small>}<ArrowRight size={14}/></Link>:<span>{item.label}{item.detail&&<small>{item.detail}</small>}</span>}</li>)}</ul>}{answer.proposeCopy&&source&&<button type="button" className="px-button px-button-dark" disabled={stale||!can(state.organization,'property.edit')} onClick={()=>setProposal(true)}>{t('Review copy proposal','مراجعة اقتراح الوصف')}</button>}{answer.proposeCopy&&!can(state.organization,'property.edit')&&<p>{t('Your demo role cannot edit property content.','دورك التجريبي لا يسمح بتعديل محتوى العقار.')}</p>}<details open><summary>{t('Sources & scope · saved answer','المصادر والنطاق · رد محفوظ')}</summary><ul>{answer.sources.map(source=><li key={source}><bdi>{source}</bdi></li>)}</ul></details><button className="px-text-button" type="button" onClick={()=>{setTurns([]);setInput('');setProposal(false);}}>{t('Clear conversation','مسح المحادثة')}</button></section>}
  </AssistantFrame>}{open&&proposal&&source&&<PropertyCopyProposal key={`${source.id}-${latest?.revision}`} property={source} onClose={()=>setProposal(false)}/>}</>;
}
