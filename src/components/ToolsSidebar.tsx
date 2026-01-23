import { useState } from 'react';
import { baseUrl } from '../lib/base-url';

interface ToolsSidebarProps {
  currentPath: string;
}

export default function ToolsSidebar({ currentPath }: ToolsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { label: 'Home', href: `${baseUrl}/`, icon: 'home' },
    { label: 'QR Generator', href: `${baseUrl}/qr-generator`, icon: 'qr' },
    { label: 'HTML Preview', href: `${baseUrl}/html-preview`, icon: 'code' },
    { label: 'Color Picker', href: `${baseUrl}/color-picker`, icon: 'palette' },
    { label: 'Image Color Picker', href: `${baseUrl}/image-color-picker`, icon: 'image' },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'home':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        );
      case 'qr':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <path d="M14 14h7v7h-7z" />
          </svg>
        );
      case 'code':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        );
      case 'palette':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="13.5" cy="6.5" r=".5" />
            <circle cx="17.5" cy="10.5" r=".5" />
            <circle cx="8.5" cy="7.5" r=".5" />
            <circle cx="6.5" cy="12.5" r=".5" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        );
      default:
        return null;
    }
  };

  const isActive = (href: string) => {
    const normalizedHref = href.replace(baseUrl, '');
    const normalizedPath = currentPath.replace(baseUrl, '');
    
    if (normalizedHref === '/' && normalizedPath === '/') {
      return true;
    }
    
    if (normalizedHref !== '/' && normalizedPath.startsWith(normalizedHref)) {
      return true;
    }
    
    return false;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1001,
          display: 'none',
          width: '44px',
          height: '44px',
          backgroundColor: '#1A1A1A',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isMobileMenuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className="sidebar-wrapper"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: isCollapsed ? '80px' : '260px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E5E5',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            padding: '24px 20px',
            borderBottom: '1px solid #E5E5E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
          }}
        >
          {!isCollapsed && (
            <h1
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: '#1A1A1A',
                fontFamily: 'var(--heading-font)',
                letterSpacing: '-0.01em',
              }}
            >
              Miraka Tools
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              color: '#666666',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F2F2F2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav
          style={{
            flex: 1,
            padding: '20px 12px',
            overflowY: 'auto',
          }}
        >
          {navigationItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isCollapsed ? '0' : '12px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '12px 0' : '12px 16px',
                  marginBottom: '4px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: active ? '#1A1A1A' : '#666666',
                  backgroundColor: active ? '#F2F2F2' : 'transparent',
                  fontFamily: 'var(--body-font)',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 500,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = '#F8F8F8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={isCollapsed ? item.label : undefined}
              >
                {getIcon(item.icon)}
                {!isCollapsed && <span>{item.label}</span>}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            display: 'none',
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Spacer */}
      <div
        style={{
          width: isCollapsed ? '80px' : '260px',
          flexShrink: 0,
          transition: 'width 0.3s ease',
        }}
      />

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-button {
            display: flex !important;
          }

          .sidebar-wrapper {
            width: 260px !important;
            transform: ${isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'};
            box-shadow: ${isMobileMenuOpen ? '4px 0 12px rgba(0, 0, 0, 0.15)' : 'none'};
          }

          .sidebar-wrapper + div {
            width: 0 !important;
          }

          .sidebar-wrapper + div + div {
            display: ${isMobileMenuOpen ? 'block' : 'none'} !important;
          }
        }
      `}</style>
    </>
  );
}

