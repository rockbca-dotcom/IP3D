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
      .then((r) => r.json())
      .then((data) => {
        const phone: string = data.config?.content?.contactPhone ?? "";
        const digits = phone.replace(/\D/g, "");
        if (digits) {
          setWhatsappPhone(digits.length >= 12 ? digits : `55${digits}`);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!slug) return;
    setShippingSelection(null);

    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setProduct(null);
        } else {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
        }
      })
      .catch(console.error)
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 mb-4 overflow-hidden">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 transition-all duration-500"
                  style={{
                    backgroundImage: `url(${allImages[activeImage]})`,
                    backgroundSize: "cover",
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
                <div className="flex gap-3">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative w-20 h-20 bg-gray-100 overflow-hidden transition-all duration-300 ${
                        activeImage === index ? "ring-2 ring-black" : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"
                        style={{
                          backgroundImage: `url(${img})`,
                          backgroundSize: "cover",
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
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-black mb-6">
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
                <h2 className="text-3xl font-serif font-semibold text-black mb-8">
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
                <h2 className="text-3xl md:text-4xl font-serif font-semibold text-black">
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
          <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-4">
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

            <h3 className="text-2xl font-serif font-semibold text-black mb-6">
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
