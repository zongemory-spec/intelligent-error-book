export interface Mistake {
  id: string;
  title: string;
  imageUrl?: string;
  questionText: string;
  answerText: string;
  subject: string;
  createdAt: number;
  nextReviewAt: number;
  stage: number; // 0-7 对应不同的复习阶段
  reviewCount: number;
}

export interface ReviewLog {
  id: string;
  mistakeId: string;
  mistakeTitle: string;
  reviewedAt: number;
  result: 'remembered' | 'forgotten';
  stageAfter: number;
}

// 修改处：将 enum 改为 const 对象，修复 "erasableSyntaxOnly" 报错
export const Subject = {
  MATH: '数学',
  ENGLISH: '英语',
  PHYSICS: '物理',
  CHEMISTRY: '化学',
  CS: '计算机',
  OTHER: '其他'
} as const;

// 导出 Subject 类型，这样其他文件用 Subject 作为类型时不会报错
export type Subject = typeof Subject[keyof typeof Subject];

// 艾宾浩斯遗忘曲线间隔
export const EBBINGHAUS_INTERVALS = [
  5 * 60 * 1000,        // 0: 5分钟
  30 * 60 * 1000,       // 1: 30分钟
  12 * 60 * 60 * 1000,  // 2: 12小时
  24 * 60 * 60 * 1000,  // 3: 1天
  2 * 24 * 60 * 60 * 1000, // 4: 2天
  4 * 24 * 60 * 60 * 1000, // 5: 4天
  7 * 24 * 60 * 60 * 1000, // 6: 7天
  15 * 24 * 60 * 60 * 1000 // 7: 15天
];