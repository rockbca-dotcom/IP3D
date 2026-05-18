"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { formatBRL } from "@/lib/utils";

function isExternalUrl(value?: string | null) {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  image: string;
  gallery?: string[] | null;
  priceOriginal?: number | null;
  pricePromo?: number | null;
  pixPrice?: number | null;
  installments?: number | null;
  installmentValue?: number | null;
  stockQuantity?: number | null;
  category?: {
    name: string;
    slug: string;
  } | null;
}

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
  const salePrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;
  const originalPrice = product.priceOriginal ?? null;
  const hasRealDiscount = !!(product.pricePromo && product.priceOriginal && product.pricePromo < product.priceOriginal);
  const displayDiscountPercent = hasRealDiscount && originalPrice && product.pricePromo
    ? Math.round(((originalPrice - product.pricePromo) / originalPrice) * 100)
    : 10;
  const pixPrice = salePrice
    ? Number((salePrice * 0.95).toFixed(2))
    : null;
  const installmentBase = salePrice ?? originalPrice;
  const installmentCount = installmentBase
    ? installmentBase >= 1200
      ? 12
      : installmentBase >= 600
        ? 10
        : installmentBase >= 300
          ? 6
          : 3
    : null;
  const installmentValue = installmentBase && installmentCount
    ? Number((installmentBase / installmentCount).toFixed(2))
    : null;
  const canBuy = (product.stockQuantity ?? 1) > 0;
  const productImage = product.image || "/images/products/components-placeholder.svg";
  const galleryImages = Array.isArray(product.gallery) ? product.gallery.filter((image) => typeof image === "string" && image.trim().length > 0) : [];
  const hoverImage = galleryImages.find((image) => image !== productImage) ?? null;
  const useExternalMainImage = isExternalUrl(productImage);
  const useExternalHoverImage = isExternalUrl(hoverImage);

  return (
    <div className={`group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#d8e5fb] bg-white shadow-[0_18px_48px_-30px_rgba(11,100,211,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(11,100,211,0.45)] ${className}`}>
      <button
        type="button"
        aria-label={`Favoritar ${product.name}`}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#d9e6fb] bg-white/95 text-[#0B64D3] shadow-sm transition-colors hover:bg-[#edf4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B64D3]"
      >
        <Heart className="h-4 w-4" aria-hidden="true" />
      </button>

      <Link 
        href={`/produtos/${product.slug}`} 
        className="relative block w-full flex-shrink-0 overflow-hidden bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B64D3] rounded-t-[22px]"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <div className="absolute left-3 top-3 z-10 rounded-full bg-[#0B64D3] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white shadow-sm">
          {displayDiscountPercent}% OFF
        </div>

        {!canBuy && (
          <div className="absolute bottom-3 left-3 z-10 rounded-full bg-[#10213f] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            Esgotado
          </div>
        )}

        <div className="relative h-[250px] w-full sm:h-[270px]">
          <Image
            src={productImage}
            alt={`Imagem de ${product.name}`}
            fill
            className={`object-contain p-5 transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt={`Imagem secundária de ${product.name}`}
              fill
              className="object-contain p-5 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-5 sm:px-5 sm:pb-5">
        <Link href={`/produtos/${product.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B64D3] rounded p-0.5">
          <h3 className="min-h-[3.25rem] text-[15px] font-semibold leading-6 text-[#10213f] transition-colors hover:text-[#0B64D3] line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="mt-4 rounded-2xl border border-[#cdeed9] bg-[#f0fff5] px-4 py-4 shadow-sm">
          {originalPrice && salePrice ? (
            <div className="text-xs font-medium text-[#6f85a8] line-through">
              De {formatBRL(originalPrice)}
            </div>
          ) : (
            <div className="text-xs font-medium text-[#6f85a8]">
              Melhor preço disponível
            </div>
          )}

          {salePrice ? (
            <>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-[9px] font-black uppercase leading-none text-white shadow-sm" aria-hidden="true">
                  PIX
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#25D366]">
                  5% de desconto
                </p>
              </div>
              <div className="mt-1 flex items-end justify-center gap-2">
                <span className="text-[2rem] font-extrabold leading-none text-[#128C7E]">
                  {formatBRL(pixPrice ?? salePrice)}
                </span>
              </div>
              <div className="mt-2 text-sm text-[#128C7E]">
                ou <span className="font-semibold text-[#10213f]">{formatBRL(salePrice)}</span> no cartão
              </div>
              {installmentCount && installmentValue && (
                <div className="mt-1 text-sm text-[#47628a]">
                  em até <span className="font-semibold text-[#10213f]">{installmentCount}x de {formatBRL(installmentValue)}</span> sem juros
                </div>
              )}
            </>
          ) : (
            <div className="mt-2 text-lg font-semibold text-[#10213f]">
              Preço sob consulta
            </div>
          )}
        </div>

        <Link
          href={`/produtos/${product.slug}`}
          className="mt-auto flex h-12 w-full translate-y-2 items-center justify-center gap-2 rounded-xl bg-[#0B64D3] px-4 text-sm font-semibold uppercase tracking-[0.14em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[#0A4A9D] focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B64D3]"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          {canBuy ? "Comprar" : "Ver produto"}
        </Link>
      </div>
    </div>
  );
}
