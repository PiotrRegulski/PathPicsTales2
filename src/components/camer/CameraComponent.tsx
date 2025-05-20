"use client";
import { useState } from "react";
import Image from "next/image";
const CameraComponent = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      setTimeout(() => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          setImageSrc(canvas.toDataURL("image/png"));
        }

        stream.getTracks().forEach((track) => track.stop()); // Zatrzymanie aparatu
      }, 2000); // Zrobienie zdjęcia po 2 sekundach
    } catch (err) {
      console.error("❌ Błąd aparatu:", err);
      alert("Nie udało się uzyskać dostępu do aparatu.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <button
        onClick={openCamera}
        className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
      >
        📸 Otwórz aparat i zrób zdjęcie
      </button>

     {imageSrc && (
  <div className="mt-4">
    <h2 className="text-center text-blue-950">📷 Zrobione zdjęcie:</h2>
    <Image 
      src={imageSrc} 
      alt="Zrobione zdjęcie" 
      width={300} 
      height={300} 
       unoptimized={true}
      className="rounded-lg shadow-lg mx-auto"
    />
  </div>
)}
    </div>
  );
};

export default CameraComponent;
