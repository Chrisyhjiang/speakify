"use client";

import { useState } from "react";
import { PiSpinnerThin } from "react-icons/pi";

type FileUploadProps = {
  onUploadComplete: (filename: string, fileUrl: string) => void;
};

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUpLoading, setIsUpLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async () => {
      const text = reader.result as string;
      const filename = file.name.replace(/\.[^/.]+$/, ""); // remove file extension

      try {
        setIsUpLoading(true);
        const response = await fetch(
          import.meta.env.VITE_LAMBDA_UPLOAD_ENDPOINT!,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, filename }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          setTimeout(() => {
            setIsUpLoading(false);
            onUploadComplete(`${data.name}`, `${data.url}`); // 🔁 trigger AudioList re-fetch with the converted MP3 filename
          }, 2000); // wait 4s for Lambda/Polly/S3 to catch up
        } else {
          throw new Error("Upload failed. Please try again");
        }
      } catch (error) {
        console.error("Upload failed:", error);
        if (error instanceof Error) {
          setErrorMsg(error.message);
        } else {
          setErrorMsg("An unknown error occurred.");
        }
      } finally {
        setIsUpLoading(false);
      }
    };
    // Trigger the onload by reading the file
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      {/* Custom Upload Button */}
      <div className="relative inline-block">
        <input
          type="file"
          accept=".txt"
          id="upload"
          onChange={handleFileChange}
          className="hidden"
        />
        <label
          htmlFor="upload"
          className="inline-block px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 cursor-pointer"
        >
          Choose File
        </label>
        {file && (
          <span className="ml-6 text-gray-300 text-sm">{file.name}</span>
        )}
      </div>

      {/* Upload trigger button */}
      <button
        onClick={handleUpload}
        className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 disabled:opacity-50"
        disabled={!file || isUpLoading}
      >
        Upload
      </button>

      {isUpLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <PiSpinnerThin className="animate-spin text-white text-4xl" />
        </div>
      )}
      {errorMsg && <p className="mt-2 text-sm text-red-500">{errorMsg}</p>}
    </div>
  );
}
