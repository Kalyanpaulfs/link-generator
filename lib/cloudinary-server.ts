import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: string, folder: string) => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            resource_type: "auto",
        });
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error("Failed to upload image");
    }
};
