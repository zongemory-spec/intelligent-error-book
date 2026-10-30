import React, { useState, useRef } from 'react';
import { Subject } from '../types';
import type { Mistake } from '../types';
import { saveMistake } from '../services/storageService';
import { DEMO_EXAMPLES, getDemoTitle, getDemoAnswer } from '../services/aiService';
import { Camera, CheckCircle, Sparkles, Wand2 } from 'lucide-react';

interface AddMistakeProps { onSuccess: () => void; }

export const AddMistake: React.FC<AddMistakeProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>(Subject.MATH);
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const loadExample = (index: number) => {
    const item = DEMO_EXAMPLES[index];
    setSubject(item.subject); setQuestionText(item.question);
    setTitle(''); setAnswerText(''); setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setNotice('已载入演示题目，可点击“示例知识点”和“示例解析”；这些内容不是实时 AI 生成。');
  };

  const handleDemo = (kind: 'title' | 'answer') => {
    try {
      if (kind === 'title') setTitle(getDemoTitle(questionText));
      else setAnswerText(getDemoAnswer(questionText));
      setNotice('已填入预设演示内容，请核对后保存。');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : '请手动填写内容。');
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !questionText.trim()) return;
    const now = Date.now();
    const newMistake: Mistake = {
      id: `${now}-${Math.random().toString(36).slice(2, 11)}`,
      title: title.trim(), subject, imageUrl: imagePreview || undefined,
      questionText: questionText.trim(), answerText,
      createdAt: now, stage: 0, reviewCount: 0, nextReviewAt: now,
    };
    try { saveMistake(newMistake); onSuccess(); }
    catch { setNotice('保存失败，浏览器存储可能不可用或已满，请缩小图片或检查浏览器设置后重试。'); }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">录入新错题</h2>
      <section className="rounded-lg bg-blue-50 border border-blue-100 p-4 mb-6" aria-label="内置演示题目">
        <p className="text-sm text-blue-900 mb-3">无 Key 演示：预设解析仅用于体验流程，自定义题目请手动填写。</p>
        <div className="flex flex-wrap gap-2">{DEMO_EXAMPLES.map((item, index) => (
          <button key={item.id} type="button" onClick={() => loadExample(index)} className="px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100">{item.label}</button>
        ))}</div>
      </section>
      {notice && <p role="status" className="text-sm text-amber-900 bg-amber-50 border border-amber-100 p-3 rounded-lg mb-4">{notice}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center hover:border-blue-500 bg-gray-50">
            {imagePreview ? <img src={imagePreview} alt="本地题目预览" className="h-48 object-contain" /> : <><Camera className="w-8 h-8 text-gray-400 mb-2"/><span className="text-gray-500">点击上传图片</span></>}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
          <p className="text-xs text-gray-500 mt-2">图片仅用于本地预览与保存，本演示未接入 OCR，不会上传至模型服务。</p>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">学科</label>
          <select id="subject" value={subject} onChange={event => setSubject(event.target.value as Subject)} className="w-full px-4 py-2 border rounded-lg mb-2">{Object.values(Subject).map(item => <option key={item} value={item}>{item}</option>)}</select>
          <label htmlFor="question" className="block text-sm font-medium mb-1">题目内容</label>
          <textarea id="question" required rows={4} value={questionText} onChange={event => setQuestionText(event.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="题目内容..."/>
        </div>
        <div>
          <div className="flex justify-between mb-1"><label htmlFor="knowledge" className="text-sm font-medium">知识点</label>
            <button type="button" disabled={!questionText.trim()} onClick={() => handleDemo('title')} className="text-xs text-amber-700 flex items-center disabled:opacity-40"><Wand2 className="w-3 h-3 mr-1"/>示例知识点</button>
          </div>
          <input id="knowledge" type="text" required value={title} onChange={event => setTitle(event.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="例如：导数"/>
        </div>
        <div>
          <div className="flex justify-between mb-1"><label htmlFor="answer" className="text-sm font-medium">解析</label>
            <button type="button" disabled={!questionText.trim()} onClick={() => handleDemo('answer')} className="text-xs text-purple-700 flex items-center disabled:opacity-40"><Sparkles className="w-3 h-3 mr-1"/>示例解析</button>
          </div>
          <textarea id="answer" rows={6} value={answerText} onChange={event => setAnswerText(event.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="答案解析..."/>
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onSuccess} className="px-6 py-2 border rounded-lg hover:bg-gray-50">取消</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700"><CheckCircle className="w-4 h-4 mr-2"/>保存</button>
        </div>
      </form>
    </div>
  );
};
