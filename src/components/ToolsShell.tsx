import { ReactNode } from 'react';

interface ToolsShellProps {
  children: ReactNode;
  title?: string;
  currentPath?: string;
  noPadding?: boolean;
}

export default function ToolsShell({ 
  children, 
  title,
  noPadding = false,
}: ToolsShellProps) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh', 
      width: '100%' 
    }}>
      
      <div style={{
        flex: 1,
        padding: '40px',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        {children}
      </div>
    </div>
  );
}






