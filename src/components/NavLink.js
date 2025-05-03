'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, children, scrolled, className }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  // Base styles
  const baseStyles = "flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200";

  // Determine styles based on active state and scroll position
  let styles = '';

  if (scrolled) {
    if (isActive) {
      styles = "bg-indigo-100 text-indigo-700 font-semibold shadow-sm";
    } else {
      styles = "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600";
    }
  } else {
    if (isActive) {
      styles = "bg-indigo-900 bg-opacity-30 text-white font-semibold shadow-sm border border-white border-opacity-30";
    } else {
      styles = "text-white hover:bg-indigo-900 hover:bg-opacity-30 hover:border hover:border-white hover:border-opacity-30";
    }
  }

  return (
    <Link href={href} className={`${baseStyles} ${styles} ${className || ''}`}>
      {children}
    </Link>
  );
}
