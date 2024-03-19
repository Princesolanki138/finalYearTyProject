import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dbhsrtwax',
  api_key: '193146164521743',
  api_secret: '8lTTckuMO5d7u8yQbsp5W2iOZxQ'
});

const uploadCloudinary = async (localFilePaths) => {
  try {
    if (!localFilePaths) {
      throw new Error("No local file paths provided");
    }

    const uploadedImageUrls = [];

    for (const localFilePath of localFilePaths) {
      if (localFilePath) {
        const res = await cloudinary.uploader.upload(localFilePath, {
          resource_type: "auto",
        });

        if (res && res.url) {
          uploadedImageUrls.push(res.url);
          console.log("File uploaded successfully to Cloudinary:", res.url);
        } else {
          console.error("Error uploading file to Cloudinary:", res);
        }
      }
    }

    for (const localFilePath of localFilePaths) {
      if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }

    return uploadedImageUrls;
  } catch (error) {
    console.error("Error uploading files to Cloudinary:", error.message);

    for (const localFilePath of localFilePaths) {
      if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    }

    return null;
  }
};

export { uploadCloudinary };
