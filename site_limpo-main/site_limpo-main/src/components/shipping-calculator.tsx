"use client";

import { useEffect, useMemo, useState } from "react";
import { HiOutlineLocationMarker, HiOutlineTruck } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface ShippingOption {
  servico: string;
  codigo: string;
  valor: string;
  prazo: string;
}

export interface ShippingResult {
  cepDestino: string;
  endereco?: {
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  opcoes: ShippingOption[];
  erros?: { servico: string; erro: string }[];
}

export interface ShippingSelection {
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

interface ShippingCalculatorProps {
  peso?: number;
  comprimento?: number;
  altura?: number;
  largura?: number;
  valor?: number;
  onShippingSelected?: (selection: ShippingSelection | null) => void;
  className?: string;
}

function parseCurrency(currencyValue: string) {
  const normalized = currencyValue.replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ShippingCalculator({
  peso = 0.3,
  comprimento = 16,
  altura = 5,
  largura = 11,
  valor = 0,
  onShippingSelected,
  className = "",
}: ShippingCalculatorProps) {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");

  const selectedOption = useMemo(() => {
    if (!result || !selectedCode) return null;
    return result.opcoes.find((option) => option.codigo === selectedCode) || null;
  }, [result, selectedCode]);

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCep(event.target.value));
  };

  const calculateShipping = async () => {
    const cleanCep = cep.replace(/\D/g, "");

    if (cleanCep.length !== 8) {
      setError("Digite um CEP valido com 8 digitos.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedCode(null);
    setAddressNumber("");
    setAddressComplement("");

    try {
      const response = await fetch("/api/shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cepDestino: cleanCep,
          peso,
          comprimento,
          altura,
          largura,
          valor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao calcular frete.");
      }

      if (data.opcoes && data.opcoes.length > 0) {
        setResult(data);
      } else {
        setError("Nao foi possivel calcular o frete para este CEP.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao calcular frete.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      calculateShipping();
    }
  };

  useEffect(() => {
    if (!onShippingSelected) return;

    if (!result || !result.endereco || !selectedOption || !addressNumber.trim()) {
      onShippingSelected(null);
      return;
    }

    onShippingSelected({
      cep: result.cepDestino,
      serviceCode: selectedOption.codigo,
      serviceName: selectedOption.servico,
      deliveryDays: Number.parseInt(selectedOption.prazo, 10) || 0,
      price: parseCurrency(selectedOption.valor),
      address: {
        street: result.endereco.logradouro || "",
        neighborhood: result.endereco.bairro || "",
        city: result.endereco.cidade || "",
        state: result.endereco.uf || "",
        number: addressNumber.trim(),
        complement: addressComplement.trim() || null,
      },
    });
  }, [addressComplement, addressNumber, onShippingSelected, result, selectedOption]);

  return (
    <div className={`rounded-lg bg-gray-50 p-6 ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <HiOutlineTruck className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Calcular Frete</h3>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={handleCepChange}
          onKeyUp={handleKeyPress}
          maxLength={9}
          className="flex-1"
        />
        <Button onClick={calculateShipping} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
          {loading ? "..." : "Calcular"}
        </Button>
      </div>

      <a
        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-xs text-blue-600 hover:underline"
      >
        Nao sei meu CEP
      </a>

      {error ? (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3">
          {result.endereco ? (
            <div className="flex items-start gap-2 border-b border-gray-200 pb-3 text-sm text-gray-600">
              <HiOutlineLocationMarker className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {result.endereco.logradouro ? `${result.endereco.logradouro}${result.endereco.bairro ? `, ${result.endereco.bairro}` : ""}` : result.endereco.bairro || "Endereco encontrado"}{" "}
                - {result.endereco.cidade}/{result.endereco.uf}
              </span>
            </div>
          ) : null}

          {result.opcoes.map((option) => (
            <button
              key={option.codigo}
              type="button"
              onClick={() => setSelectedCode(option.codigo)}
              className={`flex w-full items-center justify-between rounded-lg border bg-white p-3 transition-colors ${
                selectedCode === option.codigo ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-blue-300"
              }`}
            >
              <div className="text-left">
                <span className="font-medium text-gray-900">{option.servico}</span>
                <p className="text-sm text-gray-500">
                  Entrega em ate {option.prazo} {Number.parseInt(option.prazo, 10) === 1 ? "dia util" : "dias uteis"}
                </p>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="text-lg font-bold text-green-600">R$ {option.valor}</span>
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs ${
                    selectedCode === option.codigo ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 text-gray-400"
                  }`}
                >
                  {selectedCode === option.codigo ? "✓" : ""}
                </span>
              </div>
            </button>
          ))}

          <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Numero *</label>
              <Input value={addressNumber} onChange={(event) => setAddressNumber(event.target.value)} placeholder="Ex.: 123" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Complemento</label>
              <Input
                value={addressComplement}
                onChange={(event) => setAddressComplement(event.target.value)}
                placeholder="Apto, bloco, referencia..."
              />
            </div>
          </div>

          {selectedOption && addressNumber.trim() ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              Frete selecionado: <strong>{selectedOption.servico}</strong> por <strong>R$ {selectedOption.valor}</strong>.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
