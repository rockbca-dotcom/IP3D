import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { POST as shippingPost } from "@/app/api/shipping/route";
import { NextRequest } from "next/server";

describe("API Frete - /api/shipping", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("deve retornar 200 e as opções de frete para um CEP válido", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("viacep.com.br")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              cep: "16200-000",
              logradouro: "Rua Teste",
              bairro: "Centro",
              localidade: "Birigui",
              uf: "SP",
            }),
        });
      }
      if (url.includes("ws.correios.com.br")) {
        const isSedex = url.includes("nCdServico=04014");
        const codigo = isSedex ? "04014" : "04510";
        const valor = isSedex ? "28,50" : "18,50";
        const prazo = isSedex ? "1" : "3";
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(`
            <Servicos>
              <cServico>
                <Codigo>${codigo}</Codigo>
                <Valor>${valor}</Valor>
                <PrazoEntrega>${prazo}</PrazoEntrega>
                <Erro>0</Erro>
              </cServico>
            </Servicos>
          `),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const req = new NextRequest("http://localhost/api/shipping", {
      method: "POST",
      body: JSON.stringify({
        cepDestino: "16200-000",
        peso: 0.5,
        comprimento: 16,
        altura: 5,
        largura: 11,
      }),
    });

    const res = await shippingPost(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.cepDestino).toBe("16200000"); // sanitizado
    expect(data.endereco.logradouro).toBe("Rua Teste");
    expect(data.endereco.uf).toBe("SP");
    expect(data.opcoes).toHaveLength(2);
    expect(data.opcoes[0].servico).toBe("PAC");
    expect(data.opcoes[0].valor).toBe("18,50");
    expect(data.opcoes[1].servico).toBe("SEDEX");
    expect(data.opcoes[1].valor).toBe("28,50");
    expect(data.estimativa).toBe(false);
  });

  it("deve aceitar CEP com máscara após sanitização", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("viacep.com.br")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              cep: "01001-000",
              logradouro: "Praça da Sé",
              bairro: "Sé",
              localidade: "São Paulo",
              uf: "SP",
            }),
        });
      }
      if (url.includes("ws.correios.com.br")) {
        const isSedex = url.includes("nCdServico=04014");
        const codigo = isSedex ? "04014" : "04510";
        const valor = isSedex ? "28,50" : "18,50";
        const prazo = isSedex ? "1" : "3";
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(`
            <Servicos>
              <cServico>
                <Codigo>${codigo}</Codigo>
                <Valor>${valor}</Valor>
                <PrazoEntrega>${prazo}</PrazoEntrega>
                <Erro>0</Erro>
              </cServico>
            </Servicos>
          `),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const req = new NextRequest("http://localhost/api/shipping", {
      method: "POST",
      body: JSON.stringify({
        cepDestino: "01001-000", // Com máscara
        peso: 0.5,
        comprimento: 16,
        altura: 5,
        largura: 11,
      }),
    });

    const res = await shippingPost(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.cepDestino).toBe("01001000");
  });

  it("deve retornar 400 Bad Request para CEP inválido ou inexistente", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("viacep.com.br")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ erro: true }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const req = new NextRequest("http://localhost/api/shipping", {
      method: "POST",
      body: JSON.stringify({
        cepDestino: "99999-999", // Inexistente
        peso: 0.5,
      }),
    });

    const res = await shippingPost(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("BAD_REQUEST");
    expect(data.error.message).toBe("CEP não encontrado ou inválido.");
  });

  it("deve retornar 400 Bad Request para payload malformado/inválido", async () => {
    const req = new NextRequest("http://localhost/api/shipping", {
      method: "POST",
      body: JSON.stringify({
        cepDestino: "123", // Inválido (deve ser de 8 dígitos)
        peso: -5, // Inválido (deve ser positivo)
      }),
    });

    const res = await shippingPost(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("BAD_REQUEST");
  });

  it("deve retornar 400 Bad Request se os limites de transporte (peso/soma) forem ultrapassados", async () => {
    const reqExcedePeso = new NextRequest("http://localhost/api/shipping", {
      method: "POST",
      body: JSON.stringify({
        cepDestino: "16200000",
        peso: 31, // Excede 30kg
      }),
    });

    const resExcedePeso = await shippingPost(reqExcedePeso);
    const dataExcedePeso = await resExcedePeso.json();
    expect(resExcedePeso.status).toBe(400);
    expect(dataExcedePeso.error.details[0].message).toBe("Peso máximo permitido é 30kg");

    const reqExcedeSoma = new NextRequest("http://localhost/api/shipping", {
      method: "POST",
      body: JSON.stringify({
        cepDestino: "16200000",
        peso: 1,
        comprimento: 90,
        altura: 90,
        largura: 30, // Soma = 210cm (Excede 200cm)
      }),
    });

    const resExcedeSoma = await shippingPost(reqExcedeSoma);
    const dataExcedeSoma = await resExcedeSoma.json();
    expect(resExcedeSoma.status).toBe(400);
    expect(dataExcedeSoma.error.details[0].message).toBe("A soma das dimensões não deve ultrapassar 200cm");
  });

  it("deve retornar 504 Gateway Timeout seguro em caso de lentidão extrema no ViaCEP", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("viacep.com.br")) {
        const timeoutError = new Error("The operation was aborted.");
        timeoutError.name = "TimeoutError";
        return Promise.reject(timeoutError);
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const req = new NextRequest("http://localhost/api/shipping", {
      method: "POST",
      body: JSON.stringify({
        cepDestino: "16200-000",
        peso: 0.5,
      }),
    });

    const res = await shippingPost(req);
    const data = await res.json();

    expect(res.status).toBe(504);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("GATEWAY_TIMEOUT");
    expect(data.error.message).toBe("O serviço de consulta de CEP expirou. Tente novamente.");
  });

  it("deve retornar 502 Bad Gateway seguro em caso de falha de rede/HTTP no ViaCEP", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("viacep.com.br")) {
        return Promise.resolve({
          ok: false,
          status: 500,
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const req = new NextRequest("http://localhost/api/shipping", {
      method: "POST",
      body: JSON.stringify({
        cepDestino: "16200-000",
        peso: 0.5,
      }),
    });

    const res = await shippingPost(req);
    const data = await res.json();

    expect(res.status).toBe(502);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("BAD_GATEWAY");
    expect(data.error.message).toBe("Ocorreu uma falha ao consultar o serviço externo de CEP.");
  });

  it("deve ativar estimativa de frete local caso a chamada SOAP Correios falhe/retorne erro", async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("viacep.com.br")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              cep: "16200-000",
              logradouro: "Rua Teste",
              bairro: "Centro",
              localidade: "Birigui",
              uf: "SP",
            }),
        });
      }
      if (url.includes("ws.correios.com.br")) {
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(`
            <Servicos>
              <cServico>
                <Codigo>04510</Codigo>
                <Valor>0,00</Valor>
                <PrazoEntrega>0</PrazoEntrega>
                <Erro>-3</Erro>
                <MsgErro>CEP de destino invalido</MsgErro>
              </cServico>
            </Servicos>
          `),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const req = new NextRequest("http://localhost/api/shipping", {
      method: "POST",
      body: JSON.stringify({
        cepDestino: "16200000",
        peso: 0.5,
      }),
    });

    const res = await shippingPost(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.estimativa).toBe(true); // Usou estimativa/fallback!
    expect(data.opcoes).toHaveLength(2);
    expect(data.opcoes[0].servico).toBe("PAC");
    expect(data.opcoes[0].valor).not.toBe("0,00"); // Calculou com base na UF SP!
    expect(data.opcoes[1].servico).toBe("SEDEX");
    expect(data.opcoes[1].valor).not.toBe("0,00");
  });
});
