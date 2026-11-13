'use client';
import {useLocale} from 'next-intl';
export function WorkspaceLoading(){
 const ar=useLocale()==='ar';
 return <div className="fx-loading" role="status" aria-live="polite" aria-busy="true"><span className="gm-sr-only">{ar?'جارٍ تحميل مساحة العمل المحلية…':'Loading the local workspace…'}</span><div aria-hidden="true"><div className="fx-skeleton fx-skeleton-kicker"/><div className="fx-skeleton fx-skeleton-title"/><div className="fx-skeleton fx-skeleton-copy"/><div className="fx-skeleton-panel">{[0,1,2,3].map(i=><div className="fx-skeleton-row" key={i}><span className="fx-skeleton"/><span className="fx-skeleton"/></div>)}</div></div></div>;
}
