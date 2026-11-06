import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReedHuntInput, reedHuntFormats } from '../src/react';

function CardForm() {
  const [card, setCard] = useState('');
  return (
    <>
      <ReedHuntInput format={reedHuntFormats.expiry} value={card} onValueChange={setCard} label="Expiry (React)" />
      <p className="readout">
        state: <code>{JSON.stringify(card)}</code>
      </p>
    </>
  );
}

export function mountReactDemo(el: HTMLElement) {
  createRoot(el).render(<CardForm />);
}
