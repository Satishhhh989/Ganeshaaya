import type { DialogueSequence } from '../core/types';

export const OPENING_DIALOGUE: DialogueSequence = {
  id: 'dada_intro_conversation',
  title: 'A Question to Dada',
  lines: [
    {
      id: 'line_1',
      speaker: 'Child',
      text: 'Dada, ek baat poochun?',
      cameraFocus: 'two_shot',
      cameraEvent: 'two_shot',
      animation: 'curious',
      audioCue: 'child_curious',
      audioFile: undefined, // Assign external audio path here, e.g. '/assets/audio/voice/line_1.mp3'
    },
    {
      id: 'line_2',
      speaker: 'Old Man',
      text: 'Haan beta, pooch.',
      cameraFocus: 'two_shot',
      cameraEvent: 'old_man_close',
      animation: 'talk',
      audioCue: 'dada_warm',
      audioFile: undefined,
    },
    {
      id: 'line_3',
      speaker: 'Child',
      text: 'Hum Ganesh Chaturthi kyun manate hain?',
      cameraFocus: 'two_shot',
      cameraEvent: 'child_close',
      animation: 'curious',
      audioCue: 'child_curious',
      audioFile: undefined,
    },
    {
      id: 'line_4',
      speaker: 'Old Man',
      text: 'Uski kahani bahut purani hai. Sunega?',
      cameraFocus: 'two_shot',
      cameraEvent: 'old_man_close',
      animation: 'talk',
      audioCue: 'dada_warm',
      audioFile: undefined,
    },
    {
      id: 'line_5',
      speaker: 'Child',
      text: 'Haan!',
      cameraFocus: 'two_shot',
      cameraEvent: 'two_shot',
      animation: 'nod',
      audioCue: 'child_excited',
      audioFile: undefined,
    },
  ],
};

export const STORY_MODE_DIALOGUE: DialogueSequence = {
  id: 'story_mode_introduction',
  title: 'The Legend of Ganesha Begins',
  lines: [
    {
      id: 'story_line_1',
      speaker: 'Old Man',
      text: 'Toh suno beta, yeh pavitra katha shuru hoti hai pavitra Kailash parvat se...',
      cameraFocus: 'two_shot',
      cameraEvent: 'story_mode',
      animation: 'talk',
      audioCue: 'dada_warm',
      audioFile: undefined,
    },
    {
      id: 'story_line_2',
      speaker: 'Child',
      text: 'Kailash parvat? Jahan Bhagwan Shiva aur Mata Parvati rehte the?',
      cameraFocus: 'child',
      cameraEvent: 'child_close',
      animation: 'curious',
      audioCue: 'child_curious',
      audioFile: undefined,
    },
    {
      id: 'story_line_3',
      speaker: 'Old Man',
      text: 'Haan beta. Ek din jab Mahadev dhyan mein the, tab Mata Parvati ne ek adbhut baalak ki rachna ki...',
      cameraFocus: 'two_shot',
      cameraEvent: 'story_mode',
      animation: 'talk',
      audioCue: 'dada_warm',
      audioFile: undefined,
    },
  ],
};

