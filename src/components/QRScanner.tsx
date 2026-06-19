import React from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

export function QRScanner({ onScan }: { onScan: (text: string) => void }) {
  return (
    <div className="rounded-[18px] overflow-hidden border border-black/10 dark:border-white/10 relative">
      <Scanner
        onScan={(result) => {
          if (result && result.length > 0) {
            onScan(result[0].rawValue);
          }
        }}
        onError={(error) => {
           console.log(error);
        }}
      />
    </div>
  );
}
