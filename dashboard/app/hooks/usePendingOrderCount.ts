import { useState, useEffect } from 'react';
import { orderService } from '~/services/httpServices/orderService';

export function usePendingOrderCount(): number {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const res = await orderService.getStatusCounts();
      const counts = res.statusCounts ?? {};
      const active = (counts['PENDING'] ?? 0) + (counts['PREPARING'] ?? 0);
      setCount(active);
    } catch {
      // silently fail — badge just won't show
    }
  };

  useEffect(() => {
    fetchCount();
    const timer = setInterval(fetchCount, 30_000);
    return () => clearInterval(timer);
  }, []);

  return count;
}
