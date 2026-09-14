# Vernal Rx — Admin Panel

A completely separate React + Vite + Tailwind CSS v4 frontend for managing the Vernal Rx pharmacy — same design system as the storefront, different app, different login, different token.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your backend
npm run dev             # runs on :5175 by default, add to the backend's ADMIN_FRONTEND_URL
```

Before logging in, create the super admin once (see the backend README's
"One-time: create the super admin" section).

## Login

The sign-in screen has two tabs — **Admin** and **Super Admin** — matching
`loginAs` in the request body. A super admin account can only sign in on the
Super Admin tab, and vice versa.

## Structure

```
src/
  components/  Sidebar (permission-aware nav), Shell, ProtectedRoute,
               StatCard, StatusBadge
  pages/       Login, Dashboard, Products, Inventory, Orders, Reports,
               Customers, Admins
  lib/         api.js (backend calls, separate admin token),
               AdminAuthContext.jsx (session + permission checks)
```

## What each screen does

- **Dashboard** — total revenue (in lakhs once it crosses ₹1L), total orders,
  total customers, active users (last 30 days), a revenue trend chart, an
  order-status pie chart, and a recent-orders table with each customer's
  full contact + address.
- **Products** — category-wise catalogue CRUD. Anything added here shows up
  on the storefront immediately (same `Product` collection).
- **Inventory** — total/available/reserved/low-stock/out-of-stock/expiring/expired
  counts, a filterable stock table, inline stock editing.
- **Orders** — every order with full lifecycle status (pending → confirmed →
  processing → packed → shipped → out for delivery → delivered, or
  cancelled/returned/refunded), a detail drawer with the customer's info and
  a price breakdown, and a status dropdown to move it forward.
- **Reports** — daily/weekly/monthly/yearly sales chart and a top-selling
  products list.
- **Customers** — every registered storefront user, with delete.
- **Admin team** *(super admin only)* — create admins with a per-section
  permission picker (products / inventory / orders / reports / customers),
  enable/disable, or remove them.

## Permissions

Each nav item and route is gated by the `permissions` array on the logged-in
admin (`useAdminAuth().can('section')`). A super admin always sees
everything; a regular admin only sees what they were granted — the sidebar
itself hides sections they can't access, and route guards double as a
safety net if they navigate there directly.

## Notes

- The admin token is stored in `localStorage` (`adminToken`) and sent as a
  Bearer token — kept entirely separate from the storefront's cookie-based
  customer session, so neither can be used to access the other's routes.
- Product images here are comma-separated links, same as the storefront —
  wire up real image upload (Cloudinary is already configured on the
  backend) when you're ready.
