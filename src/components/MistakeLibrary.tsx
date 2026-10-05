import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import type { Mistake, ReviewLog } from '../types';
import { getMistakes, deleteMistake, getReviewLogs } from '../services/storageService';
import { Search, X, Calendar, Brain, Trash2, History, CheckCircle2, XCircle, List, Clock } from 'lucide-react';

export const MistakeLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'library' | 'logs'>('library');
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [logs, setLogs] = useState<ReviewLog[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMistake, setSelectedMistake] = useState<Mistake | null>(null);

  // 每次切换标签页时，强制重新读取数据
  useEffect(() => {
    setMistakes(getMistakes());
    const currentLogs = getReviewLogs();
    // 按时间倒序排列（最新的在最前）
    setLogs(currentLogs.sort((a, b) => b.reviewedAt - a.reviewedAt));
  }, [activeTab]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这道错题吗？删除后无法恢复。')) {
      deleteMistake(id);
      setMistakes(getMistakes());
      if (selectedMistake?.id === id) setSelectedMistake(null);
    }
  };

  const filteredMistakes = mistakes.filter(m => {
    const matchSubject = selectedSubject === '全部' || m.subject === selectedSubject;
    const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        m.questionText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchSearch;
  });

  const formatDate = (ts: number) => {
    try {
      return new Date(ts).toLocaleString('zh-CN', {
        month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return '时间未知';
    }
  };

  // 筛选当前选中错题的专属日志
  const selectedMistakeLogs = selectedMistake 
    ? logs.filter(l => l.mistakeId === selectedMistake.id)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tab Switcher */}
      <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
            activeTab === 'library' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <List className="w-4 h-4 mr-2" />
          错题题库
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
            activeTab === 'logs' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History className="w-4 h-4 mr-2" />
          复习日志
        </button>
      </div>

      {activeTab === 'library' ? (
        <>
          {/* Header & Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索知识点或题目..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <button
                  onClick={() => setSelectedSubject('全部')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedSubject === '全部' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {Object.values(Subject).map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedSubject === sub ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMistakes.length > 0 ? (
              filteredMistakes.map(mistake => (
                <div 
                  key={mistake.id}
                  onClick={() => setSelectedMistake(mistake)}
                  className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full"
                >
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded font-medium">
                        {mistake.subject}
                      </span>
                      <span className="text-xs text-gray-400">
                        Lv.{mistake.stage}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{mistake.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 font-mono">{mistake.questionText}</p>
                    
                    {mistake.imageUrl && (
                      <div className="h-24 bg-gray-50 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                        <img src={mistake.imageUrl} className="h-full object-cover opacity-80" alt="thumbnail" />
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-xl">
                    <div className="text-xs text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1"/> {new Date(mistake.createdAt).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={(e) => handleDelete(mistake.id, e)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>没有找到相关错题</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Review Logs Tab */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             {logs.length === 0 ? (
               <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                 <Clock className="w-12 h-12 mb-4 opacity-50 text-gray-300" />
                 <p className="font-medium text-gray-600">暂无复习记录</p>
                 <p className="text-sm mt-1">去“开始复习”页面完成一次复习后，记录会显示在这里。</p>
               </div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-gray-50 text-gray-600 text-sm">
                       <th className="px-6 py-4 font-medium">复习时间</th>
                       <th className="px-6 py-4 font-medium">题目</th>
                       <th className="px-6 py-4 font-medium">结果</th>
                       <th className="px-6 py-4 font-medium">阶段变化</th>
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
                           <span className="bg-gray-100 px-2 py-1 rounded">Lv.{log.stageAfter}</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedMistake && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center z-10">
              <div>
                 <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedMistake.subject}</span>
                 <h2 className="text-xl font-bold text-gray-900">{selectedMistake.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedMistake(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Question Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase">题目内容</h3>
                <div className="bg-gray-50 p-4 rounded-lg text-gray-800 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {selectedMistake.questionText}
                </div>
                {selectedMistake.imageUrl && (
                  <div className="mt-4">
                    <img src={selectedMistake.imageUrl} alt="Original" className="max-w-full rounded-lg border border-gray-200" />
                  </div>
                )}
              </div>

              {/* Answer Section */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase">答案与解析</h3>
                <div className="bg-blue-50 p-4 rounded-lg text-blue-900 whitespace-pre-wrap border border-blue-100 font-mono text-sm leading-relaxed">
                  {selectedMistake.answerText || "暂无解析"}
                </div>
              </div>

              {/* Stats & History Section for this Item */}
              <div className="border-t border-gray-100 pt-6">
                 <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase flex items-center">
                    <History className="w-4 h-4 mr-2"/> 复习历史
                 </h3>
                 {selectedMistakeLogs.length > 0 ? (
                    <div className="relative pl-4 border-l-2 border-gray-100 space-y-4">
                        {selectedMistakeLogs.map(log => (
                            <div key={log.id} className="relative">
                                <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 bg-white ${log.result === 'remembered' ? 'border-green-500' : 'border-red-500'}`}></div>
                                <div className="text-sm">
                                    <span className="font-medium text-gray-800">{formatDate(log.reviewedAt)}</span>
                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${log.result === 'remembered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {log.result === 'remembered' ? '记住了' : '忘记了'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <p className="text-sm text-gray-400">该题尚未进行过复习。</p>
                 )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <div className="text-xs text-gray-500">
                  当前阶段: <span className="font-bold text-blue-600">Lv.{selectedMistake.stage}</span>
              </div>
              <button
                onClick={() => setSelectedMistake(null)}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};