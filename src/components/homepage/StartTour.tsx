import Link from "next/link";
import React from "react";

const StartTour = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-lime-300 text-blue-950">
      <h1 className="text-4xl font-bold mb-4 text-blue-950">PathPicsTales</h1>
      <p className="text-lg mb-8">Gotowy na nowe przygody</p>
      <Link href="/trasa" className="text-blue-500 hover:underline mb-4">
        {" "}
        <button className="px-6 py-3 bg-lime-500 text-blue-950 rounded-lg hover:bg-lime-600 transition duration-300">
          Zacznij trase
        </button>
      </Link>
        <Link href="/zapisane-trasy" className="text-blue-500 hover:underline mb-4">
          {" "}
          <button className="px-6 py-3 bg-orange-500 text-blue-950 rounded-lg hover:bg-orange-600 active:bg-amber-800 transition duration-300">
            Zapisane Trasy
          </button>
        </Link>
    </div>
  );
};

export default StartTour;
