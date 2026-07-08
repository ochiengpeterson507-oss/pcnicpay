import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Users, CreditCard, Wallet, 
  Receipt, Calendar, Bell, PieChart, Image as ImageIcon, 
  Settings, LogOut, Menu, X, Shield, FileText
} from 'lucide-react';
import { useAuth } from '../../components/AuthProvider';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
  { icon: Users, label: 'Members', path: '/admin/members' },
  { icon: CreditCard, label: 'Transactions', path: '/admin/transactions' },
  { icon: Wallet, label: 'Contributions', path: '/admin/contributions' },
  { icon: Receipt, label: 'Expenses', path: '/admin/expenses' },
  { icon: Calendar, label: 'Events', path: '/admin/events' },
  { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
  { icon: PieChart, label: 'Reports & Analytics', path: '/admin/reports' },
  { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
  { icon: ImageIcon, label: 'Gallery', path: '/admin/gallery' },
  { icon: Shield, label: 'Audit Logs', path: '/admin/audit' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-800">
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md">P</div>
          {(sidebarOpen || mobileOpen) && <span className="font-bold text-lg tracking-tight">PicnicAdmin</span>}
        </div>
        <button className="hidden md:block text-slate-400 hover:text-slate-600" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-600 font-semibold' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <item.icon size={18} className={isActive ? 'text-emerald-500' : 'text-slate-400'} />
              {(sidebarOpen || mobileOpen) && <span className="text-sm">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <div className={`flex items-center gap-3 ${!sidebarOpen && !mobileOpen ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
            {user?.name?.charAt(0)}
          </div>
          {(sidebarOpen || mobileOpen) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase tracking-wider">{user?.role}</p>
            </div>
          )}
          {(sidebarOpen || mobileOpen) && (
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: sidebarOpen ? 260 : 72,
          x: mobileOpen ? 0 : (window.innerWidth < 768 ? -260 : 0)
        }}
        className={`fixed md:relative z-50 h-full ${mobileOpen ? 'w-[260px]' : ''}`}
      >
        <SidebarContent />
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold">PicnicAdmin</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="text-slate-600 p-2">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
