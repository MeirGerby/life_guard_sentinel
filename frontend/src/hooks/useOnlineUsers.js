import { useState, useEffect } from 'react';
import { getOnlineUsers } from '../services/api';

export default function useOnlineUsers(currentUserId, isBusy) {
  const [users, setUsers]   = useState([]);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        const res = await getOnlineUsers();
        const rawUsers = res.data?.users || res.data || [];
        setUsers(rawUsers);
      } catch (err) {
        setError('לא ניתן לטעון משתמשים');
        console.error('Failed to fetch online users:', err);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  // עדכן סטטוס עסוק של המשתמש הנוכחי
  useEffect(() => {
    if (!currentUserId) return;
    setUsers(prev => prev.map(u => ({
      ...u,
      busy: u.id === currentUserId ? isBusy : u.busy,
    })));
  }, [currentUserId, isBusy]);

  return { users, count: users.length, error };
}