'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  placeholder?: string;
  className?: string;
  accept?: string;
  maxSizeText?: string;
  showUrlToggle?: boolean;
  showPreview?: boolean;
}

export default function ImageUploader({
  currentImage = '',
  onImageChange,
  placeholder = 'Upload or paste image URL',
  className = '',
  accept = 'image/*',
  maxSizeText = 'Max 10MB (auto-compressed)',
  showUrlToggle = true,
  showPreview = true
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(currentImage);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputMethod, setInputMethod] = useState<'upload' | 'url'>('upload');
  const [tempUrl, setTempUrl] = useState('');
  const [isFetchingFromWebsite, setIsFetchingFromWebsite] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 1200px width/height while maintaining aspect ratio)
        const maxDimension = 1200;
        let { width, height } = img;
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // Start with high quality and reduce if needed
          let quality = 0.8;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // If still too large, reduce quality further
          while (compressedDataUrl.length > 500000 && quality > 0.1) { // ~500KB limit
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          
          console.log('Original size:', file.size, 'bytes');
          console.log('Compressed size:', compressedDataUrl.length, 'characters');
          console.log('Compression quality used:', quality);
          
          resolve(compressedDataUrl);
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      
      img.onerror = () => reject(new Error('Could not load image'));
      
      // Read file as data URL to load into image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setError('');
    setIsLoading(true);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      setIsLoading(false);
      return;
    }

    // Validate file size (10MB for raw upload, we'll compress it)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setIsLoading(false);
      return;
    }

    console.log('Processing file upload:', file.name, file.type, `${(file.size / 1024 / 1024).toFixed(2)}MB`);

    try {
      // Compress the image before uploading
      const compressedDataUrl = await compressImage(file);
      console.log('Image compressed successfully');
      setImageUrl(compressedDataUrl);
      onImageChange(compressedDataUrl);
    } catch (error) {
      console.error('Image compression error:', error);
      setError('Failed to process image - please try a different image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setTempUrl(url);
    setError('');
  };

  const applyUrl = () => {
    // Check if the URL looks like a website rather than an image
    const isWebsiteUrl = !tempUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i) && 
                        (tempUrl.startsWith('http') || tempUrl.includes('.com') || tempUrl.includes('.org') || tempUrl.includes('.net'));
    
    if (isWebsiteUrl && showUrlToggle) {
      setError('This looks like a website URL. Use the camera button 📷 to generate a thumbnail preview, or enter a direct image URL (.jpg, .png, etc.)');
      return;
    }
    
    setImageUrl(tempUrl);
    onImageChange(tempUrl);
    setError('');
  };

  const fetchImageFromWebsite = async (websiteUrl: string) => {
    setIsFetchingFromWebsite(true);
    setError('');
    
    try {
      console.log('Fetching image from website:', websiteUrl);
      
      const response = await fetch('/api/fetch-website-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: websiteUrl }),
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers.get('content-type'));

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('API returned non-JSON response');
        const textResponse = await response.text();
        console.error('Response text:', textResponse.substring(0, 200));
        setError('Server error - please check console for details');
        return;
      }

      const result = await response.json();
      console.log('API result:', result);

      if (response.ok && result.imageUrl) {
        console.log('Successfully fetched image URL:', result.imageUrl);
        console.log('Is real screenshot:', result.isScreenshot);
        console.log('Fallback URLs available:', result.fallbackUrls);
        
        if (result.isScreenshot) {
          // For real screenshots, show a loading message since they may take time to generate
          setImageUrl(result.imageUrl);
          onImageChange(result.imageUrl);
          setError(''); // Clear any previous errors
          console.log('Real website screenshot generated!');
        } else {
          // For fallback images, test loading as before
          const testImageLoad = (url: string, fallbacks: string[] = []) => {
            const img = new window.Image();
            img.onload = () => {
              console.log('Image loaded successfully:', url);
              setImageUrl(url);
              onImageChange(url);
              setError('');
            };
            img.onerror = () => {
              console.log('Image failed to load:', url);
              if (fallbacks.length > 0) {
                console.log('Trying fallback:', fallbacks[0]);
                testImageLoad(fallbacks[0], fallbacks.slice(1));
              } else {
                console.log('All fallbacks failed');
                setError('Failed to load generated preview image');
              }
            };
            img.src = url;
          };
          
          testImageLoad(result.imageUrl, result.fallbackUrls || []);
        }
      } else {
        console.error('API error:', result);
        setError(result.error || result.details || 'Failed to fetch image from website');
      }
    } catch (error) {
      console.error('Error fetching website image:', error);
      if (error instanceof Error) {
        if (error.message.includes('JSON')) {
          setError('Server returned invalid response - please try again');
        } else if (error.message.includes('fetch')) {
          setError('Network error - please check your connection');
        } else {
          setError(`Error: ${error.message}`);
        }
      } else {
        setError('Failed to fetch image from website');
      }
    } finally {
      setIsFetchingFromWebsite(false);
    }
  };

  const switchInputMethod = (method: 'upload' | 'url') => {
    setInputMethod(method);
    setError('');
    if (method === 'url' && imageUrl) {
      setTempUrl(imageUrl);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    onImageChange('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {/* Toggle Buttons */}
      {showUrlToggle && (
        <div className="flex mb-4 bg-gray-700 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => switchInputMethod('upload')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMethod === 'upload'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            <i className="fas fa-upload mr-2"></i>
            Upload Image
          </button>
          <button
            type="button"
            onClick={() => switchInputMethod('url')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMethod === 'url'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-600'
            }`}
          >
            <i className="fas fa-camera mr-2"></i>
            Website Screenshot
          </button>
        </div>
      )}

      {/* URL Input Method */}
      {(!showUrlToggle || inputMethod === 'url') && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {showUrlToggle ? 'Website URL for Screenshot or Direct Image URL' : 'Image URL'}
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={tempUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={showUrlToggle ? "https://example.com (for screenshot) or https://example.com/image.jpg (direct)" : "https://example.com/image.jpg"}
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
              onKeyPress={(e) => e.key === 'Enter' && applyUrl()}
            />
            {showUrlToggle && (
              <button
                type="button"
                onClick={() => fetchImageFromWebsite(tempUrl)}
                disabled={!tempUrl.trim() || isFetchingFromWebsite}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                title="Generate website screenshot preview"
              >
                {isFetchingFromWebsite ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-1"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-camera mr-1"></i>
                    Generate Thumbnail
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={applyUrl}
              disabled={!tempUrl.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              title="Use direct image URL"
            >
              <i className="fas fa-check mr-1"></i>
              Use URL
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {showUrlToggle ? (
              <div>
                <p className="mb-1">
                  📷 <strong>Website thumbnail:</strong> Enter website URL and click camera button
                </p>
                <p>
                  🔗 <strong>Direct image:</strong> Enter image URL (.jpg, .png, etc.) and click checkmark
                </p>
              </div>
            ) : (
              <p>Enter the direct URL to an image from any website</p>
            )}
          </div>
        </div>
      )}

      {/* File Upload Method */}
      {(!showUrlToggle || inputMethod === 'upload') && (
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-400/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <i className="fas fa-spinner fa-spin text-blue-400 text-2xl mb-2"></i>
            <p className="text-gray-400">Processing image...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <i className="fas fa-cloud-upload-alt text-gray-400 text-3xl mb-2"></i>
            <p className="text-gray-300 mb-1">
              {placeholder}
            </p>
            <p className="text-sm text-gray-500">
              Drag and drop or click to browse • {maxSizeText}
            </p>
          </div>
        )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-400 flex items-center">
          <i className="fas fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* Image Preview */}
      {showPreview && imageUrl && !isLoading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Preview:</span>
            <button
              onClick={removeImage}
              className="text-red-400 hover:text-red-300 transition-colors text-sm"
            >
              <i className="fas fa-times mr-1"></i>
              Remove
            </button>
          </div>
          <div className="relative w-full h-48 bg-gray-700 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={() => {
                console.error('Image failed to load:', imageUrl);
                setError('Failed to load image. Please try generating a new preview or check the URL.');
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', imageUrl);
                setError(''); // Clear any previous errors when image loads successfully
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced version with multiple image support
export function MultiImageUploader({
  images = [],
  onImagesChange,
  maxImages = 5,
  className = ''
}: {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}) {
  const addImage = (imageUrl: string) => {
    if (images.length < maxImages && imageUrl && !images.includes(imageUrl)) {
      onImagesChange([...images, imageUrl]);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-white">
          Project Images ({images.length}/{maxImages})
        </h4>
      </div>

      {/* Current Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`Project image ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex space-x-2">
                    {index > 0 && (
                      <button
                        onClick={() => reorderImages(index, index - 1)}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                        title="Move left"
                      >
                        <i className="fas fa-arrow-left"></i>
                      </button>
                    )}
                    {index < images.length - 1 && (
                      <button
                        onClick={() => reorderImages(index, index + 1)}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
                        title="Move right"
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    )}
                    <button
                      onClick={() => removeImage(index)}
                      className="bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors"
                      title="Remove image"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Image */}
      {images.length < maxImages && (
        <ImageUploader
          onImageChange={addImage}
          placeholder={`Add image ${images.length + 1}/${maxImages}`}
          className="border border-gray-600 rounded-lg p-4"
        />
      )}

      {images.length >= maxImages && (
        <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-600">
          <i className="fas fa-check-circle text-green-400 text-2xl mb-2"></i>
          <p className="text-gray-300">Maximum number of images reached</p>
        </div>
      )}
    </div>
  );
}