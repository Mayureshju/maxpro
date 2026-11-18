import {ArrowRight,ArrowUpRight} from 'lucide-react';
import {Link} from '@/i18n/navigation';
import {SiteHeader} from './site-header';
import {SiteFooter} from './site-footer';
import {demoLabel,pick,prototypeNote,type MarketingLocale} from '@/lib/marketing-content';
export {ProductShot} from './product-shot';
export function MarketingLayout({children}:{children:React.ReactNode}){return <><SiteHeader/><main id="main-content" className="mk-site">{children}</main><SiteFooter/></>}
export function DemoCTA({locale,secondary=false}:{locale:MarketingLocale;secondary?:boolean}){return <Link href="/sign-in" className={`mk-button ${secondary?'mk-outline':'mk-primary'}`}>{pick(locale,demoLabel)}<ArrowUpRight size={17}/></Link>}
export function TextLink({href,children}:{href:string;children:React.ReactNode}){return <Link href={href} className="mk-text-link">{children}<ArrowRight size={17}/></Link>}
export function SectionHeading({index,title,body}:{index:string;title:string;body?:string}){return <div className="mk-section-heading"><span className="mk-label">{index}</span><h2>{title}</h2>{body&&<p>{body}</p>}</div>}
export function PageHero({locale,eyebrow,title,body,children}:{locale:MarketingLocale;eyebrow:string;title:string;body:string;children?:React.ReactNode}){return <section className="mk-page-hero"><div className="container"><span className="mk-label">{eyebrow}</span><div className="mk-page-hero-grid"><h1>{title}</h1><div><p>{body}</p><DemoCTA locale={locale}/></div></div>{children}</div></section>}
export function FinalCTA({locale}:{locale:MarketingLocale}){return <section className="mk-final"><div className="container"><span className="mk-label">{pick(locale,['YOUR NEXT CHAPTER','خطوتك التالية'])}</span><h2>{pick(locale,['Your next property.\nA better way to work.','عقارك التالي.\nوطريقة أفضل للعمل.'])}</h2><div className="mk-actions"><DemoCTA locale={locale}/><TextLink href="/contact">{pick(locale,['Explore the contact preview','استكشف معاينة التواصل'])}</TextLink></div><p className="mk-fine">{pick(locale,prototypeNote)}</p></div></section>}
