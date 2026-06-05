"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { formatBRL } from "@/lib/utils";

export interface ProductCardProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  image?: string | null;
  hoverImage?: string | null;
  gallery?: string[] | null;
  priceOriginal?: number | null;
  pricePromo?: number | null;
  pixPrice?: number | null;
  installments?: number | null;
  installmentValue?: number | null;
  stockQuantity?: number | null;
  category?: {
    name: string | null;
    slug?: string | null;
  } | null;
  categories?: Array<{
    category: {
      name: string;
      slug: string;
    };
  }>;
}

type ProductCardVariant = "standard" | "compact" | "mini" | "list";

interface ProductCardProps {
  product: ProductCardProduct;
  className?: string;
  variant?: ProductCardVariant;
  badge?: string;
  interactive?: boolean;
}

const variantStyles: Record<
  Exclude<ProductCardVariant, "list">,
  {
    card: string;
    media: string;
    mediaPadding: string;
    body: string;
    title: string;
    priceBox: string;
    price: string;
    cta: string;
  }
> = {
  standard: {
    card: "min-h-[576px]",
    media: "h-[232px] sm:h-[250px]",
    mediaPadding: "p-5",
    body: "px-4 pb-4 pt-4 sm:px-5 sm:pb-5",
    title: "min-h-[3.25rem] text-[15px] leading-6",
    priceBox: "min-h-[168px] px-4 py-4",
    price: "text-[1.7rem] sm:text-[1.85rem]",
    cta: "h-11",
  },
  compact: {
    card: "min-h-[536px]",
    media: "h-[210px]",
    mediaPadding: "p-5",
    body: "px-4 pb-4 pt-4",
    title: "min-h-[3.1rem] text-[14px] leading-6",
    priceBox: "min-h-[156px] px-3 py-3",
    price: "text-[1.5rem]",
    cta: "h-10",
  },
  mini: {
    card: "min-h-[416px]",
    media: "h-[140px]",
    mediaPadding: "p-3",
    body: "px-3 pb-3 pt-3",
    title: "min-h-[2.55rem] text-[13px] leading-5",
    priceBox: "min-h-[152px] px-2.5 py-2.5",
    price: "text-[1.05rem]",
    cta: "h-9",
  },
};

function getPrimaryCategory(product: ProductCardProduct) {
  return product.categories?.[0]?.category.name ?? product.category?.name ?? null;
}

export default function ProductCard({
  product,
  className = "",
  variant = "standard",
  badge,
  interactive = true,
}: ProductCardProps) {
  const salePrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice ?? null;
  const originalPrice = product.priceOriginal ?? null;
  const hasRealDiscount = Boolean(
    product.pricePromo && product.priceOriginal && product.pricePromo < product.priceOriginal,
  );
  const displayDiscountPercent = hasRealDiscount && originalPrice && product.pricePromo
    ? Math.round(((originalPrice - product.pricePromo) / originalPrice) * 100)
    : null;
  const pixPrice = product.pixPrice ?? (salePrice ? Number((salePrice * 0.95).toFixed(2)) : null);
  const installmentBase = salePrice ?? originalPrice;
  const installmentCount = product.installments ?? (installmentBase
    ? installmentBase >= 1200
      ? 12
      : installmentBase >= 600
        ? 10
        : installmentBase >= 300
          ? 6
          : 3
    : null);
  const installmentValue = product.installmentValue ?? (installmentBase && installmentCount
    ? Number((installmentBase / installmentCount).toFixed(2))
    : null);
  const canBuy = (product.stockQuantity ?? 1) > 0;
  const productImage = product.image || "/images/products/components-placeholder.svg";
  const galleryImages = Array.isArray(product.gallery)
    ? product.gallery.filter((image) => typeof image === "string" && image.trim().length > 0)
    : [];
  const hoverImage = product.hoverImage || galleryImages.find((image) => image !== productImage) || null;
  const tabIndex = interactive ? undefined : -1;
  const categoryName = getPrimaryCategory(product);
  const promoBadge = badge ?? (displayDiscountPercent ? `${displayDiscountPercent}% OFF` : "5% PIX");

  if (variant === "list") {
    return (
      <article
        className={`group grid min-h-[230px] overflow-hidden rounded-lg border border-[#d7e4f6] bg-white shadow-[0_18px_42px_-34px_rgba(16,33,63,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b8cff0] hover:shadow-[0_22px_50px_-34px_rgba(11,100,211,0.5)] md:grid-cols-[230px_1fr_auto] ${className}`}
        data-product-card="list"
        aria-hidden={!interactive}
      >
        <Link
          href={`/produtos/${product.slug}`}
          className="relative block h-[220px] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B64D3] md:h-full"
          aria-label={`Ver detalhes de ${product.name}`}
          tabIndex={tabIndex}
        >
          <Image
            src={productImage}
            alt={`Imagem de ${product.name}`}
            fill
            className="object-contain p-5 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 230px"
            loading="lazy"
          />
        </Link>

        <div className="flex min-w-0 flex-col px-5 py-5">
          {categoryName && (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0B64D3]">
              {categoryName}
            </p>
          )}
          <Link
            href={`/produtos/${product.slug}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B64D3]"
            tabIndex={tabIndex}
          >
            <h3 className="line-clamp-2 text-lg font-semibold leading-7 text-[#10213f] transition-colors group-hover:text-[#0B64D3]">
              {product.name}
            </h3>
          </Link>
          {product.shortDescription && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5b7192]">
              {product.shortDescription.replace(/<[^>]*>/g, "").trim()}
            </p>
          )}
        </div>

        <div className="flex min-w-[250px] flex-col border-t border-[#e3ecf8] px-5 py-5 md:border-l md:border-t-0">
          <PriceBlock
            compact={false}
            originalPrice={originalPrice}
            salePrice={salePrice}
            pixPrice={pixPrice}
            installmentCount={installmentCount}
            installmentValue={installmentValue}
            className="min-h-[150px]"
          />
          <ProductCta canBuy={canBuy} productSlug={product.slug} tabIndex={tabIndex} className="mt-4 h-11" />
        </div>
      </article>
    );
  }

  const styles = variantStyles[variant];
  const isMini = variant === "mini";

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-lg border border-[#d7e4f6] bg-white shadow-[0_18px_42px_-34px_rgba(16,33,63,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b8cff0] hover:shadow-[0_24px_56px_-34px_rgba(11,100,211,0.52)] ${styles.card} ${className}`}
      data-product-card={variant}
      aria-hidden={!interactive}
    >
      <button
        type="button"
        aria-label={`Favoritar ${product.name}`}
        className={`${isMini ? "right-2 top-2 h-8 w-8" : "right-3 top-3 h-10 w-10"} absolute z-10 flex items-center justify-center rounded-full border border-[#d9e6fb] bg-white/95 text-[#0B64D3] shadow-sm transition-colors hover:bg-[#edf4ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B64D3]`}
        tabIndex={tabIndex}
      >
        <Heart className={isMini ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden="true" />
      </button>

      <Link
        href={`/produtos/${product.slug}`}
        className={`relative block w-full flex-shrink-0 overflow-hidden bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B64D3] ${styles.media}`}
        aria-label={`Ver detalhes de ${product.name}`}
        tabIndex={tabIndex}
      >
        <div className={`${isMini ? "left-2 top-2 px-2 py-0.5 text-[9px] tracking-[0.12em]" : "left-3 top-3 px-3 py-1 text-[10px] tracking-[0.16em]"} absolute z-10 rounded-full bg-[#0B64D3] font-bold uppercase text-white shadow-sm`}>
          {promoBadge}
        </div>

        {!canBuy && (
          <div className="absolute bottom-3 left-3 z-10 rounded-full bg-[#10213f] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
            Esgotado
          </div>
        )}

        <div className="relative h-full w-full">
          <Image
            src={productImage}
            alt={`Imagem de ${product.name}`}
            fill
            className={`object-contain ${styles.mediaPadding} transition-all duration-500 ${hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />
          {hoverImage && (
            <Image
              src={hoverImage}
              alt={`Imagem secundaria de ${product.name}`}
              fill
              className={`object-contain ${styles.mediaPadding} opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
            />
          )}
        </div>
      </Link>

      <div className={`flex flex-1 flex-col ${styles.body}`}>
        {categoryName && !isMini && (
          <p className="mb-2 line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B64D3]">
            {categoryName}
          </p>
        )}
        <Link
          href={`/produtos/${product.slug}`}
          className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B64D3]"
          tabIndex={tabIndex}
        >
          <h3 className={`line-clamp-2 font-semibold text-[#10213f] transition-colors hover:text-[#0B64D3] ${styles.title}`}>
            {product.name}
          </h3>
        </Link>

        <PriceBlock
          compact={variant !== "standard"}
          originalPrice={originalPrice}
          salePrice={salePrice}
          pixPrice={pixPrice}
          installmentCount={installmentCount}
          installmentValue={installmentValue}
          className={`mt-4 ${styles.priceBox}`}
          priceClassName={styles.price}
        />

        <ProductCta
          canBuy={canBuy}
          productSlug={product.slug}
          tabIndex={tabIndex}
          className={`mt-auto ${styles.cta}`}
        />
      </div>
    </article>
  );
}

function PriceBlock({
  compact,
  originalPrice,
  salePrice,
  pixPrice,
  installmentCount,
  installmentValue,
  className = "",
  priceClassName = "text-[1.7rem]",
}: {
  compact: boolean;
  originalPrice: number | null;
  salePrice: number | null;
  pixPrice: number | null;
  installmentCount: number | null;
  installmentValue: number | null;
  className?: string;
  priceClassName?: string;
}) {
  return (
    <div
      className={`flex w-full flex-col justify-center rounded-lg border border-[#cdeed9] bg-[#f0fff5] text-center shadow-sm ${className}`}
      data-product-price
    >
      {originalPrice && salePrice && salePrice < originalPrice ? (
        <div className={`${compact ? "text-[11px]" : "text-xs"} font-medium text-[#6f85a8] line-through`}>
          De {formatBRL(originalPrice)}
        </div>
      ) : (
        <div className={`${compact ? "text-[11px]" : "text-xs"} font-medium text-[#6f85a8]`}>
          Melhor preço disponível
        </div>
      )}

      {salePrice ? (
        <>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className={`${compact ? "h-5 w-5 text-[8px]" : "h-6 w-6 text-[9px]"} inline-flex items-center justify-center rounded-full bg-[#25D366] font-black uppercase leading-none text-white shadow-sm`} aria-hidden="true">
              PIX
            </span>
            <p className={`${compact ? "text-[10px] tracking-[0.14em]" : "text-[11px] tracking-[0.18em]"} font-semibold uppercase text-[#25D366]`}>
              5% de desconto
            </p>
          </div>
          <div className="mt-1 flex min-h-[2.1rem] items-end justify-center gap-2">
            <span className={`${priceClassName} whitespace-nowrap font-extrabold leading-none text-[#128C7E]`}>
              {formatBRL(pixPrice ?? salePrice)}
            </span>
          </div>
          <div className={`${compact ? "text-[12px]" : "text-sm"} mt-2 min-h-[1.25rem] text-[#128C7E]`}>
            ou <span className="font-semibold text-[#10213f]">{formatBRL(salePrice)}</span> no cartão
          </div>
          {installmentCount && installmentValue ? (
            <div className={`${compact ? "text-[12px]" : "text-sm"} mt-1 min-h-[1.25rem] text-[#47628a]`}>
              em até <span className="font-semibold text-[#10213f]">{installmentCount}x de {formatBRL(installmentValue)}</span>
            </div>
          ) : (
            <div className="mt-1 min-h-[1.25rem]" />
          )}
        </>
      ) : (
        <div className="mt-2 text-lg font-semibold text-[#10213f]">
          Preço sob consulta
        </div>
      )}
    </div>
  );
}

function ProductCta({
  canBuy,
  productSlug,
  tabIndex,
  className = "",
}: {
  canBuy: boolean;
  productSlug: string;
  tabIndex?: number;
  className?: string;
}) {
  return (
    <Link
      href={`/produtos/${productSlug}`}
      className={`flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B64D3] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-[#0A4A9D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B64D3] ${className}`}
      tabIndex={tabIndex}
    >
      <ShoppingCart className="h-4 w-4" aria-hidden="true" />
      {canBuy ? "Comprar" : "Ver produto"}
    </Link>
  );
}
