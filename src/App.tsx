import React from 'react';
import { useCrazyEights } from './hooks/useCrazyEights';
import Card from './components/Card';
import SuitSelector from './components/SuitSelector';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Info, User, Cpu } from 'lucide-react';
import { getSuitSymbol, getSuitColor } from './utils';

export default function App() {
  const { state, startGame, drawCard, handlePlayerCardClick, selectSuit } = useCrazyEights();

  if (state.status === 'waiting') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-center items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-[2rem] p-12 shadow-xl border border-slate-100 text-center"
        >
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg rotate-3">
            <span className="text-white text-5xl font-black">8</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Max疯狂8点</h1>
          <p className="text-slate-500 mb-10 leading-relaxed">
            经典的策略与运气纸牌游戏。匹配花色或点数，使用万能的 8 来改变战局！
          </p>
          <button
            onClick={startGame}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            开始游戏
          </button>
        </motion.div>
      </div>
    );
  }

  const topDiscard = state.discardPile[state.discardPile.length - 1];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-bottom border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">8</span>
          </div>
          <span className="font-black text-xl tracking-tight text-slate-900">Max疯狂8点</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full font-bold text-sm transition-colors flex items-center gap-2 ${state.turn === 'player' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            <User size={16} />
            {state.turn === 'player' ? "你的回合" : "AI 思考中..."}
          </div>
          <button 
            onClick={startGame}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            title="重新开始"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      {/* Game Board */}
      <main className="flex-1 relative flex flex-col items-center justify-between p-4 sm:p-8">
        
        {/* AI Hand */}
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <Cpu size={14} />
            AI 对手 ({state.aiHand.length})
          </div>
          <div className="flex -space-x-12 sm:-space-x-16 h-36 sm:h-48">
            {state.aiHand.map((card, i) => (
              <Card key={card.id} card={card} isFaceDown index={i} total={state.aiHand.length} />
            ))}
          </div>
        </div>

        {/* Center Area: Deck and Discard */}
        <div className="flex items-center gap-8 sm:gap-16 my-8">
          {/* Draw Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative group">
              <div className="absolute inset-0 bg-slate-300 rounded-xl translate-y-2 translate-x-1"></div>
              <div className="absolute inset-0 bg-slate-200 rounded-xl translate-y-1 translate-x-0.5"></div>
              <Card 
                card={state.deck[0] || { id: 'empty', suit: 'hearts', rank: 'A' }} 
                isFaceDown 
                onClick={state.turn === 'player' ? drawCard : undefined}
              />
              {state.turn === 'player' && (
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg animate-bounce">
                  摸牌
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">摸牌堆 ({state.deck.length})</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <AnimatePresence mode="popLayout">
                <Card key={topDiscard.id} card={topDiscard} />
              </AnimatePresence>
              
              {/* Current Suit Indicator (for 8s) */}
              {state.currentRank === '8' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-6 -right-6 w-12 h-12 bg-white rounded-full shadow-xl border-2 border-indigo-500 flex items-center justify-center"
                >
                  <span className={`text-2xl ${getSuitColor(state.currentSuit!)}`}>
                    {getSuitSymbol(state.currentSuit!)}
                  </span>
                </motion.div>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">弃牌堆</span>
          </div>
        </div>

        {/* Player Hand */}
        <div className="w-full flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
            <User size={14} />
            你的手牌 ({state.playerHand.length})
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 max-w-5xl">
            {state.playerHand.map((card, i) => {
              const isPlayable = state.turn === 'player' && (
                card.rank === '8' || 
                card.suit === state.currentSuit || 
                card.rank === state.currentRank
              );
              return (
                <Card 
                  key={card.id} 
                  card={card} 
                  onClick={() => handlePlayerCardClick(card)}
                  isPlayable={isPlayable}
                  index={i}
                  total={state.playerHand.length}
                />
              );
            })}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {state.isSuitSelectionOpen && (
          <SuitSelector onSelect={selectSuit} />
        )}

        {(state.status === 'player_won' || state.status === 'ai_won') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-12 shadow-2xl max-w-md w-full text-center border-4 border-indigo-500"
            >
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Trophy className={state.status === 'player_won' ? 'text-yellow-500' : 'text-slate-400'} size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">
                {state.status === 'player_won' ? '胜利！' : '游戏结束'}
              </h2>
              <p className="text-slate-500 mb-10 text-lg">
                {state.status === 'player_won' 
                  ? '你清空了手牌，击败了 AI！' 
                  : '这次 AI 更快一步。下次好运！'}
              </p>
              <button
                onClick={startGame}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-3"
              >
                <RotateCcw size={24} />
                再玩一次
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="p-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        匹配花色或点数 • 8 是万能牌 • 最先出完牌者获胜
      </footer>
    </div>
  );
}
