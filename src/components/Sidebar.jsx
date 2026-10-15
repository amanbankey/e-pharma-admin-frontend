import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Pill, Boxes, ClipboardList, LineChart, Users, ShieldCheck,
  Menu, X, LogOut, Leaf, Tag, KeyRound,  
} from 'lucide-react';
import { useAdminAuth } from '../lib/AdminAuthContext';
import ChangePasswordModal from './ChangePasswordModal';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'orders' },
  { to: '/products', label: 'Products', icon: Pill, permission: 'products' },
   { to: '/category', label: 'Categories', icon: Tag, permission: 'products' },
  { to: '/inventory', label: 'Inventory', icon: Boxes, permission: 'inventory' },
  { to: '/orders', label: 'Orders', icon: ClipboardList, permission: 'orders' },
  { to: '/reports', label: 'Reports', icon: LineChart, permission: 'reports' },
  { to: '/customers', label: 'Customers', icon: Users, permission: 'users' },
  { to: '/admins', label: 'Admin team', icon: ShieldCheck, permission: 'admins' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const { admin, can, logout } = useAdminAuth();
  const { admin: currentAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false)


  const handleLogout = () => { 
      localStorage.removeItem("token");
     localStorage.removeItem("admin");
     setShowPopup(false);
    logout();
    navigate('/login');
  };

  const links = navItems.filter((item) => can(item.permission));

  const content = (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-2 px-6 py-6">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gold-600 text-teal-900">
          <Leaf size={18} strokeWidth={2.2} />
        </span>
        <div>
          <p className="font-display text-lg leading-none text-cream">Vernal Rx</p>
          <p className="text-[11px] uppercase tracking-wide text-cream/50">Admin panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-gold-600 text-teal-900' : 'text-cream/70 hover:bg-cream/10 hover:text-cream'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-cream/10 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl bg-cream/5 px-3 py-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-900 font-display text-sm">
            {admin?.fullName?.[0]?.toUpperCase() || 'A'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-cream">{admin?.fullName}</p>
            <p className="truncate text-xs capitalize text-cream/50">{admin?.role}</p>
          </div>
            {currentAdmin?.role === 'superadmin' && (
          <button
            onClick={() => setPasswordModalOpen(true)}
            aria-label="Change password"
            title="Change password"
            className="p-1.5 text-cream/60 hover:text-gold-400 transition"
          >
            <KeyRound size={16} />
          </button>)}
          <button onClick={() => setShowPopup(true)} aria-label="Log out" title="Log out" className="p-1.5 text-cream/60 hover:text-red-400 transition">
            <LogOut size={16} />
          </button>
        </div>
      </div>


     <AnimatePresence>
  {showPopup && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={() => setShowPopup(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-cream/10 bg-teal-900 shadow-2xl"
      >
        <button
          onClick={() => setShowPopup(false)}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-cream/50 transition hover:bg-cream/10 hover:text-cream"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6">
          <div className="mb-5 grid h-11 w-11 place-items-center rounded-full bg-red-400/10 text-red-400">
            <LogOut size={20} />
          </div>

          <h2 className="font-display text-xl font-semibold text-cream">
            Logout?
          </h2>

          <p className="mt-2 text-sm leading-6 text-cream/50">
            Are you sure you want to logout from your admin account?
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setShowPopup(false)}
              className="flex-1 rounded-xl border border-cream/10 bg-cream/5 px-4 py-2.5 text-sm font-medium text-cream transition hover:bg-cream/10"
            >
              Cancel
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 rounded-xl bg-red-500/90 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 bg-teal-900 lg:block">{content}</aside>

      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-20 grid h-10 w-10 place-items-center rounded-xl bg-teal-900 text-cream shadow-lg lg:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-teal-900 lg:hidden"
            >
              <button onClick={() => setOpen(false)} className="absolute right-4 top-5 text-cream/70" aria-label="Close menu">
                <X size={20} />
              </button>
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </>
  );
}
