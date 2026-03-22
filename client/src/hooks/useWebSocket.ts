import { useEffect, useState, useCallback } from 'react';

export interface PriceUpdate {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: number;
  bid: number;
  ask: number;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(true);
  const [prices, setPrices] = useState<Map<string, PriceUpdate>>(new Map());
  const [subscribedSymbols, setSubscribedSymbols] = useState<string[]>([]);

  // Simulate price updates with mock data
  useEffect(() => {
    if (!isConnected || subscribedSymbols.length === 0) return;

    const interval = setInterval(() => {
      setPrices((prev) => {
        const updated = new Map(prev);
        subscribedSymbols.forEach((symbol) => {
          const key = `binance:${symbol}`;
          const current = updated.get(key);
          const basePrice = current?.price || Math.random() * 50000;
          const change = (Math.random() - 0.5) * 100;
          
          updated.set(key, {
            exchange: 'binance',
            symbol,
            price: Math.max(basePrice + change, 0.01),
            timestamp: Date.now(),
            bid: Math.max(basePrice + change - 10, 0.01),
            ask: Math.max(basePrice + change + 10, 0.01),
          });
        });
        return updated;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isConnected, subscribedSymbols]);

  const subscribe = useCallback((symbols: string[]) => {
    setSubscribedSymbols(symbols);
    console.log('[WebSocket] Subscribed to:', symbols);
  }, []);

  const unsubscribe = useCallback((symbols: string[]) => {
    setSubscribedSymbols((prev) =>
      prev.filter((s) => !symbols.includes(s))
    );
    console.log('[WebSocket] Unsubscribed from:', symbols);
  }, []);

  const getPrice = useCallback(
    (exchange: string, symbol: string): PriceUpdate | undefined => {
      return prices.get(`${exchange}:${symbol}`);
    },
    [prices]
  );

  return {
    socket: null,
    isConnected,
    prices,
    subscribe,
    unsubscribe,
    getPrice,
  };
}
