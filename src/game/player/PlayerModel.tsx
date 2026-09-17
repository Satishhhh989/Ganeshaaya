import { ChildCharacter, AdultCharacter } from '../characters/ProceduralCharacters';
import { useGameState } from '../core/GameState';

interface PlayerModelProps {
  speed: number;
  isRunning: boolean;
  isSitting?: boolean;
  isWorking?: boolean;
}

export function PlayerModel({
  speed,
  isRunning,
  isSitting = false,
  isWorking = false,
}: PlayerModelProps) {
  const { isAdultProtagonist, isWorkingAtDesk } = useGameState();

  if (isAdultProtagonist) {
    return (
      <AdultCharacter
        speed={speed}
        isRunning={isRunning}
        isSitting={isWorkingAtDesk}
        isWorking={isWorking || isWorkingAtDesk}
      />
    );
  }

  return (
    <ChildCharacter speed={speed} isRunning={isRunning} isSitting={isSitting} />
  );
}

