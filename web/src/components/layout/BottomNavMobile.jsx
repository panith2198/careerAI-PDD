import React from 'react';
import { NavLink } from 'react-router-dom';
import { HugeiconsIcon } from '@hugeicons/react';
import { 
  Home01Icon, 
  Briefcase01Icon, 
  ChatBotIcon, 
  UserIcon 
} from '@hugeicons/core-free-icons';

export default function BottomNavMobile() {
  const items = [
    { name: 'Home', path: '/dashboard', icon: Home01Icon },
    { name: 'Careers', path: '/careers', icon: Briefcase01Icon },
    { name: 'AI Chat', path: '/chat', icon: ChatBotIcon, special: true },
    { name: 'Jobs', path: '/jobs', icon: Briefcase01Icon },
    { name: 'Profile', path: '/profile', icon: UserIcon }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-surface-1 border-t border-border flex items-center justify-around md:hidden z-20 pb-safe px-2 text-foreground">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 h-full py-1 text-xs gap-1 transition-all ${
              isActive
                ? item.special
                  ? 'text-cyan-brand font-semibold scale-110'
                  : 'text-primary-glow font-semibold scale-110'
                : 'text-text-secondary hover:text-foreground'
            }`
          }
        >
          <HugeiconsIcon icon={item.icon} strokeWidth={2} className="size-5" />
          <span className="text-[10px] tracking-wide">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
}
