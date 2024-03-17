import { v2 as cloudinary } from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name: 'dbhsrtwax',
  api_key: '193146164521743',
  api_secret: '8lTTckuMO5d7u8yQbsp5W2iOZxQ'
});

const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      throw new Error("No local file path provided");
    }
    // Upload the file to Cloudinary
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // File has been uploaded successfully
    console.log("File uploaded successfully to Cloudinary", res.url);
    // Return the Cloudinary response
    return res;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.message);
    // Remove the locally saved temporary file if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    // Return null to indicate upload failure
    return null;
  }
};

export { uploadCloudinary };