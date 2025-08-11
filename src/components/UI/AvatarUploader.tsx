'use client';

import { useState, useRef, useEffect } from 'react';
import ImageUploader from './ImageUploader';

interface AvatarUploaderProps {
  currentImage?: string;
  onImageChange: (imageUrl: string, positioning?: { x: number; y: number; scale: number }) => void;
  className?: string;
}

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

export default function AvatarUploader({
  currentImage = '',
  onImageChange,
  className = ''
}: AvatarUploaderProps) {
  const [imageUrl, setImageUrl] = useState(currentImage);
  const [position, setPosition] = useState<ImagePosition>({ x: 50, y: 50, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [showPositioning, setShowPositioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize positioning from current image
  useEffect(() => {
    console.log('AvatarUploader useEffect - currentImage changed:', currentImage);
    setImageUrl(currentImage);
    if (currentImage) {
      setShowPositioning(false); // Don't auto-show positioning
    }
  }, [currentImage]);

  // Debug logging
  useEffect(() => {
    console.log('AvatarUploader state - imageUrl:', imageUrl, 'currentImage:', currentImage);
  }, [imageUrl, currentImage]);

  const handleImageChange = (url: string) => {
    setImageUrl(url);
    // Don't auto-show positioning controls, let user decide
    if (url) {
      onImageChange(url, position);
    } else {
      onImageChange('');
      setShowPositioning(false);
    }
  };

  const updatePosition = (updates: Partial<ImagePosition>) => {
    const newPosition = { ...position, ...updates };
    console.log('Position updated:', newPosition);
    console.log('Transform will be:', `translate(${(newPosition.x - 50) * 1.0}px, ${(newPosition.y - 50) * 1.0}px) scale(${newPosition.scale})`);
    setPosition(newPosition);
    if (imageUrl) {
      onImageChange(imageUrl, newPosition);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!showPositioning || !containerRef.current) return;
    
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Constrain within reasonable bounds for positioning
    updatePosition({ 
      x: Math.max(10, Math.min(90, x)), 
      y: Math.max(10, Math.min(90, y)) 
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Constrain within reasonable bounds for positioning
    updatePosition({ 
      x: Math.max(10, Math.min(90, x)), 
      y: Math.max(10, Math.min(90, y)) 
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetPosition = () => {
    updatePosition({ x: 50, y: 50, scale: 1 });
  };

  return (
    <div className={className}>
      {/* Image Upload Section */}
      <ImageUploader
        currentImage={imageUrl}
        onImageChange={handleImageChange}
        accept="image/*"
        className="mb-4"
        showUrlToggle={false}
        showPreview={false}
        placeholder="Upload avatar image"
      />

      {/* Avatar Preview & Positioning - Always show when we have imageUrl OR when user uploads */}
      {(imageUrl || currentImage) && (
        <div className="space-y-4">
          {/* Preview Container */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">Avatar Preview</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPositioning(!showPositioning)}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                >
                  {showPositioning ? 'Hide Controls' : 'Adjust Position'}
                </button>
                <button
                  onClick={() => {
                    setImageUrl('');
                    onImageChange('');
                    setShowPositioning(false);
                  }}
                  className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  title="Remove avatar image"
                >
                  <i className="fas fa-times mr-1"></i>
                  Remove
                </button>
              </div>
            </div>
            
            {/* Circular Preview */}
            <div 
              ref={containerRef}
              className={`w-32 h-32 mx-auto rounded-full overflow-hidden border-2 relative ${
                showPositioning 
                  ? 'cursor-crosshair border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'border-gray-600'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                minWidth: '128px',
                minHeight: '128px',
                backgroundColor: '#374151' // Gray background to see if container is there
              }}
            >
              {/* Debug info */}
              <div className="absolute top-0 left-0 text-xs text-white bg-red-600 px-1 z-50">
                IMG: {imageUrl ? 'Y' : 'N'} | CUR: {currentImage ? 'Y' : 'N'}
              </div>
              
              {(imageUrl || currentImage) ? (
                <img
                  src={imageUrl || currentImage}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  style={{
                    transform: showPositioning 
                      ? `translate(${(position.x - 50) * 1.0}px, ${(position.y - 50) * 1.0}px) scale(${position.scale})`
                      : 'none',
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                  onError={(e) => {
                    console.error('Avatar preview image failed to load:', imageUrl || currentImage);
                  }}
                  onLoad={() => {
                    console.log('Avatar preview image loaded successfully:', imageUrl || currentImage);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <i className="fas fa-user text-2xl text-gray-500"></i>
                </div>
              )}
              
              {/* Positioning Overlay */}
              {showPositioning && (
                <div className="absolute inset-0 bg-black bg-opacity-30">
                  {/* Center crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-400 rounded-full bg-blue-500 bg-opacity-50"></div>
                  </div>
                  {/* Grid lines for reference */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-blue-400 bg-opacity-40"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-blue-400 bg-opacity-40"></div>
                  </div>
                  {/* Debug position values */}
                  <div className="absolute top-1 left-1 text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                    {Math.round(position.x)},{Math.round(position.y)},{position.scale.toFixed(1)}
                  </div>
                </div>
              )}
            </div>

            {/* Position Controls */}
            {showPositioning && (
              <div className="mt-4 space-y-3">
                <div className="text-xs text-gray-400 text-center mb-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  Click and drag the preview above or use sliders below
                </div>
                {/* Horizontal Position */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Horizontal Position ({Math.round(position.x)}%)
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">L</span>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={position.x}
                      onChange={(e) => updatePosition({ x: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">R</span>
                  </div>
                </div>

                {/* Vertical Position */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Vertical Position ({Math.round(position.y)}%)
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">T</span>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={position.y}
                      onChange={(e) => updatePosition({ y: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">B</span>
                  </div>
                </div>

                {/* Scale */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Zoom ({position.scale.toFixed(1)}x)
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">-</span>
                    <input
                      type="range"
                      min="0.8"
                      max="2.5"
                      step="0.1"
                      value={position.scale}
                      onChange={(e) => updatePosition({ scale: parseFloat(e.target.value) })}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-gray-500">+</span>
                  </div>
                </div>

                {/* Reset Button */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={resetPosition}
                    className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    <i className="fas fa-undo mr-1"></i>
                    Reset Position
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}