import { Cloudinary } from "@cloudinary/url-gen";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;

// Create a Cloudinary instance (not required for upload but kept if used elsewhere)
const cld = new Cloudinary({
  cloud: {
    cloudName
  }
});

// Upload image to Cloudinary with debug logs
export const uploadImage = async (file) => {
  console.log("🛠️ Starting image upload...");
  
  if (!cloudName) {
    console.error("❌ Cloudinary cloud name is missing. Check your .env file.");
    return;
  }

  if (!file) {
    console.error("❌ File is undefined or null. Please provide a valid image file.");
    return;
  }

  console.log("📦 File details:", file);
  console.log("☁️ Using cloud name:", cloudName);
  console.log("🔧 Upload preset:", "skinimage");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "skinimage");

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    const responseText = await response.text();  // Read raw response body
    console.log("📨 Raw response text:", responseText);

    if (!response.ok) {
      console.error(`❌ Upload failed with status: ${response.status}`);
      throw new Error(`Upload failed: ${responseText}`);
    }

    const data = JSON.parse(responseText);  // Parse successful JSON
    console.log("✅ Upload successful! Cloudinary URL:", data.secure_url);
    return data.secure_url;

  } catch (error) {
    console.error("🔥 Error during Cloudinary upload:", error);
    throw error;
  }
};

export { cld };
