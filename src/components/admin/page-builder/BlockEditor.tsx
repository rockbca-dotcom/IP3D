"use client";

import { useState } from "react";
import Image from "next/image";
import { HiOutlineUpload, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";

interface BlockEditorProps {
  type: string;
  content: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
}

export function BlockEditor({ type, content, onChange }: BlockEditorProps) {
  const updateField = (field: string, value: unknown) => {
    onChange({ ...content, [field]: value });
  };

  switch (type) {
    case "hero":
      return <HeroEditor content={content} onChange={onChange} />;
    case "text":
      return <TextEditor content={content} onChange={onChange} />;
    case "gallery":
      return <GalleryEditor content={content} onChange={onChange} />;
    case "video":
      return <VideoEditor content={content} onChange={onChange} />;
    case "features":
      return <FeaturesEditor content={content} onChange={onChange} />;
    case "cta":
      return <CTAEditor content={content} onChange={onChange} />;
    case "cards":
      return <CardsEditor content={content} onChange={onChange} />;
    default:
      return (
        <div className="text-gray-500">
          Editor não disponível para este tipo de bloco
        </div>
      );
  }
}

// Hero Block Editor
function HeroEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        onChange({ ...content, image: data.url });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Badge
          </label>
          <input
            type="text"
            value={(content.badge as string) || ""}
            onChange={(e) => onChange({ ...content, badge: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            placeholder="Ex: Novidade"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alinhamento
          </label>
          <select
            value={(content.align as string) || "center"}
            onChange={(e) => onChange({ ...content, align: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="left">Esquerda</option>
            <option value="center">Centro</option>
            <option value="right">Direita</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título *
        </label>
        <input
          type="text"
          value={(content.title as string) || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="Título principal"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subtítulo
        </label>
        <input
          type="text"
          value={(content.subtitle as string) || ""}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="Subtítulo"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descrição
        </label>
        <textarea
          value={(content.description as string) || ""}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="Descrição do hero"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Imagem de Fundo
        </label>
        <div className="flex items-center gap-4">
          {(content.image as string) && (
            <div className="relative w-32 h-20 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
              <Image
                src={content.image as string}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <HiOutlineUpload className="w-4 h-4" />
            <span className="text-sm">{uploading ? "Enviando..." : "Upload"}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL do Vídeo (opcional)
        </label>
        <input
          type="url"
          value={(content.video as string) || ""}
          onChange={(e) => onChange({ ...content, video: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="https://youtube.com/..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Overlay (escurecer imagem): {String((content.overlay as number) || 60)}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={(content.overlay as number) || 60}
          onChange={(e) => onChange({ ...content, overlay: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Botão 1 - Texto
          </label>
          <input
            type="text"
            value={(content.button1Text as string) || ""}
            onChange={(e) => onChange({ ...content, button1Text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Botão 1 - Link
          </label>
          <input
            type="text"
            value={(content.button1Link as string) || ""}
            onChange={(e) => onChange({ ...content, button1Link: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Botão 2 - Texto
          </label>
          <input
            type="text"
            value={(content.button2Text as string) || ""}
            onChange={(e) => onChange({ ...content, button2Text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Botão 2 - Link
          </label>
          <input
            type="text"
            value={(content.button2Link as string) || ""}
            onChange={(e) => onChange({ ...content, button2Link: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
}

// Text Block Editor
function TextEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Alinhamento
          </label>
          <select
            value={(content.align as string) || "left"}
            onChange={(e) => onChange({ ...content, align: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="left">Esquerda</option>
            <option value="center">Centro</option>
            <option value="right">Direita</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Fundo
          </label>
          <select
            value={(content.background as string) || "white"}
            onChange={(e) => onChange({ ...content, background: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="white">Branco</option>
            <option value="gray">Cinza</option>
            <option value="black">Preto</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subtítulo
        </label>
        <input
          type="text"
          value={(content.subtitle as string) || ""}
          onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="Subtítulo pequeno"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título
        </label>
        <input
          type="text"
          value={(content.title as string) || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="Título da seção"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Conteúdo
        </label>
        <textarea
          value={(content.content as string) || ""}
          onChange={(e) => onChange({ ...content, content: e.target.value })}
          rows={6}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="Conteúdo do texto..."
        />
      </div>
    </div>
  );
}

// Gallery Block Editor
function GalleryEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const [uploading, setUploading] = useState(false);
  const images = (content.images as string[]) || [];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        onChange({ ...content, images: [...images, data.url] });
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange({ ...content, images: newImages });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título
          </label>
          <input
            type="text"
            value={(content.title as string) || ""}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Colunas
          </label>
          <select
            value={(content.columns as number) || 3}
            onChange={(e) => onChange({ ...content, columns: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value={2}>2 colunas</option>
            <option value={3}>3 colunas</option>
            <option value={4}>4 colunas</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Imagens
        </label>
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, index) => (
            <div key={index} className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded overflow-hidden group">
              <Image src={img} alt={`Image ${index}`} fill className="object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <HiOutlineTrash className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500">
            {uploading ? (
              <span className="text-xs text-gray-500">...</span>
            ) : (
              <HiOutlinePlus className="w-6 h-6 text-gray-400" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

// Video Block Editor
function VideoEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título (opcional)
        </label>
        <input
          type="text"
          value={(content.title as string) || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          URL do Vídeo (YouTube ou Vimeo)
        </label>
        <input
          type="url"
          value={(content.url as string) || ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          placeholder="https://youtube.com/watch?v=..."
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(content.autoplay as boolean) || false}
            onChange={(e) => onChange({ ...content, autoplay: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Autoplay</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={(content.controls as boolean) !== false}
            onChange={(e) => onChange({ ...content, controls: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Mostrar controles</span>
        </label>
      </div>
    </div>
  );
}

// Features Block Editor
function FeaturesEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const items = (content.items as Array<{ icon: string; title: string; description: string }>) || [];

  const addItem = () => {
    onChange({
      ...content,
      items: [...items, { icon: "star", title: "Nova Feature", description: "Descrição" }],
    });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...content, items: newItems });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange({ ...content, items: newItems });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título
          </label>
          <input
            type="text"
            value={(content.title as string) || ""}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Colunas
          </label>
          <select
            value={(content.columns as number) || 3}
            onChange={(e) => onChange({ ...content, columns: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value={2}>2 colunas</option>
            <option value={3}>3 colunas</option>
            <option value={4}>4 colunas</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Features
        </label>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-sm"
                  placeholder="Título"
                />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-sm"
                  placeholder="Descrição"
                />
              </div>
              <button
                onClick={() => removeItem(index)}
                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
              >
                <HiOutlineTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600"
          >
            + Adicionar Feature
          </button>
        </div>
      </div>
    </div>
  );
}

// CTA Block Editor
function CTAEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título
        </label>
        <input
          type="text"
          value={(content.title as string) || ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descrição
        </label>
        <textarea
          value={(content.description as string) || ""}
          onChange={(e) => onChange({ ...content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Texto do Botão
          </label>
          <input
            type="text"
            value={(content.buttonText as string) || ""}
            onChange={(e) => onChange({ ...content, buttonText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link do Botão
          </label>
          <input
            type="text"
            value={(content.buttonLink as string) || ""}
            onChange={(e) => onChange({ ...content, buttonLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cor de Fundo
        </label>
        <select
          value={(content.background as string) || "black"}
          onChange={(e) => onChange({ ...content, background: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          <option value="white">Branco</option>
          <option value="gray">Cinza</option>
          <option value="black">Preto</option>
        </select>
      </div>
    </div>
  );
}

// Cards Block Editor
function CardsEditor({ content, onChange }: { content: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const cards = (content.cards as Array<{ image: string; title: string; description: string; link: string }>) || [];

  const addCard = () => {
    onChange({
      ...content,
      cards: [...cards, { image: "", title: "Novo Card", description: "Descrição", link: "" }],
    });
  };

  const updateCard = (index: number, field: string, value: string) => {
    const newCards = [...cards];
    newCards[index] = { ...newCards[index], [field]: value };
    onChange({ ...content, cards: newCards });
  };

  const removeCard = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    onChange({ ...content, cards: newCards });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título
          </label>
          <input
            type="text"
            value={(content.title as string) || ""}
            onChange={(e) => onChange({ ...content, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Colunas
          </label>
          <select
            value={(content.columns as number) || 3}
            onChange={(e) => onChange({ ...content, columns: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value={2}>2 colunas</option>
            <option value={3}>3 colunas</option>
            <option value={4}>4 colunas</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cards
        </label>
        <div className="space-y-3">
          {cards.map((card, index) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => updateCard(index, "title", e.target.value)}
                  className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-sm"
                  placeholder="Título"
                />
                <input
                  type="text"
                  value={card.link}
                  onChange={(e) => updateCard(index, "link", e.target.value)}
                  className="px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-sm"
                  placeholder="Link"
                />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={card.description}
                  onChange={(e) => updateCard(index, "description", e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-sm"
                  placeholder="Descrição"
                />
                <button
                  onClick={() => removeCard(index)}
                  className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addCard}
            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600"
          >
            + Adicionar Card
          </button>
        </div>
      </div>
    </div>
  );
}
