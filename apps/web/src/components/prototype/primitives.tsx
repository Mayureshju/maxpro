import type {ReactNode} from 'react';
import {ArrowUpRight, ChevronRight, CircleAlert, Info} from 'lucide-react';import {Link} from '@/i18n/navigation';import type {Listing} from '@/lib/prototype-data';
import {q} from '@/lib/prototype-data';
export function Intro({eyebrow,title,description,action,aside}:{eyebrow?:string;title:string;description?:string;action?:ReactNode;aside?:ReactNode}){
  return <header className="px-intro"><div className="px-intro-main">{eyebrow&&<div className="px-overline">{eyebrow}</div>}<h1>{title}</h1>{description&&<p>{description}</p>}</div>{(action||aside)&&<div className="px-intro-action">{aside}{action}</div>}</header>;
}
export function Section({title,subtitle,actions,children,className=''}:{title:string;subtitle?:string;actions?:ReactNode;children:ReactNode;className?:string}){
  return <section className={`px-section ${className}`}><div className="px-section-head"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{actions}</div>{children}</section>;
}
export function Metric({label,value,annotation,compact=false}:{label:string;value:string;annotation?:string;compact?:boolean}){
  return <div className={`px-metric ${compact?'is-compact':''}`}><span>{label}</span><strong>{value}</strong>{annotation&&<small>{annotation}</small>}</div>;
}
export function Pill({children,tone='neutral'}:{children:ReactNode;tone?:'neutral'|'good'|'warning'|'danger'|'info'}){
  return <span className={`px-pill px-pill-${tone}`}><span className="px-pill-dot"/>{children}</span>;
}
export function Empty({title,description}:{title:string;description:string}){
  return <div className="px-empty"><CircleAlert size={22}/><strong>{title}</strong><p>{description}</p></div>;
}
export function Notice({children,kind='info'}:{children:ReactNode;kind?:'info'|'warning'}){
  return <div className={`px-notice px-notice-${kind}`}>{kind==='info'?<Info size={17}/>:<CircleAlert size={17}/>}<span>{children}</span></div>;
}
export function PropertyImage({listing,aspect='wide'}:{listing:Listing;aspect?:'wide'|'square'|'mini'}) {
  return <div className={`px-property-image image-${aspect}`} style={{backgroundImage:`linear-gradient(0deg,rgba(22,37,43,.06),rgba(22,37,43,0)),url('${listing.image}')`}} role="img" aria-label={`${listing.title}, ${listing.locality}`}><span>{listing.category}</span></div>;
}
export function ListingRow({listing}:{listing:Listing}) {
  return <Link className="px-listing-row" href={`/workspace/inventory/${listing.id}`}><PropertyImage listing={listing} aspect="mini"/><span className="px-listing-name"><strong>{listing.title}</strong><small>{listing.id} · {listing.locality}</small></span><span className="px-listing-price">{q(listing.price)}<small>{listing.unit==='month'?'/ month':'Sale'}</small></span><Pill tone={listing.status==='Live'?'good':listing.status==='Pending review'?'warning':'neutral'}>{listing.status}</Pill><span className="px-listing-connectors">{listing.portals} portals</span><ChevronRight className="px-listing-go" size={17}/></Link>;
}
export function HeaderLink({href,children}:{href:string;children:ReactNode}){return <Link className="px-text-link" href={href}>{children}<ArrowUpRight size={15}/></Link>;}
export function MiniBars({values}:{values:number[]}) {return <div className="px-mini-bars" aria-label="Illustrative activity trend">{values.map((v,i)=><span key={i} style={{height:`${v}%`}}/>)}</div>;}
export const buttonClass='px-button';
