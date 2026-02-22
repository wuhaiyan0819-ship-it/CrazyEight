import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Suit } from '../types';
import { getSuitSymbol, getSuitColor } from '../utils';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
}

const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect }) => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const suitNames: Record<Suit, string> = {
    hearts: '红心',
    diamonds: '方块',
    clubs: '梅花',
    spades: '黑桃'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">选择一个新花色</h2>
        <div className="grid grid-cols-2 gap-4">
          {suits.map((suit) => (
            <button
              key={suit}
              onClick={() => onSelect(suit)}
              className={`
                flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100
                hover:border-indigo-500 hover:bg-indigo-50 transition-all group
              `}
            >
              <span className={`text-5xl mb-2 ${getSuitColor(suit)} group-hover:scale-110 transition-transform`}>
                {getSuitSymbol(suit)}
              </span>
              <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                {suitNames[suit]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default SuitSelector;
