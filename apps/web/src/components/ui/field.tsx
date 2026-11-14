'use client';

import {useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode} from 'react';

export type FieldFeedback={helperText?:string;error?:string;loading?:boolean};

/** Labels and feedback share a stable relationship in every form. */
export function FieldWrapper({id,label,required,helperText,error,children}:{id:string;label:ReactNode;required?:boolean;children:ReactNode}&FieldFeedback){
 return <div className={`ui-field ${error?'has-error':''}`}><label htmlFor={id}>{label}{required&&<span aria-hidden="true"> *</span>}</label>{children}<FieldFeedbackText id={id} helperText={helperText} error={error}/></div>;
}
export function FieldFeedbackText({id,helperText,error}:{id:string}&FieldFeedback){return <>{helperText&&<small className="ui-field-help" id={`${id}-help`}>{helperText}</small>}{error&&<small className="ui-field-error" role="alert" id={`${id}-error`}>{error}</small>}</>;}
export function feedbackIds(id:string,helperText?:string,error?:string,describedBy?:string){return [describedBy,helperText&&`${id}-help`,error&&`${id}-error`].filter(Boolean).join(' ')||undefined;}

/** Drop-in semantic select. Short lists keep reliable native/mobile behavior. */
export function NativeSelect({helperText,error,loading,id:givenId,className='',...props}:SelectHTMLAttributes<HTMLSelectElement>&FieldFeedback){
 const generated=useId(),id=givenId||generated;
 return <><select {...props} id={id} className={`ui-native-select ${className}`} aria-invalid={error?true:props['aria-invalid']} aria-busy={loading||undefined} disabled={props.disabled||loading} aria-describedby={feedbackIds(id,helperText,error,props['aria-describedby'])}/><FieldFeedbackText id={id} helperText={helperText} error={error}/></>;
}
export function TextField({label,helperText,error,loading,id:givenId,...props}:InputHTMLAttributes<HTMLInputElement>&FieldFeedback&{label:ReactNode}){
 const generated=useId(),id=givenId||generated;
 return <FieldWrapper id={id} label={label} required={props.required} helperText={helperText} error={error}><input {...props} id={id} className={`ui-input ${props.className||''}`} aria-invalid={error?true:props['aria-invalid']} aria-busy={loading||undefined} disabled={props.disabled||loading} aria-describedby={feedbackIds(id,helperText,error,props['aria-describedby'])}/></FieldWrapper>;
}
export function TextArea({label,helperText,error,loading,id:givenId,...props}:TextareaHTMLAttributes<HTMLTextAreaElement>&FieldFeedback&{label:ReactNode}){
 const generated=useId(),id=givenId||generated;
 return <FieldWrapper id={id} label={label} required={props.required} helperText={helperText} error={error}><textarea {...props} id={id} className={`ui-input ${props.className||''}`} aria-invalid={error?true:props['aria-invalid']} disabled={props.disabled||loading} aria-busy={loading||undefined} aria-describedby={feedbackIds(id,helperText,error,props['aria-describedby'])}/></FieldWrapper>;
}
