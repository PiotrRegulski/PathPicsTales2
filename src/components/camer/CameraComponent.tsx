"use client";
import { useState, useRef } from "react";
import Image from "next/image";

const CameraComponent = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 🔹 **Uruchomienie aparatu**
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setStreamActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("❌ Błąd aparatu:", err);
      alert("Nie udało się uzyskać dostępu do aparatu.");
    }
  };

  // 📸 **Zrobienie zdjęcia**
  const takePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        setImageSrc(canvas.toDataURL("image/png"));
      }
    }

    // 🛑 **Wyłączenie aparatu po zrobieniu zdjęcia**
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setStreamActive(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      {!streamActive ? (
        <button
          onClick={startCamera}
          className="px-4 py-2 bg-green-500 text-white rounded-md shadow-md hover:bg-green-600 transition"
        >
          📸 Otwórz aparat
        </button>
      ) : (
        <button
          onClick={takePhoto}
          className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition"
        >
          📷 Zrób zdjęcie
        </button>
      )}

      {streamActive && (
        <video ref={videoRef} className="mt-4 rounded-lg shadow-lg w-[300px]" />
      )}

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
