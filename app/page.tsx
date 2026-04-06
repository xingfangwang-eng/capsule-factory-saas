import React, { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentCompleted, setIsPaymentCompleted] = useState(false);
  const [downloadLink, setDownloadLink] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // 模拟分析过程
    setTimeout(() => {
      setAnalysisResult('Style DNA analysis completed. Found 15 key patterns in the writing style.');
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    // 模拟处理过程
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaymentCompleted(true);
    }, 3000);
  };

  const handlePayment = () => {
    // 模拟支付过程
    setTimeout(() => {
      setDownloadLink('https://example.com/download/capsule.zip');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 头部 */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Capsule Factory</h1>
          <p className="text-xl text-slate-500">AI-powered style cloning for content creators</p>
        </header>

        {/* 主要内容 */}
        <main className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          {/* 文件上传区域 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Upload Content</h2>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
              <input 
                type="file" 
                className="hidden" 
                id="file-upload" 
                onChange={handleFileChange}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-slate-600 mb-2">Drag and drop your files here, or click to browse</p>
                <p className="text-sm text-slate-400">Supports .txt, .md, .docx files</p>
              </label>
              {file && (
                <div className="mt-4 p-2 bg-slate-50 rounded-lg">
                  <p className="text-slate-700">{file.name}</p>
                </div>
              )}
            </div>
          </section>

          {/* 文本输入区域 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Or Enter Text</h2>
            <textarea 
              className="w-full p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={6}
              placeholder="Paste your text here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            ></textarea>
          </section>

          {/* 分析按钮 */}
          <section className="mb-8">
            <button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Style DNA'}
            </button>
          </section>

          {/* 分析结果 */}
          {analysisResult && (
            <section className="mb-8 p-4 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Analysis Result</h3>
              <p className="text-slate-700">{analysisResult}</p>
            </section>
          )}

          {/* 处理按钮 */}
          <section className="mb-8">
            <button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              onClick={handleProcess}
              disabled={isProcessing || !analysisResult}
            >
              {isProcessing ? 'Processing...' : 'Generate Style Capsule'}
            </button>
          </section>

          {/* 支付部分 */}
          {isPaymentCompleted && (
            <section className="mb-8 p-6 bg-slate-50 rounded-lg">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Complete Your Order</h3>
              <div className="mb-4">
                <p className="text-slate-700 mb-2">Price: $29.99</p>
                <p className="text-slate-500 text-sm">Includes style capsule generation and 3 months of updates</p>
              </div>
              <button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                onClick={handlePayment}
              >
                Pay with PayPal
              </button>
            </section>
          )}

          {/* 下载部分 */}
          {downloadLink && (
            <section className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-lg font-medium text-green-800 mb-4">Your Style Capsule is Ready!</h3>
              <a 
                href={downloadLink} 
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center"
                download
              >
                Download Style Capsule
              </a>
              <p className="mt-4 text-sm text-green-700">
                A download link has also been sent to your email.
              </p>
            </section>
          )}
        </main>

        {/* 页脚 */}
        <footer className="text-center text-slate-500 text-sm">
          <p>© 2026 Capsule Factory. All rights reserved.</p>
          <p className="mt-2">Support: 457239850@qq.com</p>
        </footer>
      </div>
    </div>
  );
}