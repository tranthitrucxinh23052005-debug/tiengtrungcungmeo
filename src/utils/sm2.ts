import type { SM2Result } from '../types';

export function calculateSM2(
  quality: number,
  repetitions: number,
  easinessFactor: number,
  interval: number
): SM2Result {
  let newRepetitions = repetitions;
  let newEasinessFactor = easinessFactor;
  let newInterval = interval;

  if (quality >= 3) {
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 3;
    } else {
      newInterval = Math.round(interval * easinessFactor);
    }
    newRepetitions += 1;
  } else {
    newRepetitions = 0;
    newInterval = 1;
  }

  newEasinessFactor = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easinessFactor: newEasinessFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewDate,
  };
}

export function getQualityFromUserResponse(remembered: boolean): number {
  return remembered ? 4 : 0;
}
