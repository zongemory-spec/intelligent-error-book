// Deterministic examples only. No model API, key, OCR or network request.
import { Subject } from '../types';

export const DEMO_EXAMPLES = [
  {
    id: 'linear-equation', label: '数学 · 一元一次方程', subject: Subject.MATH,
    title: '一元一次方程', question: '解方程：3x + 5 = 20。',
    answer: '【预设演示解析】\n1. 两边同时减去 5：3x = 15。\n2. 两边同时除以 3：x = 5。\n3. 代回检查：3 × 5 + 5 = 20。\n易错点：移项时忘记改变符号。',
  },
  {
    id: 'present-simple', label: '英语 · 一般现在时', subject: Subject.ENGLISH,
    title: '一般现在时', question: '填空：She ___ (go) to school every day.',
    answer: '【预设演示解析】\n答案：goes。\n主语 She 是第三人称单数，every day 表示经常发生的动作，因此用一般现在时，go 变为 goes。',
  },
] as const;

const normalize = (text: string) => text.trim().replace(/\s+/g, ' ');
const findExample = (question: string) => DEMO_EXAMPLES.find(item => normalize(item.question) === normalize(question));

export function getDemoTitle(question: string): string {
  const example = findExample(question);
  if (!example) throw new Error('当前演示只提供内置样例的知识点，请手动填写自定义题目的知识点。');
  return example.title;
}

export function getDemoAnswer(question: string): string {
  const example = findExample(question);
  if (!example) throw new Error('当前演示只提供内置样例的解析，请手动填写自定义题目的答案。');
  return example.answer;
}
