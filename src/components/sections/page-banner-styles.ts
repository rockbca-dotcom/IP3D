export const STANDARD_PAGE_BANNER_HEADER_OFFSET = "10.5rem";

export const STANDARD_PAGE_BANNER_CLASS = [
  "relative overflow-hidden flex items-center",
  "py-16 lg:py-20",
  `min-h-[calc(100svh-${STANDARD_PAGE_BANNER_HEADER_OFFSET})]`,
].join(" ");

export function limitWords(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(" ");
}

const HERO_COPY_RULES: Array<{ test: (text: string) => boolean; value: string }> = [
  {
    test: (text) => text === "Sua parceira em" || text === "Sua parceira em impressão 3D",
    value: "Especialistas em impressão 3D",
  },
  {
    test: (text) => text.includes("A IP3D é especializada em peças, componentes e serviços de impressão 3D"),
    value: "Peças, componentes e impressão 3D com suporte técnico para projetos sob medida.",
  },
  {
    test: (text) => text.includes("Peças, componentes e acessórios") && text.includes("impressora 3D"),
    value: "Componentes para impressoras 3D",
  },
  {
    test: (text) => text.includes("Serviço de impressão 3D personalizada para projetos únicos"),
    value: "Impressão 3D sob demanda para protótipos e peças finais com qualidade profissional.",
  },
];

export function normalizeHeroCopy(text: string): string {
  const trimmed = text.trim();
  const matchedRule = HERO_COPY_RULES.find((rule) => rule.test(trimmed));
  return matchedRule?.value || trimmed;
}
