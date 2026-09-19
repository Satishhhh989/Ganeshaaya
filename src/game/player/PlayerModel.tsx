import { ChildCharacter, AdultCharacter } from '../characters/ProceduralCharacters';
import { useGameState } from '../core/GameState';

interface PlayerModelProps {
  speed: number;
  isRunning: boolean;
  isSitting?: boolean;
  isWorking?: boolean;
  isTalking?: boolean;
  isPraying?: boolean;
  isCarrying?: boolean;
  isInteracting?: boolean;
}

export function PlayerModel({
  speed,
  isRunning,
  isSitting = false,
  isWorking = false,
  isTalking = false,
  isPraying = false,
  isCarrying = false,
  isInteracting = false,
}: PlayerModelProps) {
  const { protagonistAge, isAdultProtagonist, isWorkingAtDesk, presentScenePhase } = useGameState();

  // ─── During Time Passage transition: remove/despawn the child protagonist cleanly ───
  if (presentScenePhase === 'TIME_PASSAGE') {
    return null;
  }

  // ─── Authoritative age check: Once adult, ONLY render AdultCharacter ───
  const isAdult = protagonistAge === 'adult' || isAdultProtagonist;

  if (isAdult) {
    return (
      <AdultCharacter
        speed={speed}
        isRunning={isRunning}
        isSitting={isWorkingAtDesk || isSitting}
        isWorking={isWorking || isWorkingAtDesk}
        isTalking={isTalking}
        isPraying={isPraying}
        isCarrying={isCarrying}
        isInteracting={isInteracting}
      />
    );
  }

  // ─── Before Year Passage: Only render ChildCharacter ───
  return (
    <ChildCharacter
      speed={speed}
      isRunning={isRunning}
      isSitting={isSitting}
      isTalking={isTalking}
      isPraying={isPraying}
    />
  );
}
