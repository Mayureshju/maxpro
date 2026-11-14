import {Plus} from 'lucide-react';
import {faqs,pick,type MarketingLocale} from '@/lib/marketing-content';
import {TextLink} from './marketing-layout';
export function FAQAccordion({locale,group,limit}:{locale:MarketingLocale;group?:string;limit?:number}){const entries=faqs.filter(f=>!group||f.group===group).slice(0,limit);return <div className="mk-faq">{entries.map(f=><details key={f.q[0]}><summary>{pick(locale,f.q)}<Plus size={18} aria-hidden="true"/></summary><div><p>{pick(locale,f.a)}</p><TextLink href={f.href}>{pick(locale,['Explore this topic','تعرّف على التفاصيل'])}</TextLink></div></details>)}</div>}
