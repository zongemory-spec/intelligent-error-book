import React, { useState, useEffect } from 'react';
import type { Mistake } from '../types';
import { getDueMistakes, updateMistakeReview } from '../services/storageService';
import { Eye, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';

interface ReviewSessionProps {
  onFinish: () => void;
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({ onFinish }) => {
  const [queue, setQueue] = useState<Mistake[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const due = getDueMistakes();
    setQueue(due);
    if (due.length === 0) setIsFinished(true);
  }, []);

  const handleReview = (remembered: boolean) => {
    updateMistakeReview(queue[currentIndex].id, remembered);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center animate-fade-in">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">复习完成!</h2>
        <button onClick={onFinish} className="px-8 py-3 bg-blue-600 text-white rounded-full mt-6 shadow-lg hover:bg-blue-700">返回主页</button>
      </div>
    );
  }

  const currentMistake = queue[currentIndex];
  if (!currentMistake) return <div className="text-center p-12">加载中...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between text-sm text-gray-500">
        <span>进度: {currentIndex + 1} / {queue.length}</span>
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Lv.{currentMistake.stage}</span>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex-1">
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-bold mb-2 inline-block">{currentMistake.subject}</span>
          <h3 className="text-xl font-bold text-gray-800 mb-4">{currentMistake.title}</h3>
          <div className="prose text-gray-700 whitespace-pre-wrap mb-6">{currentMistake.questionText}</div>
          {currentMistake.imageUrl && <img src={currentMistake.imageUrl} className="max-h-64 mx-auto object-contain rounded border bg-gray-50" />}
        </div>

        {showAnswer && (
          <div className="p-8 bg-blue-50 border-t border-gray-100 animate-slide-down">
            <h4 className="font-bold text-blue-900 mb-2">解析：</h4>
            <div className="prose text-blue-800 whitespace-pre-wrap">{currentMistake.answerText || "暂无解析"}</div>
          </div>
        )}

        <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-center space-x-4">
          {!showAnswer ? (
            <button onClick={() => setShowAnswer(true)} className="flex items-center px-8 py-3 bg-white border border-blue-200 text-blue-600 rounded-full font-medium shadow-sm hover:bg-blue-50"><Eye className="w-5 h-5 mr-2" /> 查看答案</button>
          ) : (
            <>
              <button onClick={() => handleReview(false)} className="flex items-center px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><ThumbsDown className="w-5 h-5 mr-2" /> 忘记了</button>
              <button onClick={() => handleReview(true)} className="flex items-center px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><ThumbsUp className="w-5 h-5 mr-2" /> 记住了</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};