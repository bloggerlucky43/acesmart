// src/components/ImageUpload.jsx
import { useState } from "react";
import imageCompression from "browser-image-compression";
import CropModal from "./CropModal";
import { getCroppedImg } from "./CropImage";

const ImageUpload = ({ onUpload }) => {
  const [preview, setPreview] = useState(null);
  const [rawImage, setRawImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  const onSelectFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result);
      setShowCrop(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCrop = async (pixelCrop) => {
    const croppedFile = await getCroppedImg(rawImage, pixelCrop);

    const compressed = await imageCompression(croppedFile, {
      maxSizeMB: 0.3,
      maxWidthOrHeight: 800,
      useWebWorker: true,
    });

    setPreview(URL.createObjectURL(compressed));
    setShowCrop(false);

    onUpload(compressed); // send to backend
  };

  return (
    <>
      <input type="file" accept="image/*" onChange={onSelectFile} />

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="preview" />
        </div>
      )}

      {showCrop && (
        <CropModal
          image={rawImage}
          onComplete={handleCrop}
          onClose={() => setShowCrop(false)}
        />
      )}
    </>
  );
};

export default ImageUpload;
