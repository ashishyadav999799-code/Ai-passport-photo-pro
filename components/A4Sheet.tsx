
import React from 'react';
import PassportPhoto from './PassportPhoto';

interface A4SheetProps {
  imageUrl: string;
  spacing: number;
}

const A4Sheet: React.FC<A4SheetProps> = ({ imageUrl, spacing }) => {
  // A4 is 210mm x 297mm.
  // User requested exact 35mm x 45mm.
  const photos = Array(6).fill(null);

  return (
    <div 
      id="printable-area"
      className="bg-white mx-auto relative print:m-0 print:shadow-none overflow-hidden"
      style={{ 
        width: '210mm', 
        height: '297mm',
        backgroundColor: 'white',
        boxShadow: '0 0 40px rgba(0,0,0,0.1)'
      }}
    >
      {/* 
        Horizontal row of 6 photos.
        Using exact 35mm width. 
        Note: 6 * 35mm = 210mm (Exactly A4 width).
        Any spacing > 0 will cause the row to be wider than the page.
      */}
      <div 
        className="flex justify-center items-start w-full whitespace-nowrap"
        style={{ 
          paddingTop: '15mm',
          gap: `${spacing}mm`
        }}
      >
        {photos.map((_, index) => (
          <PassportPhoto 
            key={index} 
            imageUrl={imageUrl} 
            styleOverride={{
              width: '35mm',
              height: '45mm',
              border: '0.1mm solid #f0f0f0',
              boxShadow: 'none',
              flexShrink: 0 // Prevent photos from shrinking to fit
            }}
          />
        ))}
      </div>

      {/* Subtle indicator for web preview only */}
      <div className="absolute inset-0 border-[1px] border-slate-100 pointer-events-none no-print"></div>
      <div className="absolute bottom-12 w-full text-center no-print">
        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[10px]">
          35x45mm Professional Layout
        </p>
      </div>
    </div>
  );
};

export default A4Sheet;
