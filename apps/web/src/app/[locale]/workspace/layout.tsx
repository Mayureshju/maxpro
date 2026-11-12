import {GeminiDemoProvider} from '@/components/gemini/demo-provider';
import {WorkspaceShell} from '@/components/workspace/workspace-shell';
export default function Layout({children}: {children: React.ReactNode}) {
  return <GeminiDemoProvider><WorkspaceShell>{children}</WorkspaceShell></GeminiDemoProvider>;
}
