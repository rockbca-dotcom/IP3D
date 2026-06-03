"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Token de recuperação ausente ou inválido.");
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error?.message || "Erro ao redefinir a senha.");
        return;
      }

      setSuccess("Senha alterada com sucesso. Redirecionando para o login...");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch {
      setError("Erro ao redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 shadow-lg">
        <div className="text-center mb-8">
          <Image
            src="/images/Captura_de_tela_2026-02-28_210120-removebg-preview.webp"
            alt="Logo"
            width={120}
            height={48}
            className="mx-auto mb-4 object-contain"
          />
          <h1 className="text-2xl font-serif font-semibold text-gray-900">
            Redefinir Senha
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Informe sua nova senha para recuperar o acesso ao painel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 text-sm rounded">
              {success}
            </div>
          )}

          {!token && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 text-sm rounded">
              Link de recuperação inválido. Solicite um novo link na tela de login.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nova senha
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={8}
                disabled={!token || loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={!token || loading}
              >
                {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar nova senha
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={8}
                disabled={!token || loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={!token || loading}
              >
                {showConfirmPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!token || loading}
            className="w-full bg-black text-white hover:bg-gray-800 py-3 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </Button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Voltar para o login
          </button>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 shadow-lg text-center">
        <h1 className="text-2xl font-serif font-semibold text-gray-900">Redefinir Senha</h1>
        <p className="text-gray-500 text-sm mt-2">Carregando link de recuperação...</p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
