import React from 'react';
import { Navbar } from '../components/Navbar.js';

export const AdminHomePage: React.FC = () => {
  return (
    <div className="bg-surface text-on-surface min-h-screen flex">
      <Navbar />
      <main className="flex-grow" />
    </div>
  );
};
