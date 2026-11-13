'use client';
import {useSearchParams} from 'next/navigation';
import {SyndicationPage} from '@/components/gemini/syndication';
import {PublishPromote} from '@/components/agency/publish-promote';
import {Suspense} from 'react';
function Workflow(){return useSearchParams().get('advanced')==='1'?<SyndicationPage/>:<PublishPromote/>;}
export default function Page(){return <Suspense fallback={<p>Loading local workflow…</p>}><Workflow/></Suspense>;}
