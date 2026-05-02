"use client";

import Link from "next/link";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function CheckoutErrorPage() {
  return (
    <main className="min-h-[70vh] bg-white px-6 py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
        <HiOutlineExclamationCircle className="mb-4 h-16 w-16 text-red-600" />
        <h1 className="text-3xl font-semibold text-gray-900">Pagamento nao concluido</h1>
        <p className="mt-3 text-gray-700">
          O pagamento foi interrompido ou recusado. Voce pode tentar novamente e escolher outra forma de pagamento.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/produtos" className="rounded-full bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
            Tentar novamente
          </Link>
          <Link href="/" className="rounded-full border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100">
            Voltar para home
          </Link>
        </div>
      </div>
    </main>
  );
}
