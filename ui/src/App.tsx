"use client";

import { useState } from "react";
import FileUpload from "./components/FileUpload";
import AudioPlayer from "./components/AudioPlayer";

export default function Page() {
  const [convertedFiles, setConvertedFiles] = useState<
    { name: string; url: string }[]
  >([]);

  const handleUploadComplete = (filename: string, fileUrl: string) => {
    setConvertedFiles((prev) => [...prev, { name: filename, url: fileUrl }]);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-500 shadow-xl rounded-2xl p-8 w-full max-w-xl">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center">
            Text-to-Speech Converter
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
            Upload a <code>.txt</code> file and we’ll convert the contents to an
            audio file using AWS Polly and Serverless Computing.
          </p>
        </div>

        <div className="text-center mt-6">
          <FileUpload onUploadComplete={handleUploadComplete} />
        </div>

        {convertedFiles.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 text-center">
              Converted Audio
            </h2>
            {convertedFiles.map((file) => (
              <div className="flex justify-center">
                <div key={file.name} className="flex items-center space-x-4">
                  <AudioPlayer url={file.url} />
                  <div className="flex items-center h-full">
                    <a
                      href={file.url}
                      download
                      className="text-blue-600 underline text-sm"
                    >
                      {file.name}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
