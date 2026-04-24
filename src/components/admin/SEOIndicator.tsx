"use client";

import { FiSearch, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

interface SEOIndicatorProps {
  metaTitle?: string | null;
  metaDescription?: string | null;
  size?: "sm" | "md";
}

export default function SEOIndicator({ metaTitle, metaDescription, size = "sm" }: SEOIndicatorProps) {
  const hasTitle = metaTitle && metaTitle.length > 0;
  const hasDescription = metaDescription && metaDescription.length > 0;
  
  const score = (hasTitle ? 50 : 0) + (hasDescription ? 50 : 0);
  
  const getColor = () => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-gray-400";
  };

  const getBgColor = () => {
    if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
    if (score >= 50) return "bg-yellow-100 dark:bg-yellow-900/30";
    return "bg-gray-100 dark:bg-gray-800";
  };

  const getIcon = () => {
    if (score >= 80) return <FiCheckCircle className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />;
    if (score >= 50) return <FiSearch className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />;
    return <FiAlertCircle className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />;
  };

  const getLabel = () => {
    if (score >= 80) return "SEO OK";
    if (score >= 50) return "SEO Parcial";
    return "Sem SEO";
  };

  return (
    <span
      className={`inline-flex items-center gap-1 ${size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs"} font-medium rounded ${getBgColor()} ${getColor()}`}
      title={`Título: ${hasTitle ? "OK" : "Faltando"} | Descrição: ${hasDescription ? "OK" : "Faltando"}`}
    >
      {getIcon()}
      {getLabel()}
    </span>
  );
}
