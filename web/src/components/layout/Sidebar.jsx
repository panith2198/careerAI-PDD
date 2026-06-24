import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Home01Icon, 
  Briefcase01Icon, 
  ChatBotIcon, 
  Task01Icon, 
  RouteIcon, 
  UserIcon, 
  Settings01Icon, 
  AnalyticsUpIcon, 
  Notification01Icon,
  SecurityIcon,
  SidebarLeftIcon,
  SidebarRightIcon,
  Add01Icon,
  FileUploadIcon
} from '@hugeicons/core-free-icons';
import useAuthStore from '@/stores/authStore';
import useUiStore from '@/stores/uiStore';
import Logo from '@/components/common/Logo';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

export default function Sidebar() {
  const user = useAuthStore((state) => state.user);
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useUiStore();
  const [logoHovered, setLogoHovered] = useState(false);

  const primaryNav = [
    { name: 'Dashboard', path: '/dashboard', icon: Home01Icon },
    { name: 'AI Chat', path: '/chat', icon: ChatBotIcon, special: true },
    { name: 'Careers', path: '/careers', icon: Briefcase01Icon },
    { name: 'Resume', path: '/resume/upload', icon: FileUploadIcon },
    { name: 'Assessments', path: '/assessments', icon: Task01Icon },
    { name: 'Jobs', path: '/jobs', icon: Briefcase01Icon },
    { name: 'Analytics', path: '/analytics', icon: AnalyticsUpIcon },
  ];

  const secondaryNav = [
    { name: 'Notifications', path: '/notifications', icon: Notification01Icon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Settings', path: '/settings', icon: Settings01Icon },
  ];


  const renderNavItem = (item) => {
    const linkContent = (
      <NavLink
        to={item.path}
        className={({ isActive }) =>
          `group/item flex items-center transition-all duration-200 ${
            isSidebarCollapsed
              ? 'justify-center w-10 h-10 rounded-lg mx-auto'
              : 'gap-3 px-3 py-2 rounded-lg w-full'
          } ${
            isActive
              ? 'bg-white/[0.08] text-white font-semibold'
              : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <HugeiconsIcon 
              icon={item.icon} 
              strokeWidth={1.8} 
              className={`size-[18px] shrink-0 transition-colors ${
                isActive 
                  ? item.special 
                    ? 'text-cyan-400' 
                    : 'text-violet-400' 
                  : 'text-white/50 group-hover/item:text-white/80'
              }`} 
            />
            {!isSidebarCollapsed && (
              <span className="text-[13px] font-medium truncate">{item.name}</span>
            )}
          </>
        )}
      </NavLink>
    );

    if (isSidebarCollapsed) {
      return (
        <Tooltip key={item.path}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10} className="bg-[#2A2A3E] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg shadow-2xl font-medium">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <React.Fragment key={item.path}>{linkContent}</React.Fragment>;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={`bg-[#0F0F1A] border-r border-white/[0.06] h-screen flex flex-col fixed left-0 top-0 z-20 text-white hidden md:flex transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-[68px]' : 'w-[260px]'}`}>
        
        {/* Header — Logo + Toggle */}
        <div className={`h-14 flex items-center shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4 justify-between'}`}>
          {/* Logo area — shows expand icon on hover when collapsed */}
          <div 
            className={`flex items-center gap-2.5 transition-all duration-200 ${isSidebarCollapsed ? 'cursor-pointer' : ''}`}
            onMouseEnter={() => isSidebarCollapsed && setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            onClick={() => isSidebarCollapsed && toggleSidebarCollapsed()}
          >
            {isSidebarCollapsed && logoHovered ? (
              <Tooltip open>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors">
                    <HugeiconsIcon icon={SidebarRightIcon} strokeWidth={1.8} className="size-[18px] text-white/70" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={10} className="bg-[#2A2A3E] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg shadow-2xl font-medium">
                  Expand sidebar
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <Logo className="size-7 shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-sm font-semibold text-white/90 tracking-tight truncate">
                    CareerAi
                  </span>
                )}
              </>
            )}
          </div>

          {/* Collapse toggle button — top right inside sidebar, only when expanded */}
          {!isSidebarCollapsed && (
            <button
              onClick={toggleSidebarCollapsed}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all cursor-pointer"
              title="Collapse sidebar"
            >
              <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={1.8} className="size-[18px]" />
            </button>
          )}
        </div>

        {/* New Chat CTA — only when expanded */}
        {!isSidebarCollapsed && (
          <div className="px-3 pb-1 pt-1">
            <NavLink
              to="/chat"
              className="w-full py-2 px-3 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/80 hover:text-white rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer"
            >
              <HugeiconsIcon icon={Add01Icon} strokeWidth={1.8} className="size-4" />
              <span>New Chat</span>
            </NavLink>
          </div>
        )}

        {/* Primary Navigation */}
        <nav className={`flex-1 overflow-y-auto flex flex-col py-3 transition-all duration-300 ${isSidebarCollapsed ? 'items-center px-2 gap-1' : 'items-stretch px-3 gap-0.5'}`}>
          {primaryNav.map(renderNavItem)}

          {/* Divider */}
          <div className={`my-3 border-t border-white/[0.06] ${isSidebarCollapsed ? 'w-6' : 'w-full'}`} />

          {secondaryNav.map(renderNavItem)}
        </nav>

        {/* Footer — User profile area */}
        <div className={`shrink-0 border-t border-white/[0.06] transition-all duration-300 ${isSidebarCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
          {isSidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/profile"
                  className="w-10 h-10 rounded-lg bg-violet-600/20 border border-violet-500/15 flex items-center justify-center text-violet-300 text-xs font-bold uppercase hover:bg-violet-600/30 transition-all"
                >
                  {user?.name ? user.name[0] : 'U'}
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10} className="bg-[#2A2A3E] border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg shadow-2xl font-medium">
                {user?.name || 'Profile'}
              </TooltipContent>
            </Tooltip>
          ) : (
            <NavLink
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/15 flex items-center justify-center text-violet-300 text-xs font-bold uppercase shrink-0">
                {user?.name ? user.name[0] : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/80 truncate leading-tight">
                  {user?.name || 'Career Explorer'}
                </p>
                <p className="text-[11px] text-white/30 truncate leading-tight">
                  {user?.email || user?.role || 'Free Plan'}
                </p>
              </div>
            </NavLink>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
