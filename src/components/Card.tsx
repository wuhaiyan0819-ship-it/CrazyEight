import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType } from '../types';
import { getSuitSymbol, getSuitColor } from '../utils';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isFaceDown?: boolean;
  isPlayable?: boolean;
  index?: number;
  total?: number;
}

const Card: React.FC<CardProps> = ({ card, onClick, isFaceDown, isPlayable, index = 0, total = 1 }) => {
  const rotation = total > 1 ? (index - (total - 1) / 2) * 5 : 0;

  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0, y: 50 }}
      animate={{ 
        scale: 1, 
        opacity: 1, 
        y: 0,
        rotate: rotation,
        zIndex: index
      }}
      whileHover={onClick && isPlayable ? { y: -20, scale: 1.05, zIndex: 50 } : {}}
      onClick={onClick}
      className={`
        relative w-24 h-36 sm:w-32 sm:h-48 rounded-xl shadow-lg border-2 
        flex flex-col items-center justify-center cursor-pointer transition-colors
        ${isFaceDown 
          ? 'bg-indigo-600 border-indigo-400' 
          : 'bg-white border-slate-200'}
        ${isPlayable ? 'ring-4 ring-emerald-400/50 border-emerald-400' : ''}
        ${!isFaceDown && !isPlayable && onClick ? 'opacity-60 grayscale-[0.5]' : ''}
      `}
    >
      {isFaceDown ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-24 sm:w-20 sm:h-32 border-2 border-white/20 rounded-lg flex items-center justify-center">
            <div className="text-white/20 text-4xl font-bold">8</div>
          </div>
        </div>
      ) : (
        <>
          <div className={`absolute top-2 left-2 flex flex-col items-center ${getSuitColor(card.suit)}`}>
            <span className="text-lg sm:text-xl font-bold leading-none">{card.rank}</span>
            <span className="text-sm sm:text-base leading-none">{getSuitSymbol(card.suit)}</span>
          </div>
          
          <div className={`text-4xl sm:text-6xl ${getSuitColor(card.suit)}`}>
            {getSuitSymbol(card.suit)}
          </div>

          <div className={`absolute bottom-2 right-2 flex flex-col items-center rotate-180 ${getSuitColor(card.suit)}`}>
            <span className="text-lg sm:text-xl font-bold leading-none">{card.rank}</span>
            <span className="text-sm sm:text-base leading-none">{getSuitSymbol(card.suit)}</span>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default Card;
