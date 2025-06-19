import React from "react";

type ScreenLockProps = {
  active: boolean;
  onUnlock?: () => void;
};

const ScreenLock: React.FC<ScreenLockProps> = ({ active, onUnlock }) => {
  if (!active) return null;

  return (
    <div
      className="
        fixed inset-0 w-screen h-screen
        z-[9999]
        bg-transparent
        select-none
      "
      style={{ touchAction: "none" }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (onUnlock) onUnlock();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center bg-black/80 ">
        {/* Ikona kłódki */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 mb-2 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm6-7V7a6 6 0 10-12 0v3M5 10h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"
          />
        </svg>
        <span className="bg-black/20 text-green-600 px-4 py-2 rounded text-center text-sm">
          Dotknij, aby odblokować ekran
        </span>
      </div>
    </div>
  );
};

export default ScreenLock;
