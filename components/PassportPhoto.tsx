
import React from 'react';

interface PassportPhotoProps {
  imageUrl: string;
  className?: string;
  styleOverride?: React.CSSProperties;
}

const PassportPhoto: React.FC<PassportPhotoProps> = ({ imageUrl, className = "", styleOverride }) => {
  const defaultStyle: React.CSSProperties = { 
    width: '35mm', 
    height: '45mm',
    minWidth: '31mm',
    minHeight: '40mm'
  };

  return (
    <div 
      className={`relative overflow-hidden border border-gray-100 shadow-sm bg-blue-600 ${className}`}
      style={{ ...defaultStyle, ...styleOverride }}
    >
      <img 
        src={imageUrl} 
        alt="Passport" 
        className="w-full h-full object-cover"
        style={{ imageRendering: 'high-quality' }}
      />
    </div>
  );
};

export default PassportPhoto;
