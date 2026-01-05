
import React, { useState, useRef } from 'react';
import { PhotoState, ViewMode } from './types';
import { editImageWithAI } from './services/geminiService';
import A4Sheet from './components/A4Sheet';
import PassportPhoto from './components/PassportPhoto';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [photoState, setPhotoState] = useState<PhotoState>({
    originalUrl: null,
    editedUrl: null,
    isProcessing: false
  });
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.EDITOR);
  const [spacing, setSpacing] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoState({
          originalUrl: reader.result as string,
          editedUrl: null, 
          isProcessing: false
        });
        setError(null);
        setViewMode(ViewMode.EDITOR);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAuto4K = async () => {
    if (!photoState.originalUrl) return;

    setPhotoState(prev => ({ ...prev, isProcessing: true }));
    setError(null);

    try {
      const targetPrompt = "Auto-enhance this portrait to 4K resolution quality. Remove background and set a perfect solid professional blue background. Sharpen the face and ensure perfect centering for a passport photo (35mm x 45mm style).";
      const result = await editImageWithAI(photoState.originalUrl, targetPrompt);
      setPhotoState(prev => ({ ...prev, editedUrl: result, isProcessing: false }));
      setViewMode(ViewMode.PREVIEW);
    } catch (err) {
      setError("Resolution enhancement failed. Please use a high-quality source image.");
      setPhotoState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadLayout = async () => {
    const element = document.getElementById('printable-area');
    if (!element) return;

    setIsDownloading(true);
    try {
      // Capture the element at high scale for better quality
      const canvas = await html2canvas(element, {
        scale: 3, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `passport-a4-layout-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download layout. Try printing to PDF instead.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSinglePhoto = () => {
    if (!photoState.editedUrl) return;
    const link = document.createElement('a');
    link.download = `passport-4k-photo-${Date.now()}.png`;
    link.href = photoState.editedUrl;
    link.click();
  };

  const resetAll = () => {
    setPhotoState({ originalUrl: null, editedUrl: null, isProcessing: false });
    setViewMode(ViewMode.EDITOR);
    setError(null);
    setSpacing(0);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f1f5f9]">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 no-print">
        <div className="flex items-center gap-4 cursor-pointer" onClick={resetAll}>
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <i className="fas fa-id-card text-white"></i>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-slate-900 leading-none">Passport <span className="text-blue-600">4K</span></h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1 uppercase">Professional AI Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          {photoState.originalUrl && (
            <button 
              onClick={triggerUpload}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-2"
            >
              <i className="fas fa-upload"></i> <span className="hidden sm:inline">UPLOAD NEW</span>
            </button>
          )}

          {photoState.editedUrl && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode(ViewMode.EDITOR)}
                className={`px-3 py-2 sm:px-4 rounded-lg text-[10px] sm:text-xs font-black transition-all ${viewMode === ViewMode.EDITOR ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                EDIT
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.PREVIEW)}
                className={`px-3 py-2 sm:px-4 rounded-lg text-[10px] sm:text-xs font-black transition-all ${viewMode === ViewMode.PREVIEW ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
              >
                A4 SHEET
              </button>
            </div>
          )}
          
          {viewMode === ViewMode.PREVIEW && photoState.editedUrl && (
            <div className="flex items-center gap-2">
               <button 
                onClick={handleDownloadLayout}
                disabled={isDownloading}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <i className={`fas ${isDownloading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i> <span className="hidden sm:inline">DOWNLOAD</span>
              </button>
              <button 
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
              >
                <i className="fas fa-print"></i> <span className="hidden sm:inline">PRINT</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-xs font-black flex items-center gap-3 no-print">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {!photoState.originalUrl ? (
          <div 
            onClick={triggerUpload}
            className="w-full max-w-xl aspect-video bg-white border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="text-center">
              <p className="text-slate-900 font-black text-lg">Upload Your Portrait</p>
              <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">Select an image to begin processing</p>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-8">
            {viewMode === ViewMode.EDITOR ? (
              <div className="flex flex-col md:flex-row gap-8 items-center justify-center no-print">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Original Input</p>
                  <div className="w-[35mm] h-[45mm] bg-slate-200 rounded-lg overflow-hidden shadow-xl">
                    <img src={photoState.originalUrl} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                  {photoState.isProcessing ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI Retouching...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                       <button 
                        onClick={processAuto4K}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 transition-all flex items-center gap-3"
                      >
                        <i className="fas fa-magic"></i> GENERATE 4K PORTRAIT
                      </button>
                      {photoState.editedUrl && (
                         <button 
                          onClick={handleDownloadSinglePhoto}
                          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3"
                        >
                          <i className="fas fa-download"></i> DOWNLOAD PNG
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {photoState.editedUrl && (
                  <div className="flex flex-col items-center gap-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">4K AI Result</p>
                    <PassportPhoto imageUrl={photoState.editedUrl} className="shadow-2xl shadow-blue-200" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-8">
                <div className="no-print mb-4 flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Photo Spacing (mm)</span>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      value={spacing} 
                      onChange={(e) => setSpacing(parseInt(e.target.value))}
                      className="w-32 accent-blue-600"
                    />
                    <span className="w-8 text-center text-xs font-black text-blue-600">{spacing}mm</span>
                  </div>
                </div>
                
                <div className="print:m-0 print:p-0">
                  <A4Sheet imageUrl={photoState.editedUrl || ''} spacing={spacing} />
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Fix: Correctly export the App component to resolve import error in index.tsx
export default App;
