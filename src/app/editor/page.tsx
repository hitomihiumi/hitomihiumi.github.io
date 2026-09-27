'use client';

import { useEffect, useState } from 'react';
import Editor from '@/components/editor/Editor';
import { fetchTokenUser, loadAuth, saveAuth, StoredAuth } from '@/lib/auth';

export default function EditorPage() {
  const [auth, setAuth] = useState<StoredAuth | null | undefined>(undefined);

  useEffect(() => {
    const stored = loadAuth();
    setAuth(stored);
    // Drop tokens that expired or were revoked.
    if (stored) {
      fetchTokenUser(stored.token)
        .then((user) => {
          if (!user) {
            saveAuth(null);
            setAuth(null);
          }
        })
        .catch(() => {});
    }
  }, []);

  if (auth === undefined) return null;

  return (
    <Editor
      auth={auth}
      onLogout={() => {
        saveAuth(null);
        setAuth(null);
      }}
    />
  );
}
