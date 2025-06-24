import React from "react";
import PhotoBlobImage from "@/components/map/camera/PhotoBlobToImage"; 
import type { Photo } from "@/components/Tracks/types"; // <-- importuj typ

type PhotoListProps = {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
};

const PhotoList: React.FC<PhotoListProps> = ({ photos, onPhotoClick }) => {
  if (photos.length === 0) {
    return <p>Brak zdjęć do wyświetlenia.</p>;
  }

  return (
    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
      {photos.map((photo) => (
        <div
          key={photo.id}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
            cursor: "pointer",
            border: "1px solid #ddd",
            padding: "8px",
            borderRadius: "4px",
          }}
          onClick={() => onPhotoClick(photo)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") onPhotoClick(photo);
          }}
          role="button"
          aria-label={`Pokaż zdjęcie: ${photo.description}`}
        >
          <PhotoBlobImage
            blob={photo.blob}
            alt="Zdjęcie z trasy"
            width={200}
            height={200}
            className="rounded"
          />
          <div style={{ flex: 1, marginLeft: "10px" }}>
            <p style={{ margin: 0, fontWeight: "bold" }}>{photo.description}</p>
            <p style={{ margin: 0, color: "#555", fontSize: "0.9em" }}>
              {new Date(photo.timestamp).toLocaleString()}
            </p>
            {photo.position && (
              <small className="text-gray-400 block">
                Pozycja: {photo.position.lat.toFixed(5)},{" "}
                {photo.position.lon.toFixed(5)}
              </small>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPhotoClick(photo);
            }}
            style={{
              padding: "6px 12px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
            aria-label={`Pokaż na mapie: ${photo.description}`}
          >
            Pokaż na mapie
          </button>
        </div>
      ))}
    </div>
  );
};

export default PhotoList;
