import { useState, useEffect } from 'react';

const MOCK_USERS = [
  { id: 'u-001', name: 'יוסי כהן',  role: 'מפקד',     station: 'תחנה 3 — ירושלים', connectedAt: Date.now() - 1000 * 60 * 12, avatar: 'יכ' },
  { id: 'u-002', name: 'שרה לוי',   role: 'חובשת',    station: 'תחנה 1 — ירושלים', connectedAt: Date.now() - 1000 * 60 * 3,  avatar: 'של' },
  { id: 'u-003', name: 'דוד מזרחי', role: 'נהג',      station: 'תחנה 5 — בית שמש', connectedAt: Date.now() - 1000 * 60 * 27, avatar: 'דמ' },
  { id: 'u-004', name: 'רחל אברהם', role: 'מוקדנית',  station: 'מוקד מרכזי',        connectedAt: Date.now() - 1000 * 60 * 1,  avatar: 'רא' },
  { id: 'u-005', name: 'משה פרץ',   role: 'פרמדיק',   station: 'תחנה 2 — ירושלים', connectedAt: Date.now() - 1000 * 60 * 45, avatar: 'מפ' },
];

export default function useOnlineUsers(currentUserId, isBusy) {
  const [users, setUsers] = useState(MOCK_USERS);

  useEffect(() => {
    setUsers(prev => prev.map(u => ({
      ...u,
      busy: u.id === currentUserId ? isBusy : u.busy || false,
    })));
  }, [currentUserId, isBusy]);

  return { users, count: users.length };
}