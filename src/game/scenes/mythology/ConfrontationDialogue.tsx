import { useState } from 'react';
import { CinematicDialogue } from '../../ui/components/CinematicDialogue';

interface ConfrontationLine {
  id: string;
  speaker: 'Shiva' | 'Ganesha';
  text: string;
}

const CONFRONTATION_LINES: ConfrontationLine[] = [
  {
    id: 'conf_1',
    speaker: 'Shiva',
    text: 'Stand aside, young guardian. I must enter my sacred sanctuary.',
  },
  {
    id: 'conf_2',
    speaker: 'Ganesha',
    text: 'My Mother has commanded that none may enter while she bathes. I cannot break my vow.',
  },
  {
    id: 'conf_3',
    speaker: 'Shiva',
    text: 'I am Shiva, Lord of Mount Kailash. This mountain is my eternal home.',
  },
  {
    id: 'conf_4',
    speaker: 'Ganesha',
    text: 'Whoever you may be, my Mother’s honor and decree are absolute. You shall not pass!',
  },
];

interface ConfrontationDialogueProps {
  onComplete: () => void;
}

export function ConfrontationDialogue({ onComplete }: ConfrontationDialogueProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const currentLine = CONFRONTATION_LINES[lineIndex];
  const isLastLine = lineIndex + 1 === CONFRONTATION_LINES.length;

  const handleNext = () => {
    if (lineIndex + 1 < CONFRONTATION_LINES.length) {
      setLineIndex(lineIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <CinematicDialogue
      speaker={currentLine.speaker === 'Shiva' ? 'LORD SHIVA' : 'BAL GANESHA'}
      text={currentLine.text}
      onNext={handleNext}
      isLastLine={isLastLine}
      visible={true}
    />
  );
}
