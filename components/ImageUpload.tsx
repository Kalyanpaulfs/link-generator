"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Upload, X, CheckCircle } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface ImageUploadProps {
    onUploadComplete: (url: string) => void;
    label?: string;
}

export function ImageUpload({ onUploadComplete, label = "Upload Payment Screenshot" }: ImageUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
            setUploadedUrl(null);

            // Auto Upload
            setUploading(true);
            try {
                const url = await uploadToCloudinary(selectedFile);
                setUploadedUrl(url);
                onUploadComplete(url);
            } catch (error) {
                console.error("Upload error", error);
                alert("Upload failed. Please try again.");
                setFile(null);
                setPreview(null);
            } finally {
                setUploading(false);
            }
        }
    };

    const handleRemove = () => {
        setFile(null);
        setPreview(null);
        setUploadedUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

            {!preview ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload screenshot</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            ) : (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img src={preview} alt="Preview" className="w-full h-48 object-cover opacity-80" />

                    {uploading ? (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="text-white font-medium animate-pulse">Uploading...</div>
                        </div>
                    ) : uploadedUrl ? (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-white rounded-full px-3 py-1 flex items-center gap-2 text-green-700 font-bold text-sm shadow-lg">
                                <CheckCircle className="h-4 w-4" /> Uploaded
                            </div>
                            <div className="absolute top-2 right-2">
                                <Button size="sm" variant="ghost" onClick={handleRemove} className="text-white hover:text-red-400">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-red-500 font-bold">Upload Failed</div>
                            <div className="absolute top-2 right-2">
                                <Button size="sm" variant="ghost" onClick={handleRemove} className="text-white hover:text-red-400">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

}
