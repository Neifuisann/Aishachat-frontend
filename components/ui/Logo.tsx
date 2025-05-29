import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 24, className = "" }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={`logoGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#7C3AED", stopOpacity:1}} />
          <stop offset="50%" style={{stopColor:"#F97316", stopOpacity:1}} />
          <stop offset="100%" style={{stopColor:"#06B6D4", stopOpacity:1}} />
        </linearGradient>
      </defs>
      
      {/* Main crystal/gem shape */}
      <path d="M12 2L16 8H8L12 2Z" fill={`url(#logoGradient-${size})`} opacity="0.9"/>
      <path d="M8 8L4 12L8 16L12 12L8 8Z" fill={`url(#logoGradient-${size})`} opacity="0.7"/>
      <path d="M16 8L20 12L16 16L12 12L16 8Z" fill={`url(#logoGradient-${size})`} opacity="0.7"/>
      <path d="M8 16L12 22L16 16H8Z" fill={`url(#logoGradient-${size})`} opacity="0.9"/>
      
      {/* Center core */}
      <circle cx="12" cy="12" r="2" fill={`url(#logoGradient-${size})`}/>
      
      {/* Sparkle effects */}
      <circle cx="6" cy="6" r="1" fill="#7C3AED" opacity="0.8"/>
      <circle cx="18" cy="6" r="0.8" fill="#F97316" opacity="0.8"/>
      <circle cx="6" cy="18" r="0.8" fill="#06B6D4" opacity="0.8"/>
      <circle cx="18" cy="18" r="1" fill="#7C3AED" opacity="0.8"/>
      
      {/* Additional small sparkles */}
      <circle cx="4" cy="10" r="0.5" fill="#F97316" opacity="0.6"/>
      <circle cx="20" cy="14" r="0.5" fill="#06B6D4" opacity="0.6"/>
      <circle cx="10" cy="4" r="0.5" fill="#06B6D4" opacity="0.6"/>
      <circle cx="14" cy="20" r="0.5" fill="#7C3AED" opacity="0.6"/>
    </svg>
  );
};

export default Logo;
