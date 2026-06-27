import React, { useState, useEffect } from 'react';

const AdminSlider = () => {
  const [sliderImages, setSliderImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Load images from localStorage on component mount
  useEffect(() => {
    const cachedImages = localStorage.getItem('homepage_slider_images');
    if (cachedImages) {
      try {
        setSliderImages(JSON.parse(cachedImages));
      } catch (err) {
        console.error("Failed to parse cached slider images", err);
      }
    }
  }, []);

  // Save images to localStorage and dispatch custom event to sync with other components if needed
  const saveImages = (images) => {
    setSliderImages(images);
    localStorage.setItem('homepage_slider_images', JSON.stringify(images));
    // Trigger window event so that open pages can react instantly if needed
    window.dispatchEvent(new Event('sliderImagesChanged'));
  };

  // Canvas Image Compression Utility
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Set maximum dimensions for slider images (e.g. 1600px width/height)
          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 1200;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width / height > MAX_WIDTH / MAX_HEIGHT) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Export as compressed JPEG (0.75 quality for high-res look with tiny file size)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Handle uploaded files
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const newImages = [...sliderImages];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        alert(`File "${file.name}" is not an image.`);
        continue;
      }

      try {
        const compressedBase64 = await compressImage(file);
        newImages.push({
          id: Date.now() + i + Math.random().toString(36).substr(2, 5),
          url: compressedBase64,
          name: file.name,
          timestamp: new Date().toLocaleDateString()
        });
      } catch (err) {
        console.error('Error compressing image:', err);
        alert(`Failed to process image: ${file.name}`);
      }
    }

    saveImages(newImages);
    setIsUploading(false);
  };

  const handleFileChange = (e) => {
    handleFiles(e.target.files);
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Delete Image
  const handleDelete = (indexToDelete) => {
    if (!window.confirm("Are you sure you want to delete this slider image?")) return;
    const updated = sliderImages.filter((_, idx) => idx !== indexToDelete);
    saveImages(updated);
  };

  // Reorder Images: Move Up
  const moveUp = (index) => {
    if (index === 0) return;
    const updated = [...sliderImages];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    saveImages(updated);
  };

  // Reorder Images: Move Down
  const moveDown = (index) => {
    if (index === sliderImages.length - 1) return;
    const updated = [...sliderImages];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    saveImages(updated);
  };

  // Helper to approximate Base64 string size in KB
  const getApproxSize = (base64Str) => {
    const stringLength = base64Str.length - 'data:image/jpeg;base64,'.length;
    const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.562489; // scaling factor
    return (sizeInBytes / 1024).toFixed(1);
  };

  return (
    <div className="p-4 md:p-6 text-left space-y-8 font-sans">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800">Manage Home Slider Images</h2>
        <p className="text-slate-500 text-sm mt-1">
          Upload banner images for the home page slider. Drag-and-drop to upload, and reorder images using the arrows.
        </p>
      </div>

      {/* Upload Zone */}
      <div 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive 
            ? 'border-[#7c3aed] bg-violet-50/50' 
            : 'border-slate-300 hover:border-slate-400 bg-white'
        }`}
      >
        <input 
          type="file" 
          id="slider-upload-input" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange}
          className="hidden" 
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <span className="material-symbols-outlined text-5xl text-[#7c3aed] animate-bounce">
            cloud_upload
          </span>
          <p className="text-base font-semibold text-slate-700">
            Drag and drop images here, or{' '}
            <label 
              htmlFor="slider-upload-input" 
              className="text-[#7c3aed] cursor-pointer hover:underline focus-within:outline-none"
            >
              browse files
            </label>
          </p>
          <p className="text-xs text-slate-400">
            Supported formats: JPEG, PNG, WEBP. Images are automatically compressed to keep size minimal.
          </p>
        </div>

        {isUploading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#7c3aed] font-medium">
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-[#7c3aed] border-t-transparent"></span>
            Processing and compressing images...
          </div>
        )}
      </div>

      {/* Slider Images Preview / Management List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span>🖼️</span> Slider List ({sliderImages.length} images)
        </h3>

        {sliderImages.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <p className="text-lg font-semibold">No slider images uploaded yet.</p>
            <p className="text-sm mt-1 text-slate-400">The website will use the default scout training background photo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sliderImages.map((image, index) => (
              <div 
                key={image.id} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group relative"
              >
                {/* Badge for slide number */}
                <span className="absolute top-3 left-3 bg-slate-900/80 text-white font-bold text-xs py-1 px-2.5 rounded-full z-10">
                  Slide {index + 1}
                </span>

                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-4 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-slate-800 text-sm truncate" title={image.name}>
                      {image.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      Approx Size: {getApproxSize(image.url)} KB | Uploaded: {image.timestamp}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        title="Move Slide Up/Prev"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg leading-none">arrow_upward</span>
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === sliderImages.length - 1}
                        title="Move Slide Down/Next"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg leading-none">arrow_downward</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDelete(index)}
                      className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm leading-none">delete</span>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSlider;
