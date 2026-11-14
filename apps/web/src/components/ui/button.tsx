'use client';

import type {ButtonHTMLAttributes} from 'react';
export function Button({variant='outline',loading=false,className='',children,type='button',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{variant?:'primary'|'outline'|'quiet';loading?:boolean}){
 return <button {...props} type={type} disabled={props.disabled||loading} aria-busy={loading||undefined} className={`px-button px-button-${variant==='primary'?'dark':variant==='quiet'?'light':'outline'} ${className}`}>{children}</button>;
}
