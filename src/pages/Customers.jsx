import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { usersApi } from '../lib/api';

export default function Customers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    usersApi.getAll().then((data) => setUsers(data.users)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this customer account?')) return;
    await usersApi.remove(id);
    load();
  };

  return (
    <div className="p-6 lg:p-10">
      <h1 className="font-display text-3xl text-teal-900">Customers</h1>
      <p className="mt-1 text-ink-soft">Everyone who has signed up on the storefront.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper">
        {loading ? (
          <p className="p-6 text-ink-soft">Loading…</p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">City</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-5 py-3 font-medium text-teal-900">{u.fullName}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.email}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.phone}</td>
                  <td className="px-5 py-3 text-ink-soft">{u.city || '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(u._id)} className="text-ink-soft hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-ink-soft">No customers yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
