export const CART_STORAGE_KEY = "ip3d-cart";
export const CART_UPDATED_EVENT = "ip3d-cart-updated";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image?: string | null;
  price: number | null;
  quantity: number;
  maxQuantity?: number | null;
}

interface AddToCartInput {
  productId: string;
  name: string;
  slug: string;
  image?: string | null;
  price: number | null;
  quantity?: number;
  maxQuantity?: number | null;
}

function normalizeQuantity(value: number | undefined, fallback = 1) {
  const parsed = Number.isFinite(value) ? Math.floor(Number(value)) : fallback;
  return Math.max(1, parsed);
}

function emitCartUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
}

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is CartItem => {
      return (
        item &&
        typeof item === "object" &&
        typeof item.productId === "string" &&
        item.productId.trim().length > 0 &&
        typeof item.name === "string" &&
        typeof item.slug === "string" &&
        typeof item.quantity === "number" &&
        Number.isFinite(item.quantity) &&
        item.quantity >= 1
      );
    }) as CartItem[];
  } catch (error) {
    console.error("Failed to read cart:", error);
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  emitCartUpdated();
}

export function clearCart() {
  writeCart([]);
}

export function addToCart(input: AddToCartInput) {
  const cart = readCart();
  const quantity = normalizeQuantity(input.quantity, 1);
  const maxQuantity = input.maxQuantity !== undefined ? input.maxQuantity : null;

  // Bloqueia produto esgotado
  if (maxQuantity !== null && maxQuantity <= 0) {
    throw new Error("Produto esgotado no momento.");
  }

  const existingIndex = cart.findIndex((item) => item.productId === input.productId);

  if (existingIndex >= 0) {
    const current = cart[existingIndex];
    const nextQuantity = current.quantity + quantity;

    // Bloqueia quantidade acumulada maior que estoque
    if (maxQuantity !== null && nextQuantity > maxQuantity) {
      throw new Error(`Quantidade solicitada indisponível. Estoque máximo: ${maxQuantity}`);
    }

    cart[existingIndex] = {
      ...current,
      quantity: nextQuantity,
      price: input.price !== undefined ? input.price : current.price,
      image: input.image !== undefined ? input.image : current.image,
      maxQuantity,
    };
  } else {
    // Bloqueia quantidade maior que estoque
    if (maxQuantity !== null && quantity > maxQuantity) {
      throw new Error(`Quantidade solicitada indisponível. Estoque máximo: ${maxQuantity}`);
    }

    cart.push({
      productId: input.productId,
      name: input.name,
      slug: input.slug,
      image: input.image ?? null,
      price: input.price,
      quantity,
      maxQuantity,
    });
  }

  writeCart(cart);
  return cart;
}

export function removeFromCart(productId: string) {
  const nextItems = readCart().filter((item) => item.productId !== productId);
  writeCart(nextItems);
  return nextItems;
}

export function setCartItemQuantity(productId: string, quantity: number) {
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw new Error("Quantidade deve ser maior ou igual a 1.");
  }
  const nextQuantity = Math.floor(quantity);
  const items = readCart();
  const target = items.find((item) => item.productId === productId);
  if (!target) return items;

  const limit = target.maxQuantity ?? null;
  if (limit !== null && nextQuantity > limit) {
    throw new Error(`Quantidade solicitada indisponível. Estoque máximo: ${limit}`);
  }
  target.quantity = nextQuantity;
  writeCart(items);
  return items;
}

export function getCartCount(items?: CartItem[]) {
  const source = items ?? readCart();
  return source.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartSubtotal(items?: CartItem[]) {
  const source = items ?? readCart();
  return source.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
}
