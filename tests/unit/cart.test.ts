/**
 * @vitest-environment jsdom
 */
import { describe, test, beforeEach } from "vitest";
import assert from "node:assert/strict";
import {
  readCart,
  clearCart,
  addToCart,
  removeFromCart,
  setCartItemQuantity,
  getCartCount,
  getCartSubtotal,
  CART_STORAGE_KEY,
} from "@/lib/cart";

describe("Cart Business Logic (src/lib/cart.ts)", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") {
      window.localStorage.clear();
    }
  });

  test("deve iniciar com carrinho vazio", () => {
    const items = readCart();
    assert.deepEqual(items, []);
  });

  test("deve adicionar item ao carrinho", () => {
    addToCart({
      productId: "prod-1",
      name: "Filamento PLA",
      slug: "filamento-pla",
      price: 150.0,
      quantity: 2,
      maxQuantity: 10,
    });

    const items = readCart();
    assert.equal(items.length, 1);
    assert.equal(items[0].productId, "prod-1");
    assert.equal(items[0].quantity, 2);
    assert.equal(items[0].price, 150.0);
  });

  test("deve somar quantidade se o produto ja existe no carrinho", () => {
    addToCart({
      productId: "prod-1",
      name: "Filamento PLA",
      slug: "filamento-pla",
      price: 150.0,
      quantity: 2,
      maxQuantity: 10,
    });

    addToCart({
      productId: "prod-1",
      name: "Filamento PLA",
      slug: "filamento-pla",
      price: 150.0,
      quantity: 3,
      maxQuantity: 10,
    });

    const items = readCart();
    assert.equal(items.length, 1);
    assert.equal(items[0].quantity, 5);
  });

  test("deve bloquear adicao de produto esgotado", () => {
    assert.throws(
      () => {
        addToCart({
          productId: "prod-1",
          name: "Filamento PLA",
          slug: "filamento-pla",
          price: 150.0,
          quantity: 1,
          maxQuantity: 0,
        });
      },
      /Produto esgotado no momento/
    );
  });

  test("deve bloquear quantidade acumulada maior que o estoque", () => {
    addToCart({
      productId: "prod-1",
      name: "Filamento PLA",
      slug: "filamento-pla",
      price: 150.0,
      quantity: 3,
      maxQuantity: 5,
    });

    assert.throws(
      () => {
        addToCart({
          productId: "prod-1",
          name: "Filamento PLA",
          slug: "filamento-pla",
          price: 150.0,
          quantity: 3,
          maxQuantity: 5,
        });
      },
      /Quantidade solicitada indisponível. Estoque máximo: 5/
    );
  });

  test("deve alterar quantidade com sucesso se respeitar o estoque", () => {
    addToCart({
      productId: "prod-1",
      name: "Filamento PLA",
      slug: "filamento-pla",
      price: 150.0,
      quantity: 2,
      maxQuantity: 10,
    });

    setCartItemQuantity("prod-1", 6);
    const items = readCart();
    assert.equal(items[0].quantity, 6);
  });

  test("deve bloquear alteracao de quantidade maior que o estoque", () => {
    addToCart({
      productId: "prod-1",
      name: "Filamento PLA",
      slug: "filamento-pla",
      price: 150.0,
      quantity: 2,
      maxQuantity: 10,
    });

    assert.throws(
      () => {
        setCartItemQuantity("prod-1", 12);
      },
      /Quantidade solicitada indisponível. Estoque máximo: 10/
    );
  });

  test("deve validar quantidade positiva na alteracao", () => {
    addToCart({
      productId: "prod-1",
      name: "Filamento PLA",
      slug: "filamento-pla",
      price: 150.0,
      quantity: 2,
      maxQuantity: 10,
    });

    assert.throws(
      () => {
        setCartItemQuantity("prod-1", 0);
      },
      /Quantidade deve ser maior ou igual a 1/
    );

    assert.throws(
      () => {
        setCartItemQuantity("prod-1", -5);
      },
      /Quantidade deve ser maior ou igual a 1/
    );
  });

  test("deve remover item do carrinho", () => {
    addToCart({
      productId: "prod-1",
      name: "Filamento PLA",
      slug: "filamento-pla",
      price: 150.0,
      quantity: 2,
      maxQuantity: 10,
    });

    removeFromCart("prod-1");
    const items = readCart();
    assert.equal(items.length, 0);
  });

  test("deve limpar o carrinho completamente", () => {
    addToCart({
      productId: "prod-1",
      name: "Filamento PLA",
      slug: "filamento-pla",
      price: 150.0,
      quantity: 2,
      maxQuantity: 10,
    });

    clearCart();
    const items = readCart();
    assert.equal(items.length, 0);
  });

  test("deve calcular subtotal corretamente", () => {
    addToCart({
      productId: "prod-1",
      name: "Filamento PLA",
      slug: "filamento-pla",
      price: 150.0,
      quantity: 2,
      maxQuantity: 10,
    });

    addToCart({
      productId: "prod-2",
      name: "Extrusora",
      slug: "extrusora",
      price: 300.0,
      quantity: 1,
      maxQuantity: 5,
    });

    assert.equal(getCartCount(), 3);
    assert.equal(getCartSubtotal(), 600.0);
  });

  test("deve tolerar JSON corrompido no localStorage retornando vazio", () => {
    window.localStorage.setItem(CART_STORAGE_KEY, "invalid-json{corrupt}");
    const items = readCart();
    assert.deepEqual(items, []);
  });

  test("deve sanear itens estruturalmente invalidos no localStorage", () => {
    const invalidItems = [
      { productId: "prod-1", name: "Correto", slug: "correto", quantity: 2, price: 100 },
      { productId: "prod-2", name: "Sem slug", quantity: 3, price: 120 }, // sem slug
      null, // objeto nulo
      { productId: "prod-3", name: "Invalido", slug: "invalido", quantity: "duas" }, // quantity string
    ];

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(invalidItems));

    const items = readCart();
    assert.equal(items.length, 1);
    assert.equal(items[0].productId, "prod-1");
    assert.equal(items[0].quantity, 2);
  });
});
