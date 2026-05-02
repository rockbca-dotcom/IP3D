"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { HiOutlineCheckCircle } from "react-icons/hi";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("pedido");

  return (
    <main className="min-h-[70vh] bg-white px-6 py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
        <HiOutlineCheckCircle className="mb-4 h-16 w-16 text-green-600" />
        <h1 className="text-3xl font-semibold text-gray-900">Pagamento aprovado</h1>
        <p className="mt-3 text-gray-700">
          Seu pedido foi confirmado com sucesso. Nossa equipe recebeu a notificacao e vai iniciar o processamento.
        </p>
        <p className="mt-3 text-sm text-gray-600">
          Codigo do pedido: <strong>{orderCode || "Em processamento"}</strong>
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
            Voltar para home
          </Link>
          <Link href="/produtos" className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Continuar comprando
          </Link>
        </div>
      </div>
    </main>
  );
}

function CheckoutSuccessFallback() {
  return (
    <main className="min-h-[70vh] bg-white px-6 py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
        <HiOutlineCheckCircle className="mb-4 h-16 w-16 text-green-600" />
        <h1 className="text-3xl font-semibold text-gray-900">Pagamento aprovado</h1>
        <p className="mt-3 text-gray-700">
          Carregando os detalhes do pedido...
        </p>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
