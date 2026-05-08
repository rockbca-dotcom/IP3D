"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HiOutlineShoppingCart } from "react-icons/hi";

interface Product {
  id: string;
  name: string;
  priceOriginal?: number | null;
  pricePromo?: number | null;
  pixPrice?: number | null;
  stockQuantity?: number | null;
}

interface CheckoutShippingData {
  cep: string;
  serviceCode: string;
  serviceName: string;
  deliveryDays: number;
  price: number;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    number: string;
    complement?: string | null;
  };
}

interface CheckoutButtonProps {
  product: Product;
  quantity?: number;
  customerData?: {
    name: string;
    email: string;
    phone?: string;
  };
  shippingData?: CheckoutShippingData | null;
  requireShipping?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function CheckoutButton({
  product,
  quantity = 1,
  customerData,
  shippingData,
  requireShipping = true,
  disabled = false,
  className = "",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!customerData?.name || !customerData?.email) {
      alert("Preencha nome e e-mail para continuar.");
      return;
    }

    const unitPrice = product.pricePromo ?? product.priceOriginal ?? product.pixPrice;
    if (!unitPrice) {
      alert("Produto sem preço definido.");
      return;
    }

    if ((product.stockQuantity ?? 0) < quantity) {
      alert("Estoque insuficiente.");
      return;
    }

    if (requireShipping) {
      if (!shippingData) {
        alert("Informe o endereco e selecione o frete para continuar.");
        return;
      }

      const hasAddress =
        shippingData.cep &&
        shippingData.address.street &&
        shippingData.address.number &&
        shippingData.address.city &&
        shippingData.address.state;

      if (!hasAddress || shippingData.price <= 0) {
        alert("Endereco/frete invalido. Revise os dados para continuar.");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ productId: product.id, quantity }],
          customer: customerData,
          shipping: shippingData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Erro ao iniciar o pagamento.");
        return;
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        alert("Não foi possível gerar o link de pagamento.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Erro ao iniciar o pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading}
      className={`w-full bg-black text-white hover:bg-gray-800 transition-colors ${className}`}
    >
      {loading ? (
        "Processando..."
      ) : (
        <>
          <HiOutlineShoppingCart className="mr-2 w-5 h-5" />
          Comprar agora
        </>
      )}
    </Button>
  );
}
