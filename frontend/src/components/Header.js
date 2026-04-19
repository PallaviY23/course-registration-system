import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-[#D32F2F] text-white shadow-md py-2 px-6 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-bold">Student Registration Application</h1>
        <span className="bg-green-600 text-xs px-2 py-1 rounded">Mark as Favourite</span>
      </div>
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <User size={18} />
          <span>AAYUSHMAN KUMAR</span>
        </div>
        <button className="hover:bg-red-700 p-1 rounded"><LogOut size={18} /></button>
      </div>
    </header>
  );
};

export default Header;