'use client';

import {useId} from 'react';
export function SegmentedControl<T extends string>({label,value,options,onValueChange,disabled=false}:{label:string;value:T;options:readonly {value:T;label:string}[];onValueChange:(value:T)=>void;disabled?:boolean}){
 const id=useId();
 return <fieldset className="ui-segmented" disabled={disabled}><legend>{label}</legend><div>{options.map(option=><label key={option.value} className={value===option.value?'is-selected':''}><input type="radio" name={id} value={option.value} checked={value===option.value} onChange={()=>onValueChange(option.value)}/><span>{option.label}</span></label>)}</div></fieldset>;
}
