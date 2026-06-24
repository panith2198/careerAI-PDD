import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BreadcrumbBar() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex px-1 py-2 text-text-tertiary text-xs select-none" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/dashboard" className="hover:text-foreground transition-all">
            Home
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return (
            <li key={to} className="flex items-center">
              <span className="mx-1 text-text-tertiary">/</span>
              {last ? (
                <span className="text-text-secondary font-medium truncate capitalize max-w-[120px]">
                  {decodeURIComponent(value)}
                </span>
              ) : (
                <Link to={to} className="hover:text-foreground transition-all capitalize max-w-[120px] truncate">
                  {decodeURIComponent(value)}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
