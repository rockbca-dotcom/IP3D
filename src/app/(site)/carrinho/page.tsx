"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineTrash, HiOutlineShoppingCart } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { ShippingCalculator, type ShippingSelection } from "@/components/shipping-calculator";
import {
  CART_UPDATED_EVENT,
  type CartItem,
  clearCart,
  getCartSubtotal,
  readCart,
  removeFromCart,
  setCartItemQuantity,
} from "@/lib/cart";

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined) return "Sob consulta";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CarrinhoPage() {
  const [items, setItems] = useState<CartItem[]>(() => readCart());
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingSelection, setShippingSelection] = useState<ShippingSelection | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const syncCart = () => {
    setItems(readCart());
  };

  useEffect(() => {
    const handleCartChange = () => syncCart();
    window.addEventListener("storage", handleCartChange);
    window.addEventListener(CART_UPDATED_EVENT, handleCartChange);

    return () => {
      window.removeEventListener("storage", handleCartChange);
      window.removeEventListener(CART_UPDATED_EVENT, handleCartChange);
    };
  }, []);

  const subtotal = useMemo(() => getCartSubtotal(items), [items]);
  const shippingCost = shippingSelection?.price ?? 0;
  const total = subtotal + shippingCost;
  const hasInvalidPrice = items.some((item) => !item.price || item.price <= 0);

  const canCheckout =
    items.length > 0 &&
    !hasInvalidPrice &&
    customerName.trim().length > 0 &&
    customerEmail.trim().length > 0 &&
    !!shippingSelection;

  const handleQuantity = (item: CartItem, nextValue: number) => {
    const max = item.maxQuantity ?? null;
    const bounded = max ? Math.min(Math.max(1, nextValue), max) : Math.max(1, nextValue);
    setCartItemQuantity(item.productId, bounded);
    syncCart();
    setShippingSelection(null);
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    syncCart();
    setShippingSelection(null);
  };

  const handleClearCart = () => {
    clearCart();
    syncCart();
    setShippingSelection(null);
  };

  const handleCheckout = async () => {
    if (!canCheckout || !shippingSelection) {
      alert("Preencha os dados do cliente e selecione o frete para continuar.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          customer: {
            name: customerName.trim(),
            email: customerEmail.trim(),
            phone: customerPhone.trim() || undefined,
          },
          shipping: shippingSelection,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao iniciar o pagamento.");
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      alert("Nao foi possivel gerar o link de pagamento.");
    } catch (error) {
      console.error("Cart checkout error:", error);
      alert("Erro ao iniciar o pagamento. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="bg-white px-6 py-24">
        <div className="container mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-gray-50 p-10 text-center">
          <HiOutlineShoppingCart className="mx-auto mb-4 h-14 w-14 text-gray-400" />
          <h1 className="text-3xl font-semibold text-gray-900">Seu carrinho esta vazio</h1>
          <p className="mt-3 text-gray-500">Adicione produtos para continuar com sua compra.</p>
          <Button asChild className="mt-6 rounded-full bg-black text-white hover:bg-gray-800">
            <Link href="/produtos">Ir para produtos</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white px-6 py-16 lg:py-20">
      <div className="container mx-auto grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Carrinho</h1>
              <p className="text-sm text-gray-500">{items.length} item(ns) selecionado(s)</p>
            </div>
            <Button variant="outline" className="rounded-full" onClick={handleClearCart}>
              Limpar carrinho
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item) => {
              const lineTotal = (item.price ?? 0) * item.quantity;

              return (
                <div key={item.productId} className="rounded-2xl border border-gray-200 p-4 sm:p-5">
                  <div className="grid gap-4 sm:grid-cols-[96px_1fr_auto] sm:items-center">
                    <Link href={`/produtos/${item.slug}`} className="relative block h-24 w-24 overflow-hidden rounded-xl bg-gray-50">
                      <Image
                        src={item.image || "/images/products/components-placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-contain p-2"
                      />
                    </Link>

                    <div>
                      <Link href={`/produtos/${item.slug}`} className="text-base font-semibold text-gray-900 hover:text-[#0b64d3]">
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500">Valor unitario: {formatCurrency(item.price)}</p>
                      {item.maxQuantity ? (
                        <p className="mt-1 text-xs text-gray-400">Estoque maximo: {item.maxQuantity}</p>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuantity(item, item.quantity - 1)}
                          className="h-9 w-9 rounded-full border border-gray-300 text-lg text-gray-700 hover:border-black"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) => handleQuantity(item, Number(event.target.value))}
                          className="w-14 rounded-lg border border-gray-300 py-1 text-center text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantity(item, item.quantity + 1)}
                          className="h-9 w-9 rounded-full border border-gray-300 text-lg text-gray-700 hover:border-black"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(lineTotal)}</p>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.productId)}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                      >
                        <HiOutlineTrash className="h-4 w-4" /> Remover
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-semibold text-gray-900">Dados da compra</h2>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Nome completo</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">E-mail</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(event) => setCustomerEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">Telefone (opcional)</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          <ShippingCalculator valor={subtotal} onShippingSelected={setShippingSelection} />

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 text-sm text-blue-900">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Resumo</h3>
            <div className="mt-3 space-y-1">
              <p>Subtotal: {formatCurrency(subtotal)}</p>
              <p>Frete: {shippingSelection ? formatCurrency(shippingSelection.price) : "Selecione o frete"}</p>
              <p className="pt-2 text-base font-semibold">Total: {formatCurrency(total)}</p>
            </div>
            {shippingSelection ? (
              <p className="mt-3 text-xs text-blue-700">
                Entrega via {shippingSelection.serviceName} para {shippingSelection.address.street}, {shippingSelection.address.number} -{" "}
                {shippingSelection.address.city}/{shippingSelection.address.state}.
              </p>
            ) : null}
            {hasInvalidPrice ? (
              <p className="mt-3 text-xs text-red-600">Alguns itens estao sem preco. Remova-os para continuar.</p>
            ) : null}
          </div>

          <Button
            onClick={handleCheckout}
            disabled={!canCheckout || submitting}
            className="w-full rounded-full bg-[#0b64d3] text-white hover:bg-[#0a55b5]"
          >
            {submitting ? "Processando..." : "Finalizar compra"}
          </Button>
        </aside>
      </div>
    </section>
  );
}
