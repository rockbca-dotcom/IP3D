"use client";

import { useRef, useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { 
  HiArrowLeft, 
  HiArrowRight, 
  HiOutlinePlay,
  HiOutlineCheck,
  HiOutlineInformationCircle,
  HiOutlinePhone,
  HiX
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import CheckoutButton from "@/components/site/CheckoutButton";
import { ShippingCalculator, type ShippingSelection } from "@/components/shipping-calculator";
import { addToCart } from "@/lib/cart";

function stripHtml(html: string | null): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").trim();
}

function formatCurrency(value?: number | null) {
  if (!value) return null;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  image: string;
  gallery: string[];
  features: string[];
  video: string | null;
  catalog: string | null;
  warranty: string | null;
  priceOriginal: number | null;
  pricePromo: number | null;
  pixPrice: number | null;
  installments: number | null;
  installmentValue: number | null;
  stockQuantity: number;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brands?: {
    brand: {
      id: string;
      name: string;
      slug: string;
      logo: string | null;
    };
  }[];
  specifications: {
    label: string;
    value: string;
  }[];
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  image: string;
  category: {
    name: string;
  } | null;
  priceOriginal: number | null;
  pricePromo: number | null;
}

const fallbackWhatsappPhone = "5511999999999";

const fallbackProducts: Product[] = [
  {
    id: "fallback-hotend-creality-ender-3-v2",
    name: "Kit Hotend Completo Creality Ender 3 / Pro / V2 24V",
    slug: "kit-hotend-completo-creality-ender-3-pro-v2-24v-nozzle-cortesia",
    shortDescription: "Kit hotend completo 24V para Ender 3 / Pro / V2 com nozzle de cortesia, cabo de 1 metro e instalação prática.",
    description: "<p>Kit hotend completo para impressoras 3D Creality Ender 3, Ender 3 Pro e Ender 3 V2 com tensão de operação de 24V. É uma reposição técnica pensada para restaurar a qualidade de extrusão, facilitar a manutenção e entregar instalação prática no dia a dia.</p><p>O conjunto acompanha nozzle 0,4 mm de cortesia, silicone protetor do bloco, cabo de conexão com 1 metro, tubo PTFE e componentes para reposição completa do sistema de aquecimento. Suporta até 260 °C e atende impressões com PLA, ABS, PETG, TPU e outros materiais compatíveis com essa faixa térmica.</p><p>Seu bloco de aquecimento em alumínio, termistor de alta precisão e resistor cerâmico oferecem desempenho estável, aquecimento eficiente e boa confiabilidade para uso contínuo.</p>",
    image: "https://http2.mlstatic.com/D_Q_NP_607343-MLA110079794477_042026-F.webp",
    gallery: [
      "https://http2.mlstatic.com/D_Q_NP_607343-MLA110079794477_042026-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_656866-MLA110079853361_042026-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_826407-MLA109232233940_042026-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_685769-MLA108560014753_032026-F.webp"
    ],
    features: [
      "Compatível com Creality Ender 3, Ender 3 Pro e Ender 3 V2",
      "Tensão de operação 24V com temperatura máxima de 260 °C",
      "Acompanha nozzle 0,4 mm de cortesia e silicone protetor",
      "Inclui cabo de conexão de 1 metro e tubo PTFE",
      "Instalação prática com encaixe compatível no padrão original",
      "Ideal para manutenção e reposição completa do hotend"
    ],
    video: null,
    catalog: null,
    warranty: "90 dias",
    priceOriginal: 129.9,
    pricePromo: 119.99,
    pixPrice: 119.99,
    installments: 4,
    installmentValue: 30,
    stockQuantity: 25,
    category: { id: "componentes-creality", name: "Componentes Creality", slug: "componentes-creality" },
    specifications: [
      { label: "Compatibilidade", value: "Creality Ender 3 / Ender 3 Pro / Ender 3 V2" },
      { label: "Marca", value: "Creality" },
      { label: "Modelo", value: "2001020048" },
      { label: "Tensão de operação", value: "24V" },
      { label: "Temperatura máxima", value: "260 °C" },
      { label: "Tipo de entrada", value: "Bowden" },
      { label: "Diâmetro do bico", value: "0,4 mm" },
      { label: "Diâmetro do filamento", value: "1,75 mm" },
      { label: "Material", value: "Liga de alumínio com aquecedor cerâmico" },
      { label: "Itens inclusos", value: "Hotend, nozzle de cortesia, silicone protetor e tubo PTFE" }
    ],
  },
  {
    id: "fallback-silicone-creality-k1-max",
    name: "Capa De Silicone Blue Makers Creality",
    slug: "capa-de-silicone-blue-makers-creality-k1-max-antiaderente-300c",
    shortDescription: "Capa antiaderente em silicone para Creality K1 / K1 Max com resistência térmica de até 300°C.",
    description: "<p>Capa de silicone desenvolvida para melhorar a estabilidade térmica do bloco aquecedor e reduzir o acúmulo de resíduos durante a impressão. Ideal para manutenção preventiva e melhor acabamento nas peças.</p>",
    image: "https://http2.mlstatic.com/D_Q_NP_770204-MLA100095605391_122025-F.webp",
    gallery: [
      "https://http2.mlstatic.com/D_Q_NP_770204-MLA100095605391_122025-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_817420-MLA99610440976_122025-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_780886-MLA99610470822_122025-F.webp"
    ],
    features: [
      "Compatível com Creality K1 e K1 Max",
      "Silicone antiaderente resistente a até 300°C",
      "Ajuda a estabilizar a temperatura do hotend",
      "Instalação simples e rápida"
    ],
    video: null,
    catalog: null,
    warranty: "90 dias",
    priceOriginal: 19,
    pricePromo: 19,
    pixPrice: 18.75,
    installments: 3,
    installmentValue: 6.33,
    stockQuantity: 12,
    category: { id: "componentes-creality", name: "Componentes Creality", slug: "componentes-creality" },
    specifications: [
      { label: "Compatibilidade", value: "Creality K1 / K1 Max" },
      { label: "Material", value: "Silicone térmico" },
      { label: "Temperatura máxima", value: "300°C" },
      { label: "Aplicação", value: "Proteção do bloco aquecedor" }
    ],
  },
  {
    id: "fallback-hotend-bambu-a1",
    name: "Hotend Bambu Lab A1 Mini",
    slug: "hotend-bambu-lab-a1-mini",
    shortDescription: "Reposição premium para impressão com precisão e consistência.",
    description: "<p>Hotend de reposição para Bambu Lab A1 Mini com foco em estabilidade térmica, qualidade de extrusão e manutenção simplificada.</p>",
    image: "/uploads/products/bico-nozzle-aco-endurecido-bambu-lab-a1.jpg",
    gallery: ["/uploads/products/bico-nozzle-aco-endurecido-bambu-lab-a1.jpg"],
    features: [
      "Compatível com Bambu Lab A1 Mini",
      "Excelente estabilidade térmica",
      "Reposição rápida para manutenção",
      "Ideal para uso contínuo"
    ],
    video: null,
    catalog: null,
    warranty: "90 dias",
    priceOriginal: 199.9,
    pricePromo: 179.9,
    pixPrice: 169.9,
    installments: 6,
    installmentValue: 29.98,
    stockQuantity: 8,
    category: { id: "componentes-bambu-lab", name: "Componentes Bambu Lab", slug: "componentes-bambu-lab" },
    specifications: [
      { label: "Compatibilidade", value: "Bambu Lab A1 Mini" },
      { label: "Tipo", value: "Hotend completo" },
      { label: "Aplicação", value: "Reposição / manutenção" }
    ],
  },
  {
    id: "fallback-termistor-2x-100k",
    name: "Termistor 2x 100k Ohm NTC 3950 Sensor de Temperatura 3D",
    slug: "termistor-2x-100k-ohm-ntc-3950-sensor-de-temperatura-3d",
    shortDescription: "Kit com 2 sensores NTC 100K 3950 para impressoras 3D, com cabo em teflon de 1 m, precisão de ±1% e faixa de -40 °C a 300 °C.",
    description: "<p>Kit com 2 sensores NTC 100K 3950 para uso em impressoras 3D, ideal para reposição técnica e controle preciso de temperatura.</p><p>O conjunto utiliza cabo em teflon de 1 metro, suporta faixa ampla de operação e atende aplicações que exigem alta confiabilidade térmica.</p>",
    image: "https://http2.mlstatic.com/D_Q_NP_875575-MLA100083141047_122025-R.webp",
    gallery: [
      "https://http2.mlstatic.com/D_Q_NP_875575-MLA100083141047_122025-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_746833-MLA81060561687_112024-F.webp",
      "https://http2.mlstatic.com/D_Q_NP_707940-MLA80795524864_112024-F.webp"
    ],
    features: [
      "Kit com 2 unidades",
      "Cabo em teflon de 1 metro",
      "Faixa de operação de -40 °C a 300 °C",
      "Precisão de ±1%"
    ],
    video: null,
    catalog: null,
    warranty: "90 dias",
    priceOriginal: 35,
    pricePromo: 31.9,
    pixPrice: 31.9,
    installments: 3,
    installmentValue: 10.63,
    stockQuantity: 25,
    category: { id: "componentes-universais", name: "Componentes Universais", slug: "componentes-universais" },
    specifications: [
      { label: "Compatibilidade", value: "Impressoras 3D" },
      { label: "Tipo", value: "NTC 100K 3950" },
      { label: "Quantidade", value: "2 unidades" },
      { label: "Cabo", value: "Teflon 1 m" },
      { label: "Faixa de temperatura", value: "-40 °C a 300 °C" },
      { label: "Precisão", value: "±1%" }
    ],
  },
  {
    id: "fallback-termistor-ntc",
    name: "Termistor NTC 100K",
    slug: "termistor-ntc-100k-3950",
    shortDescription: "Sensor de temperatura estável para hotends universais.",
    description: "<p>Sensor de temperatura estável para hotends universais, indicado para reposição e uso contínuo em impressoras 3D.</p>",
    image: "/images/products/components-placeholder.svg",
    gallery: ["/images/products/components-placeholder.svg"],
    features: [
      "Precisão 1%",
      "Curva Beta 3950",
      "Temperatura de operação até 200 °C"
    ],
    video: null,
    catalog: null,
    warranty: "3 meses",
    priceOriginal: 34.9,
    pricePromo: null,
    pixPrice: 29.9,
    installments: 0,
    installmentValue: null,
    stockQuantity: 100,
    category: { id: "componentes-universais", name: "Componentes Universais", slug: "componentes-universais" },
    specifications: [
      { label: "Tipo", value: "NTC 100K 3950" },
      { label: "Temperatura suportada", value: "Até 200 °C" }
    ],
  },
  {
    id: "fallback-hotend-creality-cr10",
    name: "Hotend Creality CR10",
    slug: "hotend-creality-cr10",
    shortDescription: "Reposição técnica para impressoras Creality.",
    description: "<p>Hotend de reposição para a linha CR10 com montagem simples e ótimo desempenho térmico.</p>",
    image: "/uploads/products/kit-hotend-creality-cr-10.jpg",
    gallery: ["/uploads/products/kit-hotend-creality-cr-10.jpg"],
    features: [
      "Compatível com CR10",
      "Boa estabilidade de impressão",
      "Instalação prática",
      "Peça de reposição"
    ],
    video: null,
    catalog: null,
    warranty: "90 dias",
    priceOriginal: 149.9,
    pricePromo: 129.9,
    pixPrice: 123.9,
    installments: 5,
    installmentValue: 25.98,
    stockQuantity: 6,
    category: { id: "componentes-creality", name: "Componentes Creality", slug: "componentes-creality" },
    specifications: [
      { label: "Compatibilidade", value: "Creality CR10" },
      { label: "Tipo", value: "Hotend" }
    ],
  },
];

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showTechInfo, setShowTechInfo] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingSelection, setShippingSelection] = useState<ShippingSelection | null>(null);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    fetch("/api/layout?type=header")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("layout-unavailable"))))
      .then((data) => {
        const phone: string = data.config?.content?.contactPhone ?? "";
        const digits = phone.replace(/\D/g, "");
        if (digits) {
          setWhatsappPhone(digits.length >= 12 ? digits : `55${digits}`);
        } else {
          setWhatsappPhone(fallbackWhatsappPhone);
        }
      })
      .catch(() => {
        setWhatsappPhone(fallbackWhatsappPhone);
      });
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    fetch(`/api/products/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("product-unavailable"))))
      .then((data) => {
        if (data.error || !data.product) {
          setProduct(null);
          setRelatedProducts([]);
          return;
        }

        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      })
      .catch(() => {
        const fallbackProduct = fallbackProducts.find((item) => item.slug === slug) ?? null;

        if (!fallbackProduct) {
          setProduct(null);
          setRelatedProducts([]);
          return;
        }

        const fallbackRelated = fallbackProducts
          .filter((item) => item.slug !== slug && item.category?.slug === fallbackProduct.category?.slug)
          .slice(0, 3)
          .map((item) => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            shortDescription: item.shortDescription || "",
            image: item.image,
            category: item.category ? { name: item.category.name } : null,
            priceOriginal: item.priceOriginal,
            pricePromo: item.pricePromo,
          }));

        setProduct(fallbackProduct);
        setRelatedProducts(fallbackRelated);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);
  const mainPrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice;
  const pixPrice = product.pixPrice;
  const installments = product.installments && product.installmentValue ? {
    count: product.installments,
    value: product.installmentValue,
  } : null;

  const maxQuantity = product.stockQuantity ?? 0;
  const subtotal = mainPrice ? mainPrice * quantity : null;
  const shippingCost = shippingSelection?.price ?? 0;
  const totalWithShipping = subtotal !== null ? subtotal + shippingCost : null;

  const handleQuantityChange = (next: number) => {
    if (next < 1) return;
    if (maxQuantity && next > maxQuantity) {
      setQuantity(maxQuantity);
      return;
    }
    setQuantity(next);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (maxQuantity === 0) {
      setCartMessage("Produto esgotado no momento.");
      return;
    }

    const basePrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;

    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: basePrice,
      quantity,
      maxQuantity,
    });
    setCartMessage("Produto adicionado ao carrinho!");
    setTimeout(() => setCartMessage(null), 4000);
  };

  return (
    <>
      {/* Breadcrumb */}
      <section className="pt-28 pb-4 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/produtos" className="hover:text-black transition-colors">
              Produtos
            </Link>
            <span>/</span>
            <span className="text-black">{product.name}</span>
          </nav>
        </div>
      </section>

      {/* Product Detail */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] gap-12 lg:gap-20 items-start">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div className="relative aspect-square w-full max-w-[560px] mx-auto rounded-2xl border border-gray-200 bg-white mb-4 overflow-hidden">
                <div
                  className="absolute inset-0 transition-all duration-500 bg-no-repeat"
                  style={{
                    backgroundImage: `url(${allImages[activeImage]})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                  }}
                />
                
                {/* Video Button */}
                {product.video && (
                  <button className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-black text-white text-sm hover:bg-gray-800 transition-colors">
                    <HiOutlinePlay className="w-5 h-5" />
                    Ver Vídeo
                  </button>
                )}

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Imagem anterior"
                    >
                      <HiArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                      aria-label="Próxima imagem"
                    >
                      <HiArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex flex-wrap gap-3 max-w-[560px]">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative w-20 h-20 rounded-lg border border-gray-200 bg-white overflow-hidden transition-all duration-300 ${
                        activeImage === index ? "ring-2 ring-black" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-no-repeat"
                        style={{
                          backgroundImage: `url(${img})`,
                          backgroundSize: "contain",
                          backgroundPosition: "center",
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-4 mb-3">
                <span className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  {product.category?.name}
                </span>
              </div>
              
              {/* Brand Logos */}
              {product.brands && product.brands.length > 0 && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 border border-gray-100">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Marcas:</span>
                  <div className="flex items-center gap-4">
                    {product.brands.map((b) =>
                      b.brand.logo ? (
                        <Image
                          key={b.brand.id}
                          src={b.brand.logo}
                          alt={b.brand.name}
                          width={80}
                          height={30}
                          className="object-contain"
                        />
                      ) : null
                    )}
                  </div>
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[#10213f] mb-6">
                {product.name}
              </h1>

              {product.shortDescription && (
                <div 
                  className="text-gray-600 text-lg leading-relaxed mb-8 [&_*]:font-sans [&_span]:font-sans"
                  dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                />
              )}

              {/* Price Block */}
              <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-2">Investimento</p>
                <div className="flex flex-col gap-2">
                  <div className="text-3xl font-semibold text-black">
                    {mainPrice ? formatCurrency(mainPrice) : "Sob consulta"}
                  </div>
                  {product.priceOriginal && product.pricePromo && product.pricePromo < product.priceOriginal && (
                    <p className="text-sm text-gray-400 line-through">
                      {formatCurrency(product.priceOriginal)}
                    </p>
                  )}
                  {pixPrice && (
                    <p className="text-sm text-gray-600">ou {formatCurrency(pixPrice)} no Pix</p>
                  )}
                  {installments && (
                    <p className="text-sm text-gray-600">
                      até {installments.count}x de {formatCurrency(installments.value)} sem juros
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Estoque disponível: {product.stockQuantity ?? 0} unidades</p>
                </div>
                {maxQuantity > 0 && (
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Quantidade</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="w-10 h-10 border border-gray-300 bg-white text-lg"
                        aria-label="Diminuir quantidade"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) => handleQuantityChange(Number(e.target.value))}
                        className="w-16 text-center border border-gray-300 py-2"
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="w-10 h-10 border border-gray-300 bg-white text-lg"
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="mb-10">
                <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-4">
                  Características
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <HiOutlineCheck className="w-5 h-5 text-black shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTAs */}
              <div className="mt-auto">
                <p className="text-gray-600 text-sm mb-4">
                  Valores e condições especiais com nossos especialistas IP3D.
                </p>
                {cartMessage && (
                  <div className="mb-4 rounded bg-green-100 text-green-700 px-4 py-2 text-sm">
                    {cartMessage}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-[#0B64D3] text-white hover:bg-[#0950a8] transition-all duration-300 flex-1"
                    onClick={handleAddToCart}
                    disabled={maxQuantity === 0}
                  >
                    Adicionar ao Carrinho
                  </Button>
                  <CheckoutButton
                    product={product}
                    quantity={quantity}
                    customerData={{
                      name: customerName,
                      email: customerEmail,
                      phone: customerPhone,
                    }}
                    shippingData={shippingSelection}
                    disabled={!shippingSelection || !customerName.trim() || !customerEmail.trim()}
                    className="flex-1"
                  />
                </div>

                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-semibold text-black mb-4">Dados para compra</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Nome completo</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">E-mail</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Telefone (opcional)</label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <ShippingCalculator
                        peso={0.3}
                        comprimento={16}
                        altura={5}
                        largura={11}
                        valor={mainPrice || 0}
                        onShippingSelected={setShippingSelection}
                      />
                    </div>

                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                      <p className="font-semibold uppercase tracking-wide">Resumo da compra</p>
                      <p className="mt-1">Subtotal: {subtotal ? formatCurrency(subtotal) : "Sob consulta"}</p>
                      <p>Frete: {shippingSelection ? formatCurrency(shippingSelection.price) : "Selecione o frete acima"}</p>
                      <p className="mt-1 text-sm font-semibold">Total: {totalWithShipping ? formatCurrency(totalWithShipping) : "Sob consulta"}</p>
                    </div>
                    {!shippingSelection && (
                      <p className="text-xs text-red-600">
                        Selecione o frete e preencha o numero do endereco para liberar a compra.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Button
                    size="lg"
                    className="bg-black text-white hover:bg-gray-800 transition-all duration-300 group flex-1"
                    asChild
                  >
                    <a
                      href={`https://wa.me/${whatsappPhone}?text=Olá! Tenho interesse no produto ${product.name}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <HiOutlinePhone className="mr-2 w-5 h-5" />
                      Fale com um Especialista
                    </a>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 flex-1"
                    onClick={() => setShowTechInfo(true)}
                  >
                    <HiOutlineInformationCircle className="mr-2 w-5 h-5" />
                    Informações Técnicas
                  </Button>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-gray-100">
                <div className="text-center">
                  <span className="text-2xl font-serif font-semibold text-black">100%</span>
                  <p className="text-xs text-gray-500 mt-1">Original</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <span className="text-2xl font-serif font-semibold text-black">{product.warranty || "2 anos"}</span>
                  <p className="text-xs text-gray-500 mt-1">Garantia</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <span className="text-2xl font-serif font-semibold text-black">Brasil</span>
                  <p className="text-xs text-gray-500 mt-1">Suporte Nacional</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Description */}
      {product.description && product.description.trim() && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-semibold tracking-tight text-[#10213f] mb-8">
                  {product.name}
                </h2>
                <div 
                  className="text-gray-600 text-lg leading-relaxed [&_p]:mb-4 [&_a]:text-black [&_a]:underline [&_a]:hover:text-gray-600 [&_*]:font-sans [&_span]:font-sans"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-sm uppercase tracking-[0.2em] text-gray-500 mb-3 block">
                  Você também pode gostar
                </span>
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#10213f]">
                  Produtos Relacionados
                </h2>
              </div>
              <Link href="/produtos">
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 hidden sm:flex"
                >
                  Ver todos
                  <HiArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/produtos/${relatedProduct.slug}`} className="group flex flex-col md:flex-row gap-6 bg-white p-6 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 transition-transform duration-700 group-hover:scale-105"
                        style={{
                          backgroundImage: `url(${relatedProduct.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-serif font-medium text-black group-hover:text-gray-600 transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                      {stripHtml(relatedProduct.shortDescription)}
                    </p>
                    <div className="text-sm font-semibold text-black mb-2">
                      {relatedProduct.pricePromo ?? relatedProduct.priceOriginal
                        ? formatCurrency(relatedProduct.pricePromo ?? relatedProduct.priceOriginal)
                        : "Sob consulta"}
                    </div>
                    <span className="inline-flex items-center text-sm font-medium text-black group-hover:text-gray-600 transition-colors">
                      Ver detalhes
                      <HiArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
            Interessado neste produto?
          </h2>
          <p className="text-gray-400 mb-8">
            Entre em contato para receber um orçamento personalizado.
          </p>
          <Button
            size="lg"
            className="bg-white text-black hover:bg-gray-100 transition-all duration-300"
            asChild
          >
            <a
              href={`https://wa.me/${whatsappPhone}?text=Olá! Gostaria de saber mais sobre o ${product.name}.`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar com Consultor
            </a>
          </Button>
        </div>
      </section>

      {/* Modal Informações Técnicas */}
      {showTechInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTechInfo(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white w-full max-w-lg p-8 shadow-2xl z-10"
          >
            <button
              onClick={() => setShowTechInfo(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-semibold tracking-tight text-[#10213f] mb-6">
              Informações Técnicas
            </h3>
            <p className="text-sm text-gray-500 mb-6">{product.name}</p>

            <div className="space-y-4">
              {product.specifications && product.specifications.length > 0 ? (
                product.specifications.map((spec, index) => (
                  <div key={index} className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-600">{spec.label}</span>
                    <span className="text-black font-medium">{spec.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Informações técnicas não disponíveis. Consulte um especialista.
                </p>
              )}
            </div>

            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4">
                {product.catalog 
                  ? "Clique abaixo para baixar o catálogo técnico."
                  : "Para informações detalhadas, solicite o catálogo técnico."
                }
              </p>
              {product.catalog ? (
                <Button
                  className="w-full bg-black text-white hover:bg-gray-800"
                  asChild
                >
                  <a
                    href={product.catalog}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Baixar Catálogo Técnico
                  </a>
                </Button>
              ) : (
                <Button
                  className="w-full bg-black text-white hover:bg-gray-800"
                  asChild
                >
                  <a
                    href={`https://wa.me/${whatsappPhone}?text=Olá! Gostaria de receber o catálogo técnico do ${product.name}.`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Solicitar Catálogo Técnico
                  </a>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
