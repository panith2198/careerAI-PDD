import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomNavMobile from './BottomNavMobile';
import PageContainer from './PageContainer';
import BreadcrumbBar from './BreadcrumbBar';
import useUiStore from '@/stores/uiStore';

export default function AppShell() {
  const isSidebarCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className={`${isChatPage ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background text-foreground flex flex-col font-sans`}>
      {/* Sidebar - Desktop Only */}
      <Sidebar />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'md:pl-[68px]' : 'md:pl-[260px]'} ${isChatPage ? 'h-screen overflow-hidden' : ''}`}>
        {/* Top Header Bar */}
        <TopBar />

        {/* Dynamic Nested Content */}
        {isChatPage ? (
          <main className="flex-1 overflow-hidden flex flex-col">
            <Outlet />
          </main>
        ) : (
          <main className="flex-grow">
            <PageContainer>
              <BreadcrumbBar />
              <div className="mt-4">
                <Outlet />
              </div>
            </PageContainer>
          </main>
        )}
      </div>

      {/* Sticky Bottom Bar - Mobile Only */}
      <BottomNavMobile />
    </div>
  );
}
