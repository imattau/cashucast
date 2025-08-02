import React from 'react';
import { useBalanceStore } from './balanceStore';

/** Transaction list displaying wallet activity. */
export const TxList: React.FC = () => {
  const txs = useBalanceStore((s) => s.txs);
  return (
    <ul className="divide-y border rounded">
      {txs.length === 0 && <li className="p-2">No transactions</li>}
      {txs.map((tx) => (
        <li key={tx.id} className="p-2">
          {tx.type === 'mint' ? '+' : '-'}{tx.amount} sats - {tx.status}
        </li>
      ))}
    </ul>
  );
};
