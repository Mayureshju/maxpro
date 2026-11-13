'use client';

import {useEffect,useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {FileWarning} from 'lucide-react';

/** Protects unsaved local form edits. Approval and persistence remain the caller's responsibility. */
export function UnsavedChanges({dirty}:{dirty:boolean}){
 const ar=useLocale()==='ar';const bypass=useRef(false);const dialog=useRef<HTMLDialogElement>(null);
 const [destination,setDestination]=useState<string|null>(null);const trigger=useRef<HTMLElement|null>(null);
 useEffect(()=>{
  if(!dirty)return;
  const unload=(event:BeforeUnloadEvent)=>{if(!bypass.current){event.preventDefault();event.returnValue='';}};
  const navigate=(event:MouseEvent)=>{
   if(bypass.current||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null;
   if(!link||link.target==='_blank'||link.hasAttribute('download'))return;
   const next=new URL(link.href,window.location.href);const current=new URL(window.location.href);
   if(next.pathname===current.pathname&&next.search===current.search)return;
   event.preventDefault();event.stopImmediatePropagation();trigger.current=link;setDestination(link.href);
  };
  window.addEventListener('beforeunload',unload);document.addEventListener('click',navigate,true);
  return ()=>{window.removeEventListener('beforeunload',unload);document.removeEventListener('click',navigate,true);};
 },[dirty]);
 useEffect(()=>{if(destination)dialog.current?.showModal();},[destination]);
 function stay(){dialog.current?.close();setDestination(null);trigger.current?.focus();}
 return <dialog ref={dialog} className="fx-dialog" aria-labelledby="unsaved-title" aria-describedby="unsaved-description" onCancel={event=>{event.preventDefault();stay();}}><div className="fx-dialog-body"><FileWarning size={26} aria-hidden="true"/><h2 id="unsaved-title">{ar?'هل تريد مغادرة التعديلات غير المحفوظة؟':'Leave unsaved changes?'}</h2><p id="unsaved-description">{ar?'لم تُحفظ تعديلاتك الأخيرة. تابع التحرير لحفظها، أو تجاهل التعديلات وغادر الصفحة.':'Your latest edits have not been saved. Keep editing to save them, or discard the changes and leave this page.'}</p><div className="fx-dialog-actions"><button type="button" className="px-button px-button-dark" autoFocus onClick={stay}>{ar?'متابعة التحرير':'Keep editing'}</button><button type="button" className="px-button px-button-outline" onClick={()=>{const link=trigger.current;stay();if(link){bypass.current=true;link.click();}}}>{ar?'تجاهل التعديلات':'Discard changes'}</button></div></div></dialog>;
}
