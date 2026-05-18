import React from 'react';

const Loader = ({ message = "Loading...", size = "md", fullPage = false }) => {
  const dimensions = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-36 h-36"
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative">
        {/* Soft premium background glow */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl animate-pulse"></div>
        
        {/* Beautiful spinning outline track */}
        <div className={`rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin duration-1000 ${dimensions[size] || dimensions.md}`}></div>
        
        {/* Centered circular scout logo */}
        <div className="absolute inset-2 flex items-center justify-center">
          <img 
            src="/Scout logo.jpeg" 
            alt="BSG Logo" 
            className="w-5/6 h-5/6 rounded-full object-cover shadow-lg border border-slate-100"
          />
        </div>
      </div>
      {message && (
        <p className="text-slate-500 font-bold tracking-wider text-sm md:text-base animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-md flex items-center justify-center z-[9999]">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
