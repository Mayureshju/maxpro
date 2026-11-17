/** Shared by nested native dialogs. Restore the original overflow only after the last owner exits. */
const owners=new Set<symbol>();
let previousOverflow='';
export function lockBodyScroll(){
 if(!owners.size)previousOverflow=document.body.style.overflow;
 const owner=Symbol();owners.add(owner);document.body.style.overflow='hidden';
 return()=>{if(!owners.delete(owner))return;if(!owners.size)document.body.style.overflow=previousOverflow;};
}
