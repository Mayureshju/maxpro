'use client';

import {useEffect,useId,useRef,useState} from 'react';
import {Button} from '@/components/ui/button';
import {useLocale} from 'next-intl';
import {Pencil,Sparkles,X} from 'lucide-react';
import {lockBodyScroll} from '@/lib/body-scroll-lock';

export type AssistanceField={key:string;label:string;before:string;after:string;dir?:'ltr'|'rtl';editable?:boolean};
export type AssistanceSource={label:string;value:string};

/** A proposal inspector, never a chat or an authority to change source facts. */
export function AssistancePanel({title,sourceKey,sources,fields,acceptLabel,onAccept,onClose,emptyMessage,warnings=[]}:{
 title:string;sourceKey:string;sources:AssistanceSource[];fields:AssistanceField[];acceptLabel:string;
 onAccept:(values:Record<string,string>)=>boolean|void;onClose:()=>void;emptyMessage?:string;warnings?:string[];
}){
 const ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en,id=useId();const dialog=useRef<HTMLDialogElement>(null);
 const [snapshot]=useState(()=>({sourceKey,sources,fields,warnings}));
 const [values,setValues]=useState(()=>Object.fromEntries(fields.map(f=>[f.key,f.after]))),[editing,setEditing]=useState(false),[error,setError]=useState('');
 const stale=snapshot.sourceKey!==sourceKey;
 useEffect(()=>{
  const node=dialog.current,trigger=document.activeElement instanceof HTMLElement?document.activeElement:null;const releaseScroll=lockBodyScroll();
  node?.showModal();
  return()=>{node?.close();releaseScroll();if(trigger?.isConnected)trigger.focus();};
 },[]);
 return <dialog ref={dialog} className="ag-assistant" aria-labelledby={id} onKeyDown={e=>{
  if(e.key!=='Tab')return;
  const controls=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]')).filter(el=>el.getClientRects().length>0&&!el.closest('[hidden]'));
  const first=controls[0],last=controls.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
 }} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
  <div className="ag-assistant-inner"><header><div><span className="ag-ai-label"><Sparkles size={16}/>{t('AI Assistance · Local demo','مساعدة ذكية · تجربة محلية')}</span><h2 id={id}>{title}</h2></div><button type="button" className="ag-icon-button" autoFocus aria-label={t('Close assistance','إغلاق المساعدة')} onClick={onClose}><X size={21}/></button></header>
   <div className="ag-assistant-body"><p className="ag-help">{t('Deterministic suggestions from the sources below. Review every change before accepting. Nothing is sent to an AI service.','اقتراحات حتمية من المصادر أدناه. راجع كل تغيير قبل قبوله. لا تُرسل بيانات إلى خدمة ذكاء اصطناعي.')}</p>
    <details className="ag-assistant-source" open><summary>{t('Source facts','حقائق المصدر')}</summary><dl>{snapshot.sources.map((s,i)=><div key={i}><dt>{s.label}</dt><dd dir="auto">{s.value||t('Not recorded','غير مسجل')}</dd></div>)}</dl></details>
    {snapshot.warnings.length>0&&<div className="ag-assistance-warnings" role="status"><strong>{t('Missing information — suggestions use only supplied facts','معلومات ناقصة — تستخدم الاقتراحات الحقائق المدخلة فقط')}</strong><ul>{snapshot.warnings.map(w=><li key={w}>{w}</li>)}</ul></div>}{stale&&<p className="gm-error" role="alert">{t('Source changed. This suggestion is out of date. Dismiss it and request a fresh suggestion.','تغيّر المصدر. الاقتراح قديم؛ تجاهله واطلب اقتراحاً جديداً.')}</p>}
    {!snapshot.fields.length?<p className="ag-empty-copy">{emptyMessage||t('No suggestion is available from this source. Add the missing property information or media and try again.','لا يوجد اقتراح متاح من هذا المصدر. أضف معلومات العقار أو الوسائط الناقصة ثم حاول مجدداً.')}</p>:<div className="ag-proposal ag-comparison">{snapshot.fields.map(f=><section key={f.key}><h3>{f.label}</h3><div><span>{t('Before','قبل')}</span><p dir={f.dir||'auto'}>{f.before||t('Empty','فارغ')}</p></div><div><span>{t('Suggested','المقترح')}</span>{editing&&f.editable!==false?<label className="px-field"><span className="sr-only">{t('Edit suggestion','تعديل الاقتراح')} · {f.label}</span><textarea dir={f.dir||'auto'} maxLength={4000} rows={4} value={values[f.key]} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}/></label>:<p dir={f.dir||'auto'}>{values[f.key]}</p>}</div></section>)}</div>}
    {error&&<p className="gm-error" role="alert">{error}</p>}
   </div><footer><Button onClick={onClose}>{t('Dismiss suggestion','تجاهل الاقتراح')}</Button>{snapshot.fields.some(f=>f.editable!==false)&&<Button aria-pressed={editing} onClick={()=>setEditing(!editing)}><Pencil size={15}/>{t('Edit suggestion','تعديل الاقتراح')}</Button>}<Button variant="primary" disabled={stale||!snapshot.fields.length} onClick={()=>{if(stale)return;const ok=onAccept(values);if(ok===false)setError(t('Could not accept. Check the values or reload the changed record.','تعذر القبول. تحقق من القيم أو أعد تحميل السجل.'));else onClose();}}>{acceptLabel}</Button></footer>
  </div>
 </dialog>;
}
