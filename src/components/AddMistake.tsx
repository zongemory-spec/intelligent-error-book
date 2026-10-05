import React, { useState, useRef } from 'react';
import { Subject } from '../types';
import type { Mistake } from '../types';
import { saveMistake } from '../services/storageService';
import { callTongyiAI } from '../services/aiService'; // 引入通义千问服务
import { Loader2, Camera, CheckCircle, Sparkles, ScanText, Wand2 } from 'lucide-react';

interface AddMistakeProps {
  onSuccess: () => void;
}

export const AddMistake: React.FC<AddMistakeProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>(Subject.MATH);
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isOCRProcessing, setIsOCRProcessing] = useState(false);
  const [isTitleProcessing, setIsTitleProcessing] = useState(false);
  const [isAnswerProcessing, setIsAnswerProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAIError = (error: any, action: string) => {
    console.error(`${action} Failed:`, error);
    let message = `${action}失败：${error.message}`;
    if (!process.env.DASHSCOPE_API_KEY) {
      message = `未配置 DASHSCOPE_API_KEY，请在 .env 文件中添加。`;
    }
    alert(message);
  };

  // 1. OCR 识别
  const handleOCR = async () => {
    if (!imagePreview) return;
    setIsOCRProcessing(true);
    try {
      const base64Data = imagePreview.split(',')[1];
      const text = await callTongyiAI({
        prompt: "请识别这张图片中的题目内容。直接输出文本，不要包含多余的描述。如果包含数学公式，请尽量保持格式完整。",
        imageBase64: base64Data
      });
      setQuestionText(text);
    } catch (error) { 
      handleAIError(error, "识别"); 
    } finally { 
      setIsOCRProcessing(false); 
    }
  };

  // 2. 自动生成标题
  const handleAutoTitle = async () => {
    if (!questionText) { alert("请先输入题目"); return; }
    setIsTitleProcessing(true);
    try {
      const text = await callTongyiAI({
        prompt: `提取以下题目的核心考点或知识点。要求：10字以内，不含前缀，直接输出名称。\n\n题目：${questionText}`
      });
      setTitle(text.trim());
    } catch (error) { 
      handleAIError(error, "提取"); 
    } finally { 
      setIsTitleProcessing(false); 
    }
  };

  // 3. 智能解析
  const handleSmartAnswer = async () => {
      if(!questionText) return;
      setIsAnswerProcessing(true);
      try {
        const text = await callTongyiAI({
          prompt: `请做一名${subject}老师，为以下题目提供详细的解答步骤和解析。\n\n题目：${questionText}`,
          systemPrompt: "你是一个智能助教，请直接给出答案和解析，格式清晰，不要过多的客套话。"
        });
        setAnswerText(text);
      } catch (error) { 
        handleAIError(error, "解析"); 
      } finally { 
        setIsAnswerProcessing(false); 
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !questionText) return;

    const newMistake: Mistake = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title, subject, imageUrl: imagePreview || undefined,
      questionText, answerText,
      createdAt: Date.now(), stage: 0, reviewCount: 0, nextReviewAt: Date.now() 
    };
    saveMistake(newMistake);
    onSuccess();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">录入新错题</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50 group" onClick={() => fileInputRef.current?.click()}>
          {imagePreview ? <img src={imagePreview} className="h-48 object-contain" /> : <><Camera className="w-8 h-8 text-gray-400 mb-2 group-hover:scale-110 transition-transform" /><p className="text-gray-500">点击上传图片</p></>}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
        </div>

        <div>
          <div className="flex justify-between mb-1"><label className="text-sm font-medium">题目内容</label>
           {imagePreview && <button type="button" onClick={handleOCR} disabled={isOCRProcessing} className="text-xs text-blue-600 flex items-center hover:text-blue-800"><ScanText className="w-3 h-3 mr-1"/>{isOCRProcessing?'通义识别中...':'AI 识别'}</button>}
          </div>
          <select value={subject} onChange={(e) => setSubject(e.target.value as Subject)} className="w-full px-4 py-2 border rounded-lg mb-2">{Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}</select>
          <textarea required rows={4} value={questionText} onChange={(e) => setQuestionText(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="题目内容..." />
        </div>

        <div>
           <div className="flex justify-between mb-1"><label className="text-sm font-medium">知识点</label>
            <button type="button" onClick={handleAutoTitle} disabled={!questionText || isTitleProcessing} className="text-xs text-amber-600 flex items-center hover:text-amber-800"><Wand2 className="w-3 h-3 mr-1"/>{isTitleProcessing?'通义提取中...':'AI 提取'}</button>
           </div>
           <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="例如：导数" />
        </div>

        <div>
            <div className="flex justify-between mb-1"><label className="text-sm font-medium">解析</label>
             <button type="button" onClick={handleSmartAnswer} disabled={!questionText || isAnswerProcessing} className="text-xs text-purple-600 flex items-center hover:text-purple-800"><Sparkles className="w-3 h-3 mr-1"/>{isAnswerProcessing?'通义生成中...':'AI 解析'}</button>
            </div>
          <textarea rows={4} value={answerText} onChange={(e) => setAnswerText(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="答案解析..." />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onSuccess} className="px-6 py-2 border rounded-lg hover:bg-gray-50">取消</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700 shadow-lg"><CheckCircle className="w-4 h-4 mr-2" /> 保存</button>
        </div>
      </form>
    </div>
  );
};