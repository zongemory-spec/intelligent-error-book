import React, { useEffect, useState } from 'react';
import { ReviewLog } from '../types';
import { getReviewLogs } from '../services/storageService';
import { CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';

export const HistoryLog: React.FC = () => {
  const [logs, setLogs] = useState<ReviewLog[]>([]);

  useEffect(() => {
    setLogs(getReviewLogs());
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800">复习动态</h3>
          <span className="text-sm text-gray-500">最近 {logs.length} 条记录</span>
        </div>

        {logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无复习记录，快去“开始复习”吧！</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="px-6 py-4 font-medium">复习时间</th>
                  <th className="px-6 py-4 font-medium">题目</th>
                  <th className="px-6 py-4 font-medium">结果</th>
                  <th className="px-6 py-4 font-medium">当前阶段</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(log.reviewedAt)}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {log.mistakeTitle}
                    </td>
                    <td className="px-6 py-4">
                      {log.result === 'remembered' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          记住了
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          忘记了
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Lv.{log.stageAfter}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};