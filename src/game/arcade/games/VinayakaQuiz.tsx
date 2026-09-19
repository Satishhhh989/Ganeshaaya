/**
 * GAME 07: VINAYAKA STORIES QUIZ — Knowledge quiz about Ganesha
 * 15 questions with timer, streak bonus, and wisdom ranking.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useMiniGame } from '../MiniGameManager';
import { scoreManager } from '../ScoreManager';
import { arcadeAudio } from '../ArcadeAudioController';

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    question: "Who is Lord Ganesha's mother?",
    options: ['Saraswati', 'Lakshmi', 'Parvati', 'Durga'],
    correct: 2,
    explanation: 'Goddess Parvati created Ganesha from sandalwood paste and breathed life into him.',
  },
  {
    question: 'What is the name of Ganesha\'s mouse companion?',
    options: ['Nandi', 'Mushak', 'Garuda', 'Hamsa'],
    correct: 1,
    explanation: 'Mushak (also called Mooshika) is Ganesha\'s faithful mouse vehicle (vahana).',
  },
  {
    question: "What is Ganesha's favorite sweet?",
    options: ['Ladoo', 'Modak', 'Jalebi', 'Gulab Jamun'],
    correct: 1,
    explanation: 'Modak is Ganesha\'s favorite sweet offering, symbolizing the sweetness of knowledge.',
  },
  {
    question: 'Ganesha is known as the remover of what?',
    options: ['Poverty', 'Obstacles', 'Ignorance', 'Disease'],
    correct: 1,
    explanation: 'Ganesha is Vighnaharta — the remover of obstacles, invoked before any new beginning.',
  },
  {
    question: 'How many days is Ganesh Chaturthi typically celebrated?',
    options: ['5 days', '7 days', '10 days', '15 days'],
    correct: 2,
    explanation: 'The festival lasts 10 days, from Chaturthi to Anant Chaturdashi.',
  },
  {
    question: 'What does "Ganpati Bappa Morya" mean?',
    options: ['Hail Lord Ganesha', 'O Father Ganpati, come again soon', 'Victory to Ganesha', 'Praise to Ganesha'],
    correct: 1,
    explanation: '"Ganpati Bappa Morya, Purchya Varshi Laukarya" means "O Father Ganpati, come again early next year."',
  },
  {
    question: 'What is "Visarjan" in Ganesh Chaturthi?',
    options: ['Installation of the idol', 'Offering prayers', 'Immersion of the idol in water', 'Preparing prasad'],
    correct: 2,
    explanation: 'Visarjan is the immersion of the Ganesha idol in water, symbolizing his return to Mount Kailash.',
  },
  {
    question: 'Why does Ganesha have an elephant head?',
    options: ['He was born that way', 'Shiva replaced his head with an elephant\'s', 'Vishnu\'s blessing', 'Brahma\'s creation'],
    correct: 1,
    explanation: 'Lord Shiva, in divine resolution, replaced Ganesha\'s head with that of a celestial elephant.',
  },
  {
    question: 'What does Ganesha hold in his upper right hand?',
    options: ['Trident', 'Lotus', 'Ankusha (goad)', 'Modak'],
    correct: 2,
    explanation: 'The ankusha (elephant goad) symbolizes Ganesha\'s power to remove obstacles from our spiritual path.',
  },
  {
    question: 'Which grass is sacred to Ganesha?',
    options: ['Kusha', 'Durva', 'Tulsi', 'Doob'],
    correct: 1,
    explanation: 'Durva grass (21 blades) is especially sacred to Lord Ganesha and is offered during worship.',
  },
  {
    question: 'What is the significance of Ganesha\'s broken tusk?',
    options: ['Lost in battle', 'Used to write the Mahabharata', 'Symbol of sacrifice', 'Both B and C'],
    correct: 3,
    explanation: 'Ganesha broke his tusk to use as a pen to write the Mahabharata, symbolizing sacrifice for knowledge.',
  },
  {
    question: 'Who started the public celebration of Ganesh Chaturthi?',
    options: ['Mahatma Gandhi', 'Bal Gangadhar Tilak', 'Jawaharlal Nehru', 'Vivekananda'],
    correct: 1,
    explanation: 'Lokmanya Tilak popularized public Ganesh Chaturthi in 1893 to unite people during the freedom movement.',
  },
  {
    question: 'What is the name of Ganesha\'s brother?',
    options: ['Vishnu', 'Kartikeya', 'Hanuman', 'Indra'],
    correct: 1,
    explanation: 'Kartikeya (also known as Murugan or Skanda) is Ganesha\'s brother and the god of war.',
  },
  {
    question: 'What does "Prathama Pujya" mean?',
    options: ['First worshipped', 'Most powerful', 'Eternal lord', 'Supreme being'],
    correct: 0,
    explanation: 'Shiva declared that Ganesha would be Prathama Pujya — the first to be worshipped before all gods.',
  },
  {
    question: 'What material is traditionally used to make eco-friendly Ganesha idols?',
    options: ['Plaster of Paris', 'Natural clay', 'Marble', 'Metal'],
    correct: 1,
    explanation: 'Natural clay (shadu mati) dissolves harmlessly in water, making it the most eco-friendly choice.',
  },
];

export default function VinayakaQuiz() {
  const { gameState, isPaused, addScore, completeGame } = useMiniGame();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(15);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      setQuestionIndex(0);
      setSelected(null);
      setShowResult(false);
      setStreak(0);
      setCorrectCount(0);
      setTimer(15);
      scoreManager.resetCombo();
    }
  }, [gameState]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'PLAYING' || showResult || isPaused) return;

    timerRef.current = window.setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          // Time's up — auto-select wrong
          setShowResult(true);
          setStreak(0);
          scoreManager.breakCombo();
          arcadeAudio.playWrong();
          clearInterval(timerRef.current);
          return 0;
        }
        if (prev <= 4) arcadeAudio.playCountdownTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState, questionIndex, showResult, isPaused]);

  const handleSelect = useCallback((optionIndex: number) => {
    if (showResult || isPaused || selected !== null) return;

    clearInterval(timerRef.current);
    setSelected(optionIndex);
    setShowResult(true);

    const q = QUESTIONS[questionIndex];
    const isCorrect = optionIndex === q.correct;

    if (isCorrect) {
      const streakBonus = streak >= 3 ? streak * 5 : 0;
      addScore(50 + streakBonus + timer * 3);
      setStreak(prev => prev + 1);
      setCorrectCount(prev => prev + 1);
      scoreManager.incrementCombo();
      arcadeAudio.playCorrect();
    } else {
      setStreak(0);
      scoreManager.breakCombo();
      arcadeAudio.playWrong();
    }
  }, [showResult, isPaused, selected, questionIndex, streak, timer, addScore]);

  const handleNext = useCallback(() => {
    if (questionIndex >= QUESTIONS.length - 1) {
      addScore(correctCount * 20); // Completion bonus
      completeGame();
    } else {
      setQuestionIndex(prev => prev + 1);
      setSelected(null);
      setShowResult(false);
      setTimer(15);
    }
  }, [questionIndex, correctCount, addScore, completeGame]);

  // Keyboard shortcuts
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    const handleKey = (e: KeyboardEvent) => {
      if (!showResult) {
        const num = parseInt(e.key);
        if (num >= 1 && num <= 4) handleSelect(num - 1);
      } else {
        if (e.key === 'Enter' || e.key === ' ') handleNext();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, showResult, handleSelect, handleNext]);

  if (gameState !== 'PLAYING') return null;

  const q = QUESTIONS[questionIndex];
  const isCorrect = selected !== null && selected === q.correct;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #1a1008 0%, #2d1a0e 50%, #1a1008 100%)',
      padding: '20px',
    }}>
      {/* Progress & Timer */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '12px',
          color: 'rgba(255,255,255,0.4)',
        }}>
          Question {questionIndex + 1}/{QUESTIONS.length}
          {streak >= 3 && <span style={{ color: '#fbbf24', marginLeft: '8px' }}>🔥 {streak} streak!</span>}
        </div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '16px',
          fontWeight: 700,
          color: timer <= 5 ? '#ef4444' : '#fef08a',
          minWidth: '40px',
          textAlign: 'center',
        }}>
          {timer}s
        </div>
      </div>

      {/* Question */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(254,240,138,0.15)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
      }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(15px, 2.2vw, 18px)',
          color: '#ffffff',
          lineHeight: 1.5,
          textAlign: 'center',
        }}>
          {q.question}
        </div>
      </div>

      {/* Options */}
      <div style={{
        width: '100%',
        maxWidth: '600px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        marginBottom: '16px',
      }}>
        {q.options.map((opt, i) => {
          const isThis = selected === i;
          const isCorrectOption = i === q.correct;
          const bg = showResult
            ? isCorrectOption ? 'rgba(34,197,94,0.2)' : isThis ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)'
            : isThis ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)';
          const borderCol = showResult
            ? isCorrectOption ? '#22c55e' : isThis ? '#ef4444' : 'rgba(255,255,255,0.1)'
            : 'rgba(255,255,255,0.12)';

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                background: bg,
                border: `1.5px solid ${borderCol}`,
                color: '#ffffff',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                textAlign: 'left',
                cursor: showResult ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <span style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.5)',
                flexShrink: 0,
              }}>
                {i + 1}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Explanation (after answering) */}
      {showResult && (
        <div style={{
          width: '100%',
          maxWidth: '600px',
          animation: 'resultSlideIn 0.3s ease',
        }}>
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            marginBottom: '12px',
          }}>
            <div style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '13px',
              color: isCorrect ? '#86efac' : '#fca5a5',
              fontWeight: 700,
              marginBottom: '4px',
            }}>
              {isCorrect ? '✓ Correct!' : selected !== null ? '✗ Not quite' : '⏰ Time\'s up!'}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.4,
            }}>
              {q.explanation}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={handleNext}
              style={{
                padding: '8px 32px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #ca8a04, #fde68aaa)',
                border: '1px solid #fde68a66',
                color: '#000',
                fontFamily: "'Cinzel', serif",
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.15em',
                cursor: 'pointer',
              }}
            >
              {questionIndex >= QUESTIONS.length - 1 ? 'See Results' : 'Next Question →'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes resultSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
