"use client";

import { useState, useRef } from "react";
import { FiSearch, FiGlobe, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { HiOutlinePhotograph, HiOutlineX } from "react-icons/hi";
import { upload } from "@vercel/blob/client";
import Image from "next/image";

interface SEOFieldsProps {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  slug: string;
  baseUrl?: string;
  onChange: (field: string, value: string) => void;
}

export default function SEOFields({
  metaTitle,
  metaDescription,
  metaKeywords,
  ogImage,
  slug,
  baseUrl = "",
  onChange,
}: SEOFieldsProps) {
  const [activeTab, setActiveTab] = useState<"fields" | "preview">("fields");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUploadOgImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    
    try {
      const timestamp = Date.now();
      const ext = file.name.split(".").pop();
      const filename = `og-images/${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`;

      const blob = await upload(filename, file, {
        access: "public",
        handleUploadUrl: "/api/upload/client",
        onUploadProgress: (progressEvent) => {
          setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        },
      });

      onChange("ogImage", blob.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Erro ao fazer upload. Tente novamente.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // SEO Score calculation
  const calculateSEOScore = () => {
    let score = 0;
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Title checks
    if (metaTitle) {
      score += 20;
      if (metaTitle.length >= 30 && metaTitle.length <= 60) {
        score += 10;
      } else if (metaTitle.length < 30) {
        suggestions.push("Título muito curto (ideal: 30-60 caracteres)");
      } else {
        issues.push("Título muito longo (máx: 60 caracteres)");
      }
    } else {
      issues.push("Adicione um título SEO");
    }

    // Description checks
    if (metaDescription) {
      score += 20;
      if (metaDescription.length >= 120 && metaDescription.length <= 160) {
        score += 10;
      } else if (metaDescription.length < 120) {
        suggestions.push("Descrição muito curta (ideal: 120-160 caracteres)");
      } else {
        issues.push("Descrição muito longa (máx: 160 caracteres)");
      }
    } else {
      issues.push("Adicione uma descrição SEO");
    }

    // Keywords check
    if (metaKeywords) {
      score += 15;
      const keywordCount = metaKeywords.split(",").filter(k => k.trim()).length;
      if (keywordCount >= 3 && keywordCount <= 10) {
        score += 5;
      } else if (keywordCount < 3) {
        suggestions.push("Adicione mais palavras-chave (ideal: 3-10)");
      } else {
        suggestions.push("Muitas palavras-chave (ideal: 3-10)");
      }
    } else {
      suggestions.push("Adicione palavras-chave para melhorar o SEO");
    }

    // OG Image check
    if (ogImage) {
      score += 20;
    } else {
      suggestions.push("Adicione uma imagem de compartilhamento (OG Image)");
    }

    return { score, issues, suggestions };
  };

  const { score, issues, suggestions } = calculateSEOScore();

  const getScoreColor = () => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-zinc-800 px-4 py-3 border-b border-gray-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiSearch className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">SEO</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getScoreBg()}`}>
                {score}
              </div>
              <span className={`text-sm font-medium ${getScoreColor()}`}>
                {score >= 80 ? "Ótimo" : score >= 50 ? "Regular" : "Precisa melhorar"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-3">
          <button
            onClick={() => setActiveTab("fields")}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === "fields"
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Campos
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === "preview"
                ? "border-black dark:border-white text-black dark:text-white"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Preview Google
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === "fields" ? (
          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Título SEO
                </label>
                <span className={`text-xs ${metaTitle.length > 60 ? "text-red-500" : "text-gray-500"}`}>
                  {metaTitle.length}/60
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => onChange("metaTitle", e.target.value)}
                placeholder="Título que aparece nos resultados de busca"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Ideal: 30-60 caracteres. Use palavras-chave importantes no início.
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descrição SEO
                </label>
                <span className={`text-xs ${metaDescription.length > 160 ? "text-red-500" : "text-gray-500"}`}>
                  {metaDescription.length}/160
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => onChange("metaDescription", e.target.value)}
                placeholder="Descrição que aparece nos resultados de busca"
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all text-sm resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Ideal: 120-160 caracteres. Inclua uma chamada para ação.
              </p>
            </div>

            {/* Meta Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Palavras-chave
              </label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => onChange("metaKeywords", e.target.value)}
                placeholder="palavra1, palavra2, palavra3"
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separe por vírgulas. Ideal: 3-10 palavras-chave relevantes.
              </p>
            </div>

            {/* OG Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Imagem de Compartilhamento (OG Image)
              </label>
              <p className="mb-2 text-xs text-gray-500">
                Tamanho recomendado: 1200x630 pixels.
              </p>
              <div className="relative">
                {ogImage ? (
                  <div className="relative w-full max-w-md aspect-[1200/630] border border-gray-200 dark:border-zinc-700 group rounded overflow-hidden">
                    <Image 
                      src={ogImage} 
                      alt="OG Preview" 
                      fill 
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => onChange("ogImage", "")}
                      className="absolute top-2 right-2 p-1.5 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded"
                    >
                      <HiOutlineX className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full max-w-md aspect-[1200/630] border-2 border-dashed border-gray-300 dark:border-zinc-700 hover:border-black dark:hover:border-white flex flex-col items-center justify-center gap-2 transition-colors rounded"
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin h-6 w-6 border-2 border-black dark:border-white border-t-transparent rounded-full" />
                        {progress > 0 && <span className="text-sm text-gray-500">{progress}%</span>}
                      </div>
                    ) : (
                      <>
                        <HiOutlinePhotograph className="h-8 w-8 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Clique para enviar imagem</span>
                        <span className="text-xs text-gray-400">1200x630 pixels</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadOgImage}
                  className="hidden"
                />
              </div>
            </div>

            {/* Issues & Suggestions */}
            {(issues.length > 0 || suggestions.length > 0) && (
              <div className="pt-4 border-t border-gray-200 dark:border-zinc-700 space-y-3">
                {issues.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-600 flex items-center gap-1 mb-2">
                      <FiAlertCircle className="w-4 h-4" />
                      Problemas
                    </h4>
                    <ul className="space-y-1">
                      {issues.map((issue, i) => (
                        <li key={i} className="text-xs text-red-600 flex items-start gap-1">
                          <span className="mt-0.5">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-600 flex items-center gap-1 mb-2">
                      <FiCheckCircle className="w-4 h-4" />
                      Sugestões
                    </h4>
                    <ul className="space-y-1">
                      {suggestions.map((suggestion, i) => (
                        <li key={i} className="text-xs text-yellow-600 flex items-start gap-1">
                          <span className="mt-0.5">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google Search Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FiGlobe className="w-4 h-4" />
                Como aparecerá no Google
              </h4>
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 max-w-2xl">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                    <span className="text-[8px]">S</span>
                  </div>
                  <span>seusite.com.br</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  {baseUrl}/{slug}
                </div>
                <h3 className="text-lg text-blue-700 dark:text-blue-400 hover:underline cursor-pointer font-medium mb-1 line-clamp-1">
                  {metaTitle || "Adicione um título SEO"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {metaDescription || "Adicione uma descrição SEO para ver como ela aparecerá nos resultados de busca do Google."}
                </p>
              </div>
            </div>

            {/* Social Media Preview */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FiGlobe className="w-4 h-4" />
                Preview em Redes Sociais
              </h4>
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden max-w-md">
                <div className="aspect-[1200/630] bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                  {ogImage ? (
                    <img
                      src={ogImage}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).parentElement!.innerHTML = 
                          '<div class="flex items-center justify-center w-full h-full text-gray-400 text-sm">Imagem não encontrada</div>';
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Sem imagem OG</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-500 uppercase mb-1">seusite.com.br</p>
                  <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm">
                    {metaTitle || "Título SEO"}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                    {metaDescription || "Descrição SEO"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
