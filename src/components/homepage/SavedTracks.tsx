import Link from "next/link";
import React from "react";

const SavedTracks = () => {
  return (
    
      <div className="flex flex-col items-center justify-center h-screen bg-lime-300 text-blue-950">
       
        <Link href="/zapisane-trasy" className="text-blue-500 hover:underline mb-4">
          {" "}
          <button className="px-6 py-3 bg-orange-500 text-blue-950 rounded-lg hover:bg-orange-600 active:bg-amber-800 transition duration-300">
            Zapisane Trasy
          </button>
        </Link>
      </div>
    
  );
};

export default SavedTracks;
