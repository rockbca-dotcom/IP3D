"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineCheck,
  HiOutlineCube,
  HiOutlinePlus,
  HiOutlineSave,
  HiOutlineTrash,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface FeatureItem {
  title: string;
  description: string;
}

interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

interface PersonalizadosConfig {
  heroImage?: string;
  heroTagline?: string;
  heroTitle?: string;
  heroHighlight?: string;
  heroDescription?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  features: FeatureItem[];
  processSteps: ProcessStep[];
}

const DEFAULT_CONFIG: PersonalizadosConfig = {
  heroImage: "/images/pesonalizados-hero.jpg",
  heroTagline: "Impressão 3D Sob Demanda",
  heroTitle: "Transformamos suas",
  heroHighlight: "ideias",
  heroDescription:
    "Impressão 3D sob demanda para protótipos e peças finais com qualidade profissional.",
  ctaTitle: "Tem um projeto em mente?",
  ctaDescription:
    "Entre em contato conosco e transforme sua ideia em realidade. Orçamento sem compromisso!",
  features: [
    {
      title: "Modelagem 3D",
      description: "Criamos o modelo 3D a partir do seu desenho, foto ou ideia.",
    },
    {
      title: "Materiais Diversos",
      description: "PLA, PETG, ABS, TPU flexível, fibra de carbono e mais.",
    },
    {
      title: "Alta Precisão",
      description: "Impressão com resolução de até 0.1mm para detalhes perfeitos.",
    },
    {
      title: "Entrega Rápida",
      description: "Prazos ágeis para projetos urgentes.",
    },
  ],
  processSteps: [
    {
      step: "01",
      title: "Envie sua ideia",
      description: "Mande seu arquivo 3D, desenho, foto ou descrição do que precisa.",
    },
    {
      step: "02",
      title: "Orçamento",
      description: "Analisamos seu projeto e enviamos um orçamento detalhado.",
    },
    {
      step: "03",
      title: "Aprovação",
      description: "Após aprovação, iniciamos a produção da sua peça.",
    },
    {
      step: "04",
      title: "Entrega",
      description: "Sua peça é finalizada e enviada com todo cuidado.",
    },
  ],
};

export default function PersonalizadosAdminPage() {
  const [config, setConfig] = useState<PersonalizadosConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadConfig = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/layout?type=page-personalizados&variant=main");
      const data = await response.json();
      setConfig({
        ...DEFAULT_CONFIG,
        ...(data.config?.content || {}),
        features: data.config?.content?.features || DEFAULT_CONFIG.features,
        processSteps: data.config?.content?.processSteps || DEFAULT_CONFIG.processSteps,
      });
    } catch (error) {
      console.error("Error loading personalizados config:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadConfig();
    });
  }, [loadConfig]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "page-personalizados",
          variant: "main",
          content: config,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error saving personalizados config:", error);
      alert("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof PersonalizadosConfig>(field: K, value: PersonalizadosConfig[K]) {
    setConfig((previous) => ({ ...previous, [field]: value }));
  }

  function updateFeature(index: number, field: keyof FeatureItem, value: string) {
    const next = [...config.features];
    next[index] = { ...next[index], [field]: value };
    updateField("features", next);
  }

  function addFeature() {
    updateField("features", [...config.features, { title: "", description: "" }]);
  }

  function removeFeature(index: number) {
    updateField(
      "features",
      config.features.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  function updateProcessStep(index: number, field: keyof ProcessStep, value: string) {
    const next = [...config.processSteps];
    next[index] = { ...next[index], [field]: value };
    updateField("processSteps", next);
  }

  function addProcessStep() {
    const nextStepNumber = String(config.processSteps.length + 1).padStart(2, "0");
    updateField("processSteps", [
      ...config.processSteps,
      { step: nextStepNumber, title: "", description: "" },
    ]);
  }

  function removeProcessStep(index: number) {
    updateField(
      "processSteps",
      config.processSteps.filter((_, currentIndex) => currentIndex !== index),
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Página Personalizados
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Edite o hero, os diferenciais, o processo e a CTA da página de personalizados
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saved ? (
            <>
              <HiOutlineCheck className="w-4 h-4 mr-2" />
              Salvo!
            </>
          ) : (
            <>
              <HiOutlineSave className="w-4 h-4 mr-2" />
              {saving ? "Salvando..." : "Salvar"}
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <HiOutlineCube className="w-5 h-5" />
            Hero
          </h2>

          <ImageUpload
            value={config.heroImage || ""}
            onChange={(value) => updateField("heroImage", value)}
            label="Imagem de fundo"
            folder="layout"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-1 text-sm">
              <span className="block text-gray-700 dark:text-gray-300">Tagline</span>
              <input
                type="text"
                value={config.heroTagline || ""}
                onChange={(event) => updateField("heroTagline", event.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>

            <label className="space-y-1 text-sm">
              <span className="block text-gray-700 dark:text-gray-300">Destaque do título</span>
              <input
                type="text"
                value={config.heroHighlight || ""}
                onChange={(event) => updateField("heroHighlight", event.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </label>
          </div>

          <label className="space-y-1 text-sm">
            <span className="block text-gray-700 dark:text-gray-300">Título</span>
            <input
              type="text"
              value={config.heroTitle || ""}
              onChange={(event) => updateField("heroTitle", event.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="block text-gray-700 dark:text-gray-300">Descrição</span>
            <textarea
              value={config.heroDescription || ""}
              onChange={(event) => updateField("heroDescription", event.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </label>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="font-medium text-gray-900 dark:text-white">CTA final</h2>

          <label className="space-y-1 text-sm">
            <span className="block text-gray-700 dark:text-gray-300">Título da CTA</span>
            <input
              type="text"
              value={config.ctaTitle || ""}
              onChange={(event) => updateField("ctaTitle", event.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="block text-gray-700 dark:text-gray-300">Descrição da CTA</span>
            <textarea
              value={config.ctaDescription || ""}
              onChange={(event) => updateField("ctaDescription", event.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </label>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-gray-900 dark:text-white">Diferenciais</h2>
            <button
              onClick={addFeature}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.features.map((feature, index) => (
              <motion.div
                key={`${feature.title}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">Item {index + 1}</span>
                  <button
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={feature.title}
                  onChange={(event) => updateFeature(index, "title", event.target.value)}
                  placeholder="Título"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <textarea
                  value={feature.description}
                  onChange={(event) => updateFeature(index, "description", event.target.value)}
                  placeholder="Descrição"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-gray-900 dark:text-white">Processo</h2>
            <button
              onClick={addProcessStep}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <HiOutlinePlus className="w-4 h-4" />
              Adicionar
            </button>
          </div>

          <div className="space-y-4">
            {config.processSteps.map((step, index) => (
              <motion.div
                key={`${step.step}-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-3 items-start">
                  <input
                    type="text"
                    value={step.step}
                    onChange={(event) => updateProcessStep(index, "step", event.target.value)}
                    placeholder="01"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={step.title}
                      onChange={(event) => updateProcessStep(index, "title", event.target.value)}
                      placeholder="Título"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <textarea
                      value={step.description}
                      onChange={(event) =>
                        updateProcessStep(index, "description", event.target.value)
                      }
                      placeholder="Descrição"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeProcessStep(index)}
                    className="text-red-500 hover:text-red-700 mt-2"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
