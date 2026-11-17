'use client';
import {useEffect,useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {usePathname} from 'next/navigation';
import {ArrowRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {AssistantComposer,AssistantFrame,AssistantLauncher} from '@/components/agency/assistant-frame';
import {publicAssistance,type PublicAnswer} from '@/lib/public-assistance';

export function PublicAssistant(){
 const path=usePathname();
 // Unmount public memory at the workspace boundary. No DemoProvider is imported.
 return /\/(?:en|ar)\/workspace(?:\/|$)/.test(path)?null:<PublicSession/>;
}
function PublicSession(){
 const ar=useLocale()==='ar',locale=ar?'ar':'en',t=(en:string,arabic:string)=>ar?arabic:en;
 const [open,setOpen]=useState(false),[input,setInput]=useState(''),[turns,setTurns]=useState<{question:string;answer:PublicAnswer}[]>([]);
 function ask(question:string){setTurns(previous=>[...previous.slice(-19),{question,answer:publicAssistance(question,locale)}]);setInput('');}
 const latest=turns.at(-1),result=useRef<HTMLElement>(null);
 useEffect(()=>{if(open&&turns.length)result.current?.scrollIntoView({block:'nearest'});},[open,turns.length]);
 return <><AssistantLauncher onOpen={()=>setOpen(true)}/>{open&&<AssistantFrame mode={t('Public guide · demo rules','دليل عام · قواعد تجريبية')} intro={t('Explore features, plans and channel availability. This guide uses public product information only. No live AI model or agency records.','استكشف المزايا والباقات وتوفر القنوات. يستخدم الدليل معلومات المنتج العامة فقط، دون نموذج AI فعلي أو سجلات وكالة.')} onClose={()=>setOpen(false)} composer={<AssistantComposer publicMode value={input} onChange={setInput} onSubmit={()=>ask(input.trim())}/>}>
  <div className="ai-prompt-list" aria-label={t('Suggested product questions','أسئلة مقترحة عن المنتج')}>{[t('How do I start?','كيف أبدأ العمل؟'),t('What can AI help me do?','كيف تساعدني المساعدة الذكية؟'),t('Explain plans and prices','اشرح الباقات والأسعار'),t('Are integrations connected?','هل التكاملات متصلة؟')].map(prompt=><button type="button" key={prompt} onClick={()=>ask(prompt)}>{prompt}<ArrowRight size={14}/></button>)}</div>
  {turns.length>1&&<details className="ai-history"><summary>{t('Earlier in this session','سابقاً في هذه الجلسة')} · {turns.length-1}</summary>{turns.slice(0,-1).map((turn,i)=><article key={i}><p className="ai-question">{turn.question}</p><h3>{turn.answer.title}</h3><p>{turn.answer.body}</p><small>{turn.answer.source}</small></article>)}</details>}
  {latest&&<section ref={result} className="ai-answer" aria-live="polite"><p className="ai-question">{latest.question}</p><h3>{latest.answer.title}</h3><p>{latest.answer.body}</p><ul>{latest.answer.links.map(link=><li key={link.href}><Link href={link.href}><strong>{link.label}</strong><ArrowRight size={14}/></Link></li>)}</ul><p className="ai-source-ref">{t('Source','المصدر')}: <bdi>{latest.answer.source}</bdi></p><button type="button" className="px-text-button" onClick={()=>{setTurns([]);setInput('');}}>{t('Clear conversation','مسح المحادثة')}</button></section>}
 </AssistantFrame>}</>;
}
