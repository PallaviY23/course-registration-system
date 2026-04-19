import React from 'react';
import { LayoutDashboard, BookOpen, UserCheck, Settings, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18}/>, path: '/' },
    { name: 'Academics', icon: <GraduationCap size={18}/>, path: '/registration' },
    { name: 'Professor Portal', icon: <UserCheck size={18}/>, path: '/professor' },
    { name: 'Settings', icon: <Settings size={18}/>, path: '/settings' },
  ];

  return (
    <div className="w-64 bg-[#263238] text-gray-300 flex flex-col h-full">
      <div className="p-6 text-white font-bold text-2xl border-b border-gray-700">
        pingala
      </div>
      <nav className="flex-1 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center px-6 py-3 hover:bg-[#1a252b] hover:text-white transition-colors"
          >
            {item.icon}
            <span className="ml-3 text-sm">{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;