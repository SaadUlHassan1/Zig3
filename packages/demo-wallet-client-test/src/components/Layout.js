import React from 'react';
import HeaderZig from './Header-Zig';

export default function Layout({ children }) {
  return (
    <>
      <HeaderZig />
      {children}
    </>
  );
}
