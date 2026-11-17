'use client';

import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
import {useLocale} from 'next-intl';
import {Sparkles,X} from 'lucide-react';
import {lockBodyScroll} from '@/lib/body-scroll-lock';

export function AssistantLauncher({onOpen,raised=false}:{onOpen:()=>void;raised?:boolean}){
 const ar=useLocale()==='ar',launcher=useRef<HTMLButtonElement>(null),[offset,setOffset]=useState<number|null>(null);
 useEffect(()=>{
  let frame=0;
  const measure=()=>{frame=0;const node=launcher.current;if(!node||document.querySelector('dialog[open]'))return;const box=node.getBoundingClientRect(),base=raised&&innerWidth<=650?88:20;
   const controls=Array.from(document.querySelectorAll<HTMLElement>('a[href],button,input,select,textarea,[role="combobox"],.ag-editor-footer,.px-chat-compose')).filter(el=>el!==node&&!node.contains(el)&&!el.closest('dialog,[inert]')&&!el.matches('.mk-shot > a,input[readonly],textarea[readonly],:disabled')).map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<innerHeight&&r.left<box.right+8&&r.right>box.left-8);
   let next=base;for(let candidate=base;candidate<innerHeight-box.height-80;candidate+=16){const bottom=innerHeight-candidate,top=bottom-box.height;if(!controls.some(r=>r.top<bottom+8&&r.bottom>top-8)){next=candidate;break;}}
   const scale=box.width/(node.offsetWidth||box.width)||1;
   setOffset(previous=>previous===next/scale?previous:next/scale);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure);};schedule();window.addEventListener('resize',schedule);document.addEventListener('scroll',schedule,true);const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});const resize=new ResizeObserver(schedule);resize.observe(document.body);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();window.removeEventListener('resize',schedule);document.removeEventListener('scroll',schedule,true);};
 },[raised,ar]);
 return <button ref={launcher} type="button" className={`ws-ai-entry${raised?' ai-entry-raised':''}`} style={offset===null?undefined:{insetBlockEnd:`calc(${offset}px + env(safe-area-inset-bottom))`}} aria-label={ar?'ماكس برو AI':'MaxPro AI'} aria-haspopup="dialog" onClick={onOpen}><span className="ai-launcher-icon"><Sparkles size={20}/></span><span>{ar?'ماكس برو AI':'MaxPro AI'}<small>{ar?'مساعد تجريبي':'Demo assistant'}</small></span></button>;
}

/** Both modes use the same accessible shell; data access stays with each caller. */
export function AssistantFrame({mode,intro,children,composer,onClose}:{mode:string;intro:string;children:ReactNode;composer:ReactNode;onClose:()=>void}){
 const ar=useLocale()==='ar',id=useId(),dialog=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const node=dialog.current,trigger=document.activeElement instanceof HTMLElement?document.activeElement:null,release=lockBodyScroll();node?.showModal();const fit=()=>{if(!node)return;const scale=node.getBoundingClientRect().width/(node.offsetWidth||1)||1,bottom=parseFloat(getComputedStyle(node).insetBlockEnd)||0;node.style.maxBlockSize=`${Math.max(1,(innerHeight-(innerWidth<=650?0:20))/scale-bottom)}px`;};fit();window.addEventListener('resize',fit);return()=>{window.removeEventListener('resize',fit);node?.close();release();if(trigger?.isConnected)trigger.focus();};},[]);
 return <dialog ref={dialog} className="ai-copilot" aria-labelledby={`${id}-title`} aria-describedby={`${id}-limit`} onKeyDown={e=>{if(e.key!=='Tab')return;const controls=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]')).filter(el=>el.getClientRects().length>0&&!el.closest('[hidden]'));const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget||e.target instanceof Element&&e.target.closest('a[href]')&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey)onClose();}}>
  <div className="ai-copilot-inner"><header><div><span className="ag-ai-label"><Sparkles size={16}/>{mode}</span><h2 id={`${id}-title`}>{ar?'ماكس برو AI':'MaxPro AI'}</h2></div><button type="button" className="ag-icon-button" autoFocus aria-label={ar?'إغلاق ماكس برو AI':'Close MaxPro AI'} onClick={onClose}><X size={20}/></button></header><div className="ai-copilot-body"><p id={`${id}-limit`} className="ag-help">{intro}</p>{children}</div>{composer}</div>
 </dialog>;
}

export function AssistantComposer({value,onChange,onSubmit,publicMode=false}:{value:string;onChange:(value:string)=>void;onSubmit:()=>void;publicMode?:boolean}){
 const ar=useLocale()==='ar',id=useId();
 return <form className="ai-composer" onSubmit={e=>{e.preventDefault();if(value.trim())onSubmit();}}><label htmlFor={id}>{publicMode?(ar?'اسأل عن المنصة':'Ask about the platform'):(ar?'اسأل عن عملك المحفوظ':'Ask about your saved work')}</label><div><input id={id} value={value} maxLength={500} onChange={e=>onChange(e.target.value)} placeholder={ar?'ما الخطوة التالية؟':'What should I do next?'}/><button type="submit" className="px-button px-button-dark" disabled={!value.trim()}>{ar?'اسأل':'Ask'}</button></div><small>{ar?'استخدم معلومات خيالية فقط. تبقى المحادثة في الذاكرة حتى مغادرة التجربة.':'Use fictional information. This conversation stays in memory until you leave the demo.'}</small></form>;
}
