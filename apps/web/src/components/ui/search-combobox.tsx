'use client';

import {useEffect,useLayoutEffect,useId,useRef,useState,type CSSProperties} from 'react';
import {createPortal} from 'react-dom';
import {Check,ChevronDown,Search,X} from 'lucide-react';
import {useLocale} from 'next-intl';
import {FieldWrapper,feedbackIds,type FieldFeedback} from './field';

export type Choice={value:string;label:string;description?:string;disabled?:boolean};
type Props=FieldFeedback&{id?:string;label:string;value:string;options:readonly Choice[];onValueChange:(value:string)=>void;disabled?:boolean;readOnly?:boolean;required?:boolean;clearable?:boolean;placeholder?:string};

/** APG editable list autocomplete: DOM focus stays on the input; only explicit
 * Enter/click commits. Escape/Tab/outside dismissal retain the controlled value. */
export function SearchCombobox({id:givenId,label,value,options,onValueChange,disabled,readOnly,required,clearable,placeholder,helperText,error,loading}:Props){
 const generated=useId(),id=givenId||generated,listId=`${id}-choices`,ar=useLocale()==='ar',t=(en:string,arabic:string)=>ar?arabic:en;
 const root=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),popup=useRef<HTMLDivElement>(null);
 const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(-1),[position,setPosition]=useState<CSSProperties>({}),[portalHost,setPortalHost]=useState<HTMLElement|null>(null);
 const selected=options.find(o=>o.value===value),filtered=options.filter(o=>`${o.label} ${o.description||''} ${o.value}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
 const enabled=filtered.map((o,i)=>o.disabled?-1:i).filter(i=>i>=0),isOpen=open&&!disabled&&!readOnly&&!loading;
 function openList(){setPortalHost(root.current?.closest('dialog')||document.body);setOpen(true);}
 function dismiss(){setOpen(false);setQuery('');setActive(-1);}
 function choose(option:Choice){if(option.disabled)return;onValueChange(option.value);dismiss();input.current?.focus();}
 useLayoutEffect(()=>{
  if(!isOpen)return;
  function place(){
   let r=root.current?.getBoundingClientRect();if(!r)return;
   const viewport=window.visualViewport,viewTop=viewport?.offsetTop||0,viewLeft=viewport?.offsetLeft||0,viewHeight=viewport?.height||window.innerHeight,viewWidth=viewport?.width||window.innerWidth;
   const viewBottom=viewTop+viewHeight;
   if(document.activeElement===input.current&&(r.top<viewTop+68||r.bottom>viewBottom-8)){input.current?.scrollIntoView({block:'center',behavior:'instant'});r=root.current?.getBoundingClientRect();if(!r)return;}
   const anchorTop=Math.max(viewTop+8,Math.min(r.top,viewBottom-8)),anchorBottom=Math.max(viewTop+8,Math.min(r.bottom,viewBottom-8));
   const above=Math.max(0,anchorTop-viewTop-12),below=Math.max(0,viewBottom-anchorBottom-12),up=below<180&&above>below;
   const height=Math.min(304,up?above:below),width=Math.min(r.width,viewWidth-16),left=Math.max(viewLeft+8,Math.min(r.left,viewLeft+viewWidth-width-8));
   const scale=(Number.parseFloat(getComputedStyle(document.documentElement).zoom)||1)*(Number.parseFloat(getComputedStyle(document.body).zoom)||1);
   setPosition({position:'fixed',left:left/scale,width:width/scale,maxHeight:height/scale,top:(up?anchorTop-4:anchorBottom+4)/scale,transform:up?'translateY(-100%)':undefined});
  }
  function outside(e:PointerEvent){if(!root.current?.contains(e.target as Node)&&!popup.current?.contains(e.target as Node))dismiss();}
  place();document.addEventListener('pointerdown',outside);window.addEventListener('resize',place);window.addEventListener('scroll',place,true);window.visualViewport?.addEventListener('resize',place);window.visualViewport?.addEventListener('scroll',place);
  return()=>{document.removeEventListener('pointerdown',outside);window.removeEventListener('resize',place);window.removeEventListener('scroll',place,true);window.visualViewport?.removeEventListener('resize',place);window.visualViewport?.removeEventListener('scroll',place);};
 },[isOpen]);
 useEffect(()=>{if(isOpen&&active>=0)popup.current?.querySelector<HTMLElement>(`[data-choice-index="${active}"]`)?.scrollIntoView({block:'nearest'});},[active,isOpen]);
 return <FieldWrapper id={id} label={label} required={required} helperText={helperText} error={error}><div ref={root} className="ui-combobox"><Search size={17} aria-hidden="true"/><input ref={input} id={id} role="combobox" data-value={value} type="text" autoComplete="off" aria-autocomplete="list" aria-expanded={isOpen} aria-controls={isOpen?listId:undefined} aria-activedescendant={isOpen&&filtered[active]?`${id}-option-${active}`:undefined} aria-required={required||undefined} aria-invalid={!!error} aria-busy={loading||undefined} aria-describedby={feedbackIds(id,helperText,error)} disabled={disabled||loading} readOnly={readOnly} value={isOpen?query:selected?.label||''} title={selected?.label} placeholder={placeholder||t('Search and choose…','ابحث واختر…')} onFocus={()=>{if(!readOnly){setQuery('');setActive(-1);openList();}}} onClick={()=>{if(!readOnly)openList();}} onBlur={e=>{if(!root.current?.contains(e.relatedTarget)&&!popup.current?.contains(e.relatedTarget))dismiss();}} onChange={e=>{setQuery(e.target.value);setActive(-1);openList();}} onKeyDown={e=>{
  if(e.key==='Escape'){if(isOpen){e.preventDefault();e.stopPropagation();dismiss();}return;}
  if(e.key==='Tab'){dismiss();return;}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();openList();const index=enabled.indexOf(active),direction=e.key==='ArrowDown'?1:-1;setActive(!isOpen||index<0?(direction===1?enabled[0]:enabled.at(-1))??-1:enabled[(index+direction+enabled.length)%enabled.length]??-1);return;}
  if(e.key==='Enter'&&isOpen){e.preventDefault();if(filtered[active])choose(filtered[active]);}
 }}/>{!readOnly&&!disabled&&!loading&&((isOpen&&query)||clearable&&value?<button type="button" className="ui-combo-clear" aria-label={query?t('Clear search','مسح البحث'):t('Clear selection','مسح الاختيار')} onMouseDown={e=>e.preventDefault()} onClick={()=>{if(query){setQuery('');setActive(-1);input.current?.focus();}else if(clearable){onValueChange('');input.current?.focus();}}}><X size={16}/></button>:<ChevronDown size={16} aria-hidden="true"/>)}</div>{isOpen&&portalHost&&createPortal(<div ref={popup} className="ui-combobox-popup" dir={ar?'rtl':'ltr'} style={position} onMouseDown={e=>e.preventDefault()}><div className="ui-combobox-status" role="status">{filtered.length?`${t('Options','الخيارات')}: ${filtered.length} · ${t('choose to apply','اختر للتطبيق')}`:t('No results. Try a title, ID or another keyword.','لا توجد نتائج. جرّب عنواناً أو معرّفاً أو كلمة أخرى.')}</div><ul id={listId} role="listbox" aria-label={label}>{filtered.map((option,index)=><li id={`${id}-option-${index}`} data-choice-index={index} role="option" data-value={option.value} key={option.value} aria-selected={option.value===value} aria-disabled={option.disabled||undefined} className={active===index?'is-active':''} onPointerMove={()=>{if(!option.disabled)setActive(index);}} onClick={()=>choose(option)} title={option.label}><span><strong>{option.label}</strong>{option.description&&<small>{option.description}</small>}</span>{option.value===value&&<Check size={17} aria-hidden="true"/>}</li>)}</ul></div>,portalHost)}</FieldWrapper>;
}
