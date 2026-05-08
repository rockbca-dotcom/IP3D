import { NextRequest, NextResponse } from "next/server";

// CEP de origem (IP3D - Birigui/SP)
const CEP_ORIGEM = "16200000"; // Birigui - SP

interface FreteRequest {
  cepDestino: string;
  peso?: number; // em kg
  comprimento?: number; // em cm
  altura?: number; // em cm
  largura?: number; // em cm
  valor?: number; // valor declarado
}

interface FreteResult {
  servico: string;
  codigo: string;
  valor: string;
  prazo: string;
  erro?: string;
}

// Buscar endereço via ViaCEP (API gratuita e confiável)
async function buscarEndereco(cep: string) {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await response.json();
    if (data.erro) return null;
    return {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      uf: data.uf || "",
    };
  } catch {
    return null;
  }
}

// Calcular frete via API pública dos Correios (CalcPrecoPrazo ASPX)
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

    if (valor) {
      return { valor, prazo: prazo || "0" };
    }

    return { valor: "0,00", prazo: "0", erro: "Resposta vazia dos Correios" };
  } catch (err) {
    console.error("Erro SOAP Correios:", err);
    return { valor: "0,00", prazo: "0", erro: "timeout" };
  }
}

// Fallback: estimar frete com base na distância (UF origem → UF destino)
function estimarFrete(
  ufDestino: string,
  peso: number
): { pac: { valor: string; prazo: string }; sedex: { valor: string; prazo: string } } {
  // Tabela simplificada de preços base por região (a partir de SP interior)
  // Valores aproximados para peso até 1kg - tarifa de balcão 2025
  const tabelaPAC: Record<string, { base: number; prazo: number }> = {
    SP: { base: 18.0, prazo: 4 },
    RJ: { base: 22.0, prazo: 5 },
    MG: { base: 22.0, prazo: 5 },
    ES: { base: 22.0, prazo: 6 },
    PR: { base: 22.0, prazo: 5 },
    SC: { base: 24.0, prazo: 6 },
    RS: { base: 26.0, prazo: 7 },
    MS: { base: 24.0, prazo: 6 },
    MT: { base: 28.0, prazo: 8 },
    GO: { base: 24.0, prazo: 6 },
    DF: { base: 24.0, prazo: 6 },
    BA: { base: 28.0, prazo: 8 },
    SE: { base: 30.0, prazo: 9 },
    AL: { base: 30.0, prazo: 9 },
    PE: { base: 30.0, prazo: 10 },
    PB: { base: 32.0, prazo: 10 },
    RN: { base: 32.0, prazo: 10 },
    CE: { base: 32.0, prazo: 10 },
    PI: { base: 34.0, prazo: 11 },
    MA: { base: 34.0, prazo: 12 },
    PA: { base: 36.0, prazo: 12 },
    AP: { base: 40.0, prazo: 15 },
    AM: { base: 42.0, prazo: 15 },
    RR: { base: 44.0, prazo: 18 },
    AC: { base: 44.0, prazo: 18 },
    RO: { base: 36.0, prazo: 10 },
    TO: { base: 30.0, prazo: 8 },
  };

  const tabelaSEDEX: Record<string, { base: number; prazo: number }> = {
    SP: { base: 28.0, prazo: 1 },
    RJ: { base: 35.0, prazo: 2 },
    MG: { base: 35.0, prazo: 2 },
    ES: { base: 38.0, prazo: 2 },
    PR: { base: 35.0, prazo: 2 },
    SC: { base: 38.0, prazo: 3 },
    RS: { base: 42.0, prazo: 3 },
    MS: { base: 38.0, prazo: 3 },
    MT: { base: 45.0, prazo: 4 },
    GO: { base: 38.0, prazo: 3 },
    DF: { base: 38.0, prazo: 3 },
    BA: { base: 48.0, prazo: 4 },
    SE: { base: 50.0, prazo: 4 },
    AL: { base: 50.0, prazo: 5 },
    PE: { base: 52.0, prazo: 5 },
    PB: { base: 54.0, prazo: 5 },
    RN: { base: 54.0, prazo: 5 },
    CE: { base: 54.0, prazo: 5 },
    PI: { base: 56.0, prazo: 6 },
    MA: { base: 56.0, prazo: 6 },
    PA: { base: 60.0, prazo: 6 },
    AP: { base: 68.0, prazo: 8 },
    AM: { base: 72.0, prazo: 8 },
    RR: { base: 76.0, prazo: 10 },
    AC: { base: 76.0, prazo: 10 },
    RO: { base: 56.0, prazo: 5 },
    TO: { base: 48.0, prazo: 4 },
  };

  const uf = ufDestino.toUpperCase();
  const pacInfo = tabelaPAC[uf] || { base: 30.0, prazo: 10 };
  const sedexInfo = tabelaSEDEX[uf] || { base: 50.0, prazo: 5 };

  // Ajustar por peso (cada kg extra adiciona ~30% ao preço base)
  const fatorPeso = 1 + Math.max(0, peso - 0.5) * 0.6;

  const pacValor = (pacInfo.base * fatorPeso).toFixed(2).replace(".", ",");
  const sedexValor = (sedexInfo.base * fatorPeso).toFixed(2).replace(".", ",");

  return {
    pac: { valor: pacValor, prazo: pacInfo.prazo.toString() },
    sedex: { valor: sedexValor, prazo: sedexInfo.prazo.toString() },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: FreteRequest = await request.json();

    const {
      cepDestino,
      peso = 0.3,
      comprimento = 16,
      altura = 5,
      largura = 11,
      valor = 0,
    } = body;

    // Validar CEP
    const cepLimpo = cepDestino.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      return NextResponse.json(
        { error: "CEP inválido. Informe 8 dígitos." },
        { status: 400 }
      );
    }

    // Buscar endereço pelo CEP via ViaCEP
    const endereco = await buscarEndereco(cepLimpo);

    const servicosParaCalcular = [
      { codigo: "04510", nome: "PAC" },
      { codigo: "04014", nome: "SEDEX" },
    ];

    // Tentar Correios API primeiro
    const resultados: FreteResult[] = [];
    let usouFallback = false;

    const promises = servicosParaCalcular.map(async (servico) => {
      try {
        const result = await calcularViaSoapCorreios(
          cepLimpo,
          peso,
          comprimento,
          altura,
          largura,
          valor,
          servico.codigo
        );
        return {
          servico: servico.nome,
          codigo: servico.codigo,
          valor: result.valor,
          prazo: result.prazo,
          erro: result.erro,
        };
      } catch (err) {
        console.error(`Erro ao calcular ${servico.nome}:`, err);
        return {
          servico: servico.nome,
          codigo: servico.codigo,
          valor: "0,00",
          prazo: "0",
          erro: "Erro ao consultar serviço",
        };
      }
    });

    const results = await Promise.all(promises);
    const successResults = results.filter((r) => !r.erro);

    if (successResults.length > 0) {
      resultados.push(...results);
    } else {
      // Fallback: usar estimativa por tabela
      usouFallback = true;
      const uf = endereco?.uf || "SP";
      const estimativa = estimarFrete(uf, peso);

      resultados.push({
        servico: "PAC",
        codigo: "04510",
        valor: estimativa.pac.valor,
        prazo: estimativa.pac.prazo,
      });
      resultados.push({
        servico: "SEDEX",
        codigo: "04014",
        valor: estimativa.sedex.valor,
        prazo: estimativa.sedex.prazo,
      });
    }

    return NextResponse.json({
      cepOrigem: CEP_ORIGEM,
      cepDestino: cepLimpo,
      endereco,
      opcoes: resultados.filter((r) => !r.erro),
      erros: resultados.filter((r) => r.erro),
      estimativa: usouFallback,
    });
  } catch (error) {
    console.error("Erro no cálculo de frete:", error);
    return NextResponse.json(
      { error: "Erro ao calcular frete. Tente novamente." },
      { status: 500 }
    );
  }
}
