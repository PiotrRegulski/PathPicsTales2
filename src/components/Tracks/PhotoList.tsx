import React from 'react';
import Image from 'next/image';
type Photo = {
  id: string;
  lat: number;
  lng: number;
  description: string;
  thumbnailUrl: string;
  dateTime: string; // np. ISO string lub sformatowana data
};

type PhotoListProps = {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
};


const PhotoList: React.FC<PhotoListProps> = ({ photos, onPhotoClick }) => {
  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      {photos.map((photo) => (
        <div 
          key={photo.id} 
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            cursor: 'pointer',
            border: '1px solid #ddd',
            padding: '8px',
            borderRadius: '4px'
          }}
          onClick={() => onPhotoClick(photo)}
          tabIndex={0}
          onKeyDown={(e) => { if(e.key === 'Enter') onPhotoClick(photo); }}
          role="button"
          aria-label={`Pokaż zdjęcie: ${photo.description}`}
        >
          <Image 
            src={photo.thumbnailUrl} 
            alt={photo.description} 
            width={80} 
            height={80} 
            style={{ borderRadius: '4px', objectFit: 'cover' }} 
          />
          <div style={{ flex: 1, marginLeft: '10px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>{photo.description}</p>
            <p style={{ margin: 0, color: '#555', fontSize: '0.9em' }}>{new Date(photo.dateTime).toLocaleString()}</p>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onPhotoClick(photo);
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
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
