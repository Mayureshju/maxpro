import type {Metadata} from 'next';
export const metadata:Metadata={robots:{index:false,follow:false},title:'Fictional agency workspace | MaxPro / AqarPro'};
import {GeminiDemoProvider} from '@/components/gemini/demo-provider';
import {WorkspaceShell} from '@/components/workspace/workspace-shell';
export default function Layout({children}: {children: React.ReactNode}) {
  return <GeminiDemoProvider><WorkspaceShell>{children}</WorkspaceShell></GeminiDemoProvider>;
}
