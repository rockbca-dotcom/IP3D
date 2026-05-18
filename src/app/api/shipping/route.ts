import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApiError, apiSuccess, badRequest, apiError } from "@/lib/api-utils";
import { rateLimiter } from "@/lib/rate-limit";

// CEP de origem (IP3D - Birigui/SP)
const CEP_ORIGEM = "16200000";
// ... (resto do arquivo mantido exatamente igual)

// Schema de validação para o cálculo de frete
const shippingSchema = z.object({
  cepDestino: z
    .string({ required_error: "CEP é obrigatório" })
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 8, "CEP deve ter 8 dígitos"),
  peso: z
    .number()
    .positive("O peso deve ser positivo")
    .max(30, "Peso máximo permitido é 30kg")
    .default(0.3),
  comprimento: z
    .number()
    .min(15, "Comprimento mínimo 15cm")
    .max(100, "Comprimento máximo 100cm")
    .default(16),
  altura: z
    .number()
    .min(1, "Altura mínima 1cm")
    .max(100, "Altura máxima 100cm")
    .default(5),
  largura: z
    .number()
    .min(10, "Largura mínima 10cm")
    .max(100, "Largura máxima 100cm")
    .default(11),
  valor: z
    .number()
    .nonnegative()
    .default(0),
}).refine(
  (data) => {
    const soma = data.comprimento + data.altura + data.largura;
    return soma <= 200;
  },
  {
    message: "A soma das dimensões não deve ultrapassar 200cm",
    path: ["comprimento"],
  }
);

// Buscar endereço via ViaCEP com tratamento robusto de erros e timeout
async function buscarEndereco(cep: string) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error("HTTP_ERROR");
    }

    const data = await response.json();
    if (data.erro || data.erro === "true") {
      return { erro: true };
    }

    return {
      erro: false,
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      uf: data.uf || "",
    };
  } catch (err) {
    const error = err as Error;
    if (error.name === "TimeoutError" || error.message?.toLowerCase().includes("timeout")) {
      throw new Error("TIMEOUT");
    }
    throw new Error("EXTERNAL_ERROR");
  }
}

// Calcular frete via API pública dos Correios
async function calcularViaSoapCorreios(
  cepDestino: string,
  peso: number,
  comprimento: number,
  altura: number,
  largura: number,
  valorDeclarado: number,
  codigoServico: string
): Promise<{ valor: string; prazo: string; erro?: string }> {
  const params = new URLSearchParams({
    nCdEmpresa: "",
    sDsSenha: "",
    nCdServico: codigoServico,
    sCepOrigem: CEP_ORIGEM,
    sCepDestino: cepDestino,
    nVlPeso: peso.toString(),
    nCdFormato: "1",
    nVlComprimento: comprimento.toString(),
    nVlAltura: altura.toString(),
    nVlLargura: largura.toString(),
    nVlDiametro: "0",
    sCdMaoPropria: "N",
    nVlValorDeclarado: valorDeclarado > 0 ? valorDeclarado.toString() : "0",
    sCdAvisoRecebimento: "N",
    StrRetorno: "xml",
    nIndicaCalculo: "3",
  });

  const url = `http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx?${params.toString()}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      return { valor: "0,00", prazo: "0", erro: "Serviço indisponível" };
    }
    const text = await response.text();

    const getTag = (tag: string) => {
      const match = text.match(new RegExp(`<${tag}>([^<]*)</${tag}>`));
      return match ? match[1].trim() : "";
    };

    const erro = getTag("Erro");
    const msgErro = getTag("MsgErro");
    const valor = getTag("Valor");
    const prazo = getTag("PrazoEntrega");

    if (erro && erro !== "0") {
      return { valor: "0,00", prazo: "0", erro: msgErro || "Serviço indisponível" };
    }

    return { valor: valor || "0,00", prazo: prazo || "0" };
  } catch (err) {
    const error = err as Error;
    if (error.name === "TimeoutError" || error.message?.toLowerCase().includes("timeout")) {
      return { valor: "0,00", prazo: "0", erro: "timeout" };
    }
    return { valor: "0,00", prazo: "0", erro: "Serviço indisponível" };
  }
}

// Fallback: estimar frete por UF
function estimarFrete(ufDestino: string, peso: number) {
  const tabelaPAC: Record<string, { base: number; prazo: number }> = {
    SP: { base: 18.0, prazo: 4 }, RJ: { base: 22.0, prazo: 5 }, MG: { base: 22.0, prazo: 5 },
    ES: { base: 22.0, prazo: 6 }, PR: { base: 22.0, prazo: 5 }, SC: { base: 24.0, prazo: 6 },
    RS: { base: 26.0, prazo: 7 }, MS: { base: 24.0, prazo: 6 }, MT: { base: 28.0, prazo: 8 },
    GO: { base: 24.0, prazo: 6 }, DF: { base: 24.0, prazo: 6 }, BA: { base: 28.0, prazo: 8 },
    SE: { base: 30.0, prazo: 9 }, AL: { base: 30.0, prazo: 9 }, PE: { base: 30.0, prazo: 10 },
    PB: { base: 32.0, prazo: 10 }, RN: { base: 32.0, prazo: 10 }, CE: { base: 32.0, prazo: 10 },
    PI: { base: 34.0, prazo: 11 }, MA: { base: 34.0, prazo: 12 }, PA: { base: 36.0, prazo: 12 },
    AP: { base: 40.0, prazo: 15 }, AM: { base: 42.0, prazo: 15 }, RR: { base: 44.0, prazo: 18 },
    AC: { base: 44.0, prazo: 18 }, RO: { base: 36.0, prazo: 10 }, TO: { base: 30.0, prazo: 8 },
  };

  const tabelaSEDEX: Record<string, { base: number; prazo: number }> = {
    SP: { base: 28.0, prazo: 1 }, RJ: { base: 35.0, prazo: 2 }, MG: { base: 35.0, prazo: 2 },
    ES: { base: 38.0, prazo: 2 }, PR: { base: 35.0, prazo: 2 }, SC: { base: 38.0, prazo: 3 },
    RS: { base: 42.0, prazo: 3 }, MS: { base: 38.0, prazo: 3 }, MT: { base: 45.0, prazo: 4 },
    GO: { base: 38.0, prazo: 3 }, DF: { base: 38.0, prazo: 3 }, BA: { base: 48.0, prazo: 4 },
    SE: { base: 50.0, prazo: 4 }, AL: { base: 50.0, prazo: 5 }, PE: { base: 52.0, prazo: 5 },
    PB: { base: 54.0, prazo: 5 }, RN: { base: 54.0, prazo: 5 }, CE: { base: 54.0, prazo: 5 },
    PI: { base: 56.0, prazo: 6 }, MA: { base: 56.0, prazo: 6 }, PA: { base: 60.0, prazo: 6 },
    AP: { base: 68.0, prazo: 8 }, AM: { base: 72.0, prazo: 8 }, RR: { base: 76.0, prazo: 10 },
    AC: { base: 76.0, prazo: 10 }, RO: { base: 56.0, prazo: 5 }, TO: { base: 48.0, prazo: 4 },
  };

  const uf = ufDestino.toUpperCase();
  const pacInfo = tabelaPAC[uf] || { base: 30.0, prazo: 10 };
  const sedexInfo = tabelaSEDEX[uf] || { base: 50.0, prazo: 5 };
  const fatorPeso = 1 + Math.max(0, peso - 0.5) * 0.6;

  return {
    pac: { valor: (pacInfo.base * fatorPeso).toFixed(2).replace(".", ","), prazo: pacInfo.prazo.toString() },
    sedex: { valor: (sedexInfo.base * fatorPeso).toFixed(2).replace(".", ","), prazo: sedexInfo.prazo.toString() },
  };
}

export async function POST(request: NextRequest) {
  const rateLimitResult = rateLimiter(request, "shipping", {
    limit: 15,
    windowMs: 60 * 1000,
  });

  if (!rateLimitResult.success) {
    return apiError(
      "Muitas requisições de cálculo de frete. Tente novamente mais tarde.",
      "TOO_MANY_REQUESTS",
      429
    );
  }

  try {
    const json = await request.json();
    const parsedResult = shippingSchema.safeParse(json);
    if (!parsedResult.success) {
      return handleApiError(parsedResult.error);
    }

    const { cepDestino, peso, comprimento, altura, largura, valor } = parsedResult.data;

    let endereco;
    try {
      const res = await buscarEndereco(cepDestino);
      if (res.erro) {
        return badRequest("CEP não encontrado ou inválido.");
      }
      endereco = {
        logradouro: res.logradouro || "",
        bairro: res.bairro || "",
        cidade: res.cidade || "",
        uf: res.uf || "",
      };
    } catch (err) {
      const error = err as Error;
      if (error.message === "TIMEOUT") {
        return apiError("O serviço de consulta de CEP expirou. Tente novamente.", "GATEWAY_TIMEOUT", 504);
      }
      return apiError("Ocorreu uma falha ao consultar o serviço externo de CEP.", "BAD_GATEWAY", 502);
    }

    const servicos = [{ codigo: "04510", nome: "PAC" }, { codigo: "04014", nome: "SEDEX" }];

    const results = await Promise.all(
      servicos.map(async (s) => {
        try {
          const r = await calcularViaSoapCorreios(cepDestino, peso, comprimento, altura, largura, valor, s.codigo);
          return { servico: s.nome, codigo: s.codigo, valor: r.valor, prazo: r.prazo, erro: r.erro };
        } catch {
          return { servico: s.nome, codigo: s.codigo, valor: "0,00", prazo: "0", erro: "timeout" };
        }
      })
    );

    const successResults = results.filter((r) => !r.erro);
    let finalOptions = successResults;
    let usouFallback = false;

    if (successResults.length === 0) {
      usouFallback = true;
      const estimativa = estimarFrete(endereco.uf, peso);
      finalOptions = [
        { servico: "PAC", codigo: "04510", valor: estimativa.pac.valor, prazo: estimativa.pac.prazo },
        { servico: "SEDEX", codigo: "04014", valor: estimativa.sedex.valor, prazo: estimativa.sedex.prazo },
      ];
    }

    if (finalOptions.length === 0) {
      return apiError("Não há opções de frete disponíveis para este endereço e peso.", "SHIPPING_UNAVAILABLE", 400);
    }

    return apiSuccess({
      cepDestino,
      endereco,
      opcoes: finalOptions,
      estimativa: usouFallback,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
