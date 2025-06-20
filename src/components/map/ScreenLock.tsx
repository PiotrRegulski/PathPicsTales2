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
        fixed inset-0 w-screen  h-[100dvh]
        z-[9999]
        bg-black/80
        flex items-center justify-center
        select-none
      "
      style={{ touchAction: "none" }}
      // Blokujemy wszystkie kliknięcia poza przyciskiem
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onTouchStart={e => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <button
        className="
          flex flex-col items-center gap-2
          px-8 py-4 rounded-lg
          bg-white bg-opacity-90
          shadow-lg
          text-green-700 font-semibold
          text-lg
          focus:outline-none
          active:scale-95
          transition
        "
        onClick={e => {
          e.stopPropagation();
          e.preventDefault();
          if (onUnlock) onUnlock();
        }}
      >
        {/* Ikona kłódki */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 mb-1 text-green-700"
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
        Odblokuj ekran
      </button>
    </div>
  );
};

export default ScreenLock;
