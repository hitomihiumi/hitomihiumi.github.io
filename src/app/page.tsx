'use client';

import { useEffect, useState } from 'react';
import ChatOverlay from '@/components/ChatOverlay';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <ChatOverlay />;
}
