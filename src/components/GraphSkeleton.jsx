import React from "react";

const GraphSkeleton = () => {
  return (
    <div className="w-full h-[320px] bg-white rounded-[20px] border border-[#EEF2F7] p-5 animate-pulse">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-4 w-36 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-3 w-24 bg-gray-100 rounded-md"></div>
        </div>

        <div className="h-9 w-24 bg-gray-100 rounded-xl"></div>
      </div>

      {/* GRAPH AREA */}
      <div className="relative h-[210px] w-full">
        {/* GRID LINES */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full border-t border-[#F1F5F9]"></div>
          ))}
        </div>

        {/* LINE GRAPH */}
        <svg
          viewBox="0 0 600 220"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {/* AREA */}
          <path
            d="
              M0 170
              C60 130, 90 120, 130 140
              C170 160, 210 190, 250 150
              C290 120, 340 145, 390 135
              C440 125, 500 70, 600 20
              L600 220
              L0 220
              Z
            "
            fill="#2563EB"
            opacity="0.08"
          />

          {/* LINE */}
          <path
            d="
              M0 170
              C60 130, 90 120, 130 140
              C170 160, 210 190, 250 150
              C290 120, 340 145, 390 135
              C440 125, 500 70, 600 20
            "
            fill="none"
            stroke="#2563EB"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* POINTS */}
          {[70, 130, 220, 310, 420, 520].map((x, i) => (
            <circle
              key={i}
              cx={x}
              cy={[140, 120, 165, 135, 95, 35][i]}
              r="6"
              fill="#2563EB"
            />
          ))}
        </svg>

        {/* BOTTOM LABELS */}
        <div className="absolute bottom-[-18px] left-0 w-full flex justify-between px-1">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((item, i) => (
            <div key={i} className="h-3 w-7 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GraphSkeleton;
