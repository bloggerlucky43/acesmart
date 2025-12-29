import Cropper from "react-easy-crop";
import { useState } from "react";
import "./imageupload.css";
const CropModal = ({ image, onComplete, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixelCrop, setPixelCrop] = useState(null);

  return (
    <div className="crop-overlay">
      <div className="crop-container">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, croppedPixels) => setPixelCrop(croppedPixels)}
        />

        <div className="crop-actions">
          <button onClick={() => onComplete(pixelCrop)}>Crop</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
