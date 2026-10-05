import React from 'react';
import type { Mistake } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface DashboardProps {
  mistakes: Mistake[];
  onNavigate: (page: string) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ mistakes, onNavigate }) => {
  const dueCount = mistakes.filter(m => m.nextReviewAt <= Date.now()).length;
  
  const subjectData = Object.values(mistakes.reduce((acc, curr) => {
    if (!acc[curr.subject]) acc[curr.subject] = { name: curr.subject, value: 0 };
    acc[curr.subject].value += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number }>));

  const stageData = mistakes.reduce((acc, curr) => {
    const stageGroup = curr.stage < 3 ? '熟悉期' : (curr.stage < 6 ? '巩固期' : '永久记忆');
    const found = acc.find(i => i.name === stageGroup);
    if (found) found.value += 1;
    else acc.push({ name: stageGroup, value: 1 });
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">错题总数</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{mistakes.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">今日待复习</h3>
            <p className={`text-3xl font-bold mt-2 ${dueCount > 0 ? 'text-red-500' : 'text-gray-800'}`}>{dueCount}</p>
          </div>
          {dueCount > 0 ? (
             <button onClick={() => onNavigate('review')} className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all shadow-md animate-pulse-border">
               开始复习 &rarr;
             </button>
          ) : (
            <p className="text-xs text-green-600 mt-4 font-medium">任务已清空！</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium">累计复习次数</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {mistakes.reduce((acc, m) => acc + m.reviewCount, 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">学科分布</h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={subjectData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {subjectData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-full flex items-center justify-center text-gray-400">暂无数据</div>}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-lg font-bold text-gray-800 mb-4">记忆阶段分布</h3>
          {stageData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-full flex items-center justify-center text-gray-400">暂无数据</div>}
        </div>
      </div>
    </div>
  );
};
