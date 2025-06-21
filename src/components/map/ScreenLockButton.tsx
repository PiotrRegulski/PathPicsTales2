import React from "react";


const ScreenLockButton: React.FC<{ onLock: () => void }> = ({ onLock }) => (
  <button
    type="button"
    className="
      sticky top-6 right-6 z-[10000]
      flex items-center gap-2
      px-4 py-2 rounded-full
      bg-blue-600 text-white shadow-lg
      hover:bg-blue-700 transition
    "
    onClick={onLock}
    aria-label="Zablokuj ekran"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
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
   
  </button>
);

export default ScreenLockButton;
