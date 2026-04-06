"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user && (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN")) {
          router.replace("/admin");
        } else {
          setCheckingSession(false);
        }
      })
      .catch(() => setCheckingSession(false));
  }, [router]);

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Carregando...</div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao fazer login");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao recuperar senha");
        return;
      }

      setSuccess("Uma nova senha foi enviada para seu email!");
      setForgotMode(false);
    } catch (err) {
      setError("Erro ao recuperar senha");
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
            {forgotMode ? "Recuperar Senha" : "Área Administrativa"}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {forgotMode 
              ? "Digite seu email para recuperar a senha" 
              : "Faça login para acessar o painel"}
          </p>
        </div>

        <form onSubmit={forgotMode ? handleForgotPassword : handleSubmit} className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          {!forgotMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="w-5 h-5" />
                  ) : (
                    <HiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white hover:bg-gray-800 py-3 disabled:opacity-50"
          >
            {loading 
              ? (forgotMode ? "Enviando..." : "Entrando...") 
              : (forgotMode ? "Recuperar Senha" : "Entrar")}
          </Button>

          <button
            type="button"
            onClick={() => {
              setForgotMode(!forgotMode);
              setError("");
              setSuccess("");
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {forgotMode ? "Voltar para o login" : "Esqueci minha senha"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-8">
          © {new Date().getFullYear()} Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
