import { useState } from "react";
import { uploadImage } from "../../services/cloudinary";
import { analyzeSkinImage } from "../../services/api";
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const ImageUpload = ({ onAnalysisComplete }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  console.log("🖼️ ImageUpload component state:", {
    hasImage: !!image,
    hasPreview: !!preview,
    loading,
    error
  });

  const handleImageChange = (e) => {
    console.log("📸 Image selection triggered via file input");
    const file = e.target.files[0];
    if (!file) {
      console.log("⚠️ No file selected");
      return;
    }

    console.log("📄 File details:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    if (!file.type.match("image.*")) {
      console.error("❌ Invalid file type:", file.type);
      setError("Please select an image file");
      return;
    }

    setImage(file);
    console.log("✅ Image state updated");
    
    console.log("🔄 Creating file preview...");
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("✅ Preview created");
      setPreview(e.target.result);
    };
    reader.onerror = (e) => {
      console.error("❌ Error creating preview:", e);
    };
    reader.readAsDataURL(file);
    
    setError("");
  };

  const handleDrop = (e) => {
    console.log("🔽 File drop detected");
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (!file) {
      console.log("⚠️ No file in drop event");
      return;
    }

    console.log("📄 Dropped file details:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    if (!file.type.match("image.*")) {
      console.error("❌ Invalid dropped file type:", file.type);
      setError("Please select an image file");
      return;
    }

    setImage(file);
    console.log("✅ Image state updated from drop");
    
    console.log("🔄 Creating file preview from drop...");
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("✅ Preview created from drop");
      setPreview(e.target.result);
    };
    reader.onerror = (e) => {
      console.error("❌ Error creating preview from drop:", e);
    };
    reader.readAsDataURL(file);
    
    setError("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAnalyze = async () => {
    console.log("🔍 Starting image analysis process");
    if (!image) {
      console.error("❌ Analysis attempted without an image");
      setError("Please select an image first");
      return;
    }

    console.log("⏳ Setting loading state to true");
    setLoading(true);
    setError("");

    try {
      console.log("☁️ Starting Cloudinary upload...");
      console.log("📄 Image details for upload:", {
        name: image.name,
        type: image.type,
        size: `${(image.size / 1024).toFixed(2)} KB`
      });
      
      // Upload image to Cloudinary
      const uploadResult = await uploadImage(image);
      console.log("☁️ Cloudinary upload result:", uploadResult);
      
      if (!uploadResult) {
        console.error("❌ Upload returned no result");
        throw new Error("Failed to upload image");
      }

      // Convert image to base64 for analysis
      console.log("🔄 Converting image to base64...");
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        const base64data = reader.result;
        console.log("✅ Base64 conversion complete, length:", base64data.length);
        
        // Send to backend for analysis
        console.log("🔬 Sending image for AI analysis...");
        const analysisResult = await analyzeSkinImage(base64data);
        console.log("🔬 Analysis result received:", analysisResult);
        
        // Format the result for the SkinAnalysis component
        const formattedResult = {
          imageUrl: uploadResult.secure_url,
          originalImage: preview,
          result: analysisResult // Pass the entire response object
        };
        
        onAnalysisComplete(formattedResult);
        console.log("⏳ Setting loading state to false");
        setLoading(false);
      };
      
      reader.onerror = (error) => {
        console.error("❌ Error converting image to base64:", error);
        throw new Error("Failed to process image");
      };
    } catch (error) {
      console.error("❌ Error in analysis process:", error);
      console.error("📋 Error details:", {
        message: error.message,
        stack: error.stack
      });
      setError("Error processing image: " + (error.message || "Unknown error"));
      setLoading(false);
    }
  };

  const handleReset = () => {
    console.log("🔄 Resetting image upload state");
    setImage(null);
    setPreview("");
    setError("");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-50 p-1 rounded-xl shadow-lg">
      <div className="bg-white p-6 rounded-xl">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-blue-100 p-2 rounded-full mr-2">
            <PhotoIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Upload Skin Image</h2>
        </div>
        
        <p className="text-gray-600 text-sm text-center mb-6">
          For accurate analysis, please upload a clear, well-lit image of the affected skin area
        </p>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${preview ? 'border-green-300 bg-green-50' : 'border-blue-300 hover:bg-blue-50'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          {!preview ? (
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <ArrowUpTrayIcon className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-2">Drag & drop an image here or click to browse</p>
              <p className="text-xs text-gray-500">Supported formats: JPG, PNG, WEBP</p>
              <button className="mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-sm">
                Select Image
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative mx-auto max-w-xs">
                <div className="absolute -top-2 -right-2 bg-green-100 rounded-full p-1 shadow-sm">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg shadow-sm" 
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">{image?.name}</p>
            </div>
          )}
        </div>
        
        {preview && (
          <div className="mt-6 flex justify-center space-x-4">
            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors shadow-md disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Analyze Image
                </>
              )}
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              <XMarkIcon className="h-5 w-5 mr-2" />
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
