import { EBBINGHAUS_INTERVALS } from '../types';
import type { Mistake, ReviewLog } from '../types';

const STORAGE_KEY = 'smart_error_book_data';
const HISTORY_KEY = 'smart_error_book_history';

export const getMistakes = (): Mistake[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveMistake = (mistake: Mistake): void => {
  const mistakes = getMistakes();
  mistakes.push(mistake);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
};

export const deleteMistake = (id: string): void => {
  const mistakes = getMistakes().filter(m => m.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));
};

export const getReviewLogs = (): ReviewLog[] => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

const saveReviewLog = (log: ReviewLog): void => {
  const logs = getReviewLogs();
  if (logs.length > 1000) logs.pop();
  logs.unshift(log);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(logs));
};

export const updateMistakeReview = (id: string, remembered: boolean): void => {
  const mistakes = getMistakes();
  const index = mistakes.findIndex(m => m.id === id);
  
  if (index !== -1) {
    const mistake = mistakes[index];
    const now = Date.now();
    
    if (remembered) {
      mistake.stage = Math.min(mistake.stage + 1, EBBINGHAUS_INTERVALS.length - 1);
    } else {
      mistake.stage = 0;
    }
    
    mistake.reviewCount += 1;
    mistake.nextReviewAt = now + EBBINGHAUS_INTERVALS[mistake.stage];
    
    mistakes[index] = mistake;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mistakes));

    const log: ReviewLog = {
      id: now.toString() + Math.random().toString(36).substr(2, 9),
      mistakeId: mistake.id,
      mistakeTitle: mistake.title,
      reviewedAt: now,
      result: remembered ? 'remembered' : 'forgotten',
      stageAfter: mistake.stage
    };
    saveReviewLog(log);
  }
};

export const getDueMistakes = (): Mistake[] => {
  const now = Date.now();
  return getMistakes().filter(m => m.nextReviewAt <= now);
};