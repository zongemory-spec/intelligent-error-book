import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { AddMistake } from './components/AddMistake';
import { ReviewSession } from './components/ReviewSession';
import { MistakeLibrary } from './components/MistakeLibrary';
import { getMistakes } from './services/storageService';
import type { Mistake } from './types';
import { BookOpen, PlusCircle, LayoutDashboard, RotateCw, Library, Menu } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMistakes(getMistakes());
  }, [refreshTrigger, currentPage]);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col md:flex-row">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 shadow-sm z-10">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-blue-600">
            <BookOpen className="w-8 h-8" />
            <h1 className="text-xl font-bold tracking-tight">智能错题本</h1>
          </div>
          <p className="text-xs text-gray-400 mt-2">Based on Ebbinghaus Curve</p>
        </div>
        
        <nav className="p-4 space-y-2">
          <button onClick={() => handleNavigate('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentPage === 'dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <LayoutDashboard className="w-5 h-5" /> <span>概览 & 统计</span>
          </button>
          <button onClick={() => handleNavigate('add')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentPage === 'add' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <PlusCircle className="w-5 h-5" /> <span>录入错题</span>
          </button>
          <button onClick={() => handleNavigate('library')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentPage === 'library' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Library className="w-5 h-5" /> <span>题库 & 记录</span>
          </button>
          <button onClick={() => handleNavigate('review')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${currentPage === 'review' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
            <RotateCw className="w-5 h-5" /> <span>开始复习</span>
          </button>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
        <span className="font-bold text-lg flex items-center gap-2 text-blue-600"><BookOpen className="w-6 h-6"/> 智能错题本</span>
        <button className="p-2 bg-gray-100 rounded hover:bg-gray-200" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu className="w-6 h-6 text-gray-700" /></button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg z-20 border-t border-gray-100 p-4 space-y-2 animate-slide-down">
           <button onClick={() => handleNavigate('dashboard')} className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 text-left"><LayoutDashboard className="w-5 h-5 mr-3 text-gray-500"/>概览</button>
           <button onClick={() => handleNavigate('add')} className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 text-left"><PlusCircle className="w-5 h-5 mr-3 text-gray-500"/>录入</button>
           <button onClick={() => handleNavigate('library')} className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 text-left"><Library className="w-5 h-5 mr-3 text-gray-500"/>题库</button>
           <button onClick={() => handleNavigate('review')} className="w-full flex items-center p-3 rounded-lg hover:bg-gray-50 text-left"><RotateCw className="w-5 h-5 mr-3 text-gray-500"/>复习</button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-12 max-w-7xl mx-auto w-full">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            {currentPage === 'dashboard' && '学习概览'}
            {currentPage === 'add' && '错题录入'}
            {currentPage === 'library' && '错题题库 & 记录'}
            {currentPage === 'review' && '智能复习'}
          </h2>
        </header>

        {currentPage === 'dashboard' && <Dashboard mistakes={mistakes} onNavigate={setCurrentPage} />}
        {currentPage === 'add' && <AddMistake onSuccess={() => { refreshData(); setCurrentPage('dashboard'); }} />}
        {currentPage === 'library' && <MistakeLibrary />}
        {currentPage === 'review' && <ReviewSession onFinish={() => { refreshData(); setCurrentPage('dashboard'); }} />}
      </main>
    </div>
  );
}