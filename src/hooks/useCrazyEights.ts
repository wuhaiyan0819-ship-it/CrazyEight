import { useState, useCallback, useEffect } from 'react';
import { Card, Suit, GameState, GameStatus } from '../types';
import { createDeck } from '../utils';

export const useCrazyEights = () => {
  const [state, setState] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentSuit: null,
    currentRank: null,
    turn: 'player',
    status: 'waiting',
    isSuitSelectionOpen: false,
    selectedCardForSuit: null,
  });

  const startGame = useCallback(() => {
    const fullDeck = createDeck();
    const playerHand = fullDeck.splice(0, 8);
    const aiHand = fullDeck.splice(0, 8);
    
    // Ensure the first card in discard pile is not an 8
    let firstCardIndex = 0;
    while (fullDeck[firstCardIndex].rank === '8') {
      firstCardIndex++;
    }
    const firstCard = fullDeck.splice(firstCardIndex, 1)[0];

    setState({
      deck: fullDeck,
      playerHand,
      aiHand,
      discardPile: [firstCard],
      currentSuit: firstCard.suit,
      currentRank: firstCard.rank,
      turn: 'player',
      status: 'playing',
      isSuitSelectionOpen: false,
      selectedCardForSuit: null,
    });
  }, []);

  const drawCard = useCallback((target: 'player' | 'ai') => {
    setState((prev) => {
      if (prev.deck.length === 0) {
        // If deck is empty, skip turn or handle empty deck (could reshuffle discard pile)
        if (prev.discardPile.length > 1) {
            const topCard = prev.discardPile[prev.discardPile.length - 1];
            const rest = prev.discardPile.slice(0, -1);
            const newDeck = createDeck().filter(c => !prev.playerHand.find(ph => ph.id === c.id) && !prev.aiHand.find(ah => ah.id === c.id) && c.id !== topCard.id);
            // Simple reshuffle for now: just get a fresh deck minus current cards
            return {
                ...prev,
                deck: newDeck,
                turn: prev.turn === 'player' ? 'ai' : 'player'
            };
        }
        return { ...prev, turn: prev.turn === 'player' ? 'ai' : 'player' };
      }

      const newDeck = [...prev.deck];
      const card = newDeck.pop()!;
      
      const nextTurn = prev.turn === 'player' ? 'ai' : 'player';

      if (target === 'player') {
        return {
          ...prev,
          deck: newDeck,
          playerHand: [...prev.playerHand, card],
          turn: 'ai', // Drawing ends turn in this version for simplicity
        };
      } else {
        return {
          ...prev,
          deck: newDeck,
          aiHand: [...prev.aiHand, card],
          turn: 'player',
        };
      }
    });
  }, []);

  const playCard = useCallback((card: Card, target: 'player' | 'ai', newSuit?: Suit) => {
    setState((prev) => {
      const isEight = card.rank === '8';
      
      // Validation (only for player, AI logic handles its own validation)
      if (target === 'player' && !isEight && card.suit !== prev.currentSuit && card.rank !== prev.currentRank) {
        return prev;
      }

      const handKey = target === 'player' ? 'playerHand' : 'aiHand';
      const newHand = prev[handKey].filter((c) => c.id !== card.id);
      const newDiscardPile = [...prev.discardPile, card];
      
      let nextStatus: GameStatus = prev.status;
      if (newHand.length === 0) {
        nextStatus = target === 'player' ? 'player_won' : 'ai_won';
      }

      const nextState = {
        ...prev,
        [handKey]: newHand,
        discardPile: newDiscardPile,
        currentSuit: isEight ? (newSuit || card.suit) : card.suit,
        currentRank: card.rank,
        status: nextStatus,
        turn: target === 'player' ? 'ai' : 'player' as 'player' | 'ai',
        isSuitSelectionOpen: false,
      };

      return nextState;
    });
  }, []);

  const handlePlayerCardClick = (card: Card) => {
    if (state.turn !== 'player' || state.status !== 'playing') return;

    const isEight = card.rank === '8';
    const isValid = isEight || card.suit === state.currentSuit || card.rank === state.currentRank;

    if (!isValid) return;

    if (isEight) {
      setState(prev => ({ ...prev, isSuitSelectionOpen: true, selectedCardForSuit: card }));
    } else {
      playCard(card, 'player');
    }
  };

  const selectSuit = (suit: Suit) => {
    const card = state.selectedCardForSuit;
    if (card) {
      playCard(card, 'player', suit);
    }
  };

  // AI Logic
  useEffect(() => {
    if (state.turn === 'ai' && state.status === 'playing') {
      const timer = setTimeout(() => {
        const playableCards = state.aiHand.filter(
          (c) => c.rank === '8' || c.suit === state.currentSuit || c.rank === state.currentRank
        );

        if (playableCards.length > 0) {
          // Prefer non-8s
          const nonEight = playableCards.find((c) => c.rank !== '8');
          const cardToPlay = nonEight || playableCards[0];
          
          if (cardToPlay.rank === '8') {
            // AI picks its most frequent suit
            const suitCounts: Record<Suit, number> = { hearts: 0, diamonds: 0, clubs: 0, spades: 0 };
            state.aiHand.forEach(c => suitCounts[c.suit]++);
            const bestSuit = (Object.keys(suitCounts) as Suit[]).reduce((a, b) => suitCounts[a] > suitCounts[b] ? a : b);
            playCard(cardToPlay, 'ai', bestSuit);
          } else {
            playCard(cardToPlay, 'ai');
          }
        } else {
          drawCard('ai');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.turn, state.status, state.aiHand, state.currentSuit, state.currentRank, playCard, drawCard]);

  return {
    state,
    startGame,
    drawCard: () => drawCard('player'),
    handlePlayerCardClick,
    selectSuit,
  };
};
