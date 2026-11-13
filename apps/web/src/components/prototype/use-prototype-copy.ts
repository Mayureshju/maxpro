'use client';
import {useLocale} from 'next-intl';
import {translateCopy} from '@/lib/ui-copy';
/** Shared message catalogue for the original prototype's presentation strings. */
export function usePrototypeCopy(){const locale=useLocale();return (text:string)=>translateCopy(text,locale);}
