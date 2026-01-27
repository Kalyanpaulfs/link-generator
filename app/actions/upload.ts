"use server";

import { uploadImage } from "@/lib/cloudinary-server";

export async function uploadPaymentScreenshot(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file provided");
    }

    // Convert file to buffer or base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cloudinary expects base64 or file path. For buffer we might need stream, but base64 is easiest for data URI.
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    try {
        const url = await uploadImage(dataURI, 'payment-proofs');
        return { success: true, url };
    } catch (error) {
        console.error("Upload failed:", error);
        return { success: false, error: "Upload failed" };
    }
}
