"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { HiOutlinePhotograph, HiOutlineX, HiOutlinePlus, HiOutlineDocumentText } from "react-icons/hi";

const isBlobUploadConfigured = Boolean(process.env.NEXT_PUBLIC_BLOB_URL);

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  accept?: string;
}

function isExternalUrl(value?: string) {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

export function ImageUpload({ value, onChange, folder = "images", label, accept = "image/*" }: ImageUploadProps) {
  const isPdf = value?.toLowerCase().endsWith('.pdf');
  const isExternalImage = isExternalUrl(value);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [manualUrl, setManualUrl] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const saveManualUrl = () => {
    onChange(manualUrl.trim());
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isBlobUploadConfigured) {
      alert("Upload por arquivo não está configurado neste ambiente. Cole a URL do arquivo manualmente abaixo.");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setUploading(true);
    setProgress(0);
    
    try {
      // Upload direto para Vercel Blob (bypassa limite de 4.5MB)
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      const blob = await upload(filename, file, {
        access: "public",
        handleUploadUrl: "/api/upload/client",
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      });

      onChange(blob.url);
      setManualUrl(blob.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload indisponível neste ambiente. Cole a URL da imagem manualmente abaixo.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {value ? (
          <div className="relative w-full h-48 border border-gray-200 dark:border-zinc-700 group">
            {isPdf ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-zinc-800">
                <HiOutlineDocumentText className="h-12 w-12 text-red-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400 mt-2">PDF Carregado</span>
                <a 
                  href={value} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  Visualizar PDF
                </a>
              </div>
            ) : isExternalImage ? (
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <Image src={value} alt="Preview" fill className="object-cover" />
            )}
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 p-1.5 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <HiOutlineX className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white flex flex-col items-center justify-center gap-2 transition-colors"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin h-6 w-6 border-2 border-black dark:border-white border-t-transparent rounded-full" />
                {progress > 0 && <span className="text-sm text-gray-500">{progress}%</span>}
              </div>
            ) : (
              <>
                <HiOutlinePhotograph className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">Clique para enviar</span>
              </>
            )}
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleUpload}
          className="hidden"
        />
      </div>
      <div className="mt-3 space-y-2">
        <input
          type="url"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Cole a URL do arquivo manualmente"
          className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm"
        />
        <button
          type="button"
          onClick={saveManualUrl}
          className="px-3 py-2 border border-gray-200 dark:border-zinc-700 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Usar URL manual
        </button>
      </div>
    </div>
  );
}

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  max?: number;
}

export function GalleryUpload({ value = [], onChange, folder = "gallery", label, max = 10 }: GalleryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addManualUrl = () => {
    const normalizedUrl = manualUrl.trim();
    if (!normalizedUrl) return;
    onChange([...value, normalizedUrl].slice(0, max));
    setManualUrl("");
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (!isBlobUploadConfigured) {
      alert("Upload por arquivo não está configurado neste ambiente. Cole as URLs manualmente abaixo.");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of files) {
        const timestamp = Date.now();
        const ext = file.name.split(".").pop();
        const filename = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

        const blob = await upload(filename, file, {
          access: "public",
          handleUploadUrl: "/api/upload/client",
        });

        newUrls.push(blob.url);
      }
      onChange([...value, ...newUrls].slice(0, max));
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload indisponível neste ambiente. Cole as URLs manualmente abaixo.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="grid grid-cols-4 gap-3">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square border border-gray-200 dark:border-zinc-700 group">
            {isExternalUrl(url) ? (
              <img src={url} alt={`Gallery ${index}`} className="h-full w-full object-cover" />
            ) : (
              <Image src={url} alt={`Gallery ${index}`} fill className="object-cover" />
            )}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 p-1 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <HiOutlineX className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white flex items-center justify-center transition-colors"
          >
            {uploading ? (
              <div className="animate-spin h-5 w-5 border-2 border-black dark:border-white border-t-transparent rounded-full" />
            ) : (
              <HiOutlinePlus className="h-6 w-6 text-gray-400" />
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
      />
      <div className="mt-3 flex gap-2">
        <input
          type="url"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Cole a URL da imagem"
          className="flex-1 px-3 py-2 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white text-sm"
        />
        <button
          type="button"
          onClick={addManualUrl}
          className="px-3 py-2 border border-gray-200 dark:border-zinc-700 text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Adicionar URL
        </button>
      </div>
    </div>
  );
}
