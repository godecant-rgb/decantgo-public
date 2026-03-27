export type CartProduct = {
  id: string;
  perfume: string;
  marca: string | null;
  categoria: string | null;
  genero: string | null;
  foto_url: string | null;
  precio_5ml: number | null;
  precio_10ml: number | null;
};

export type CartItem = {
  product: CartProduct;
  presentacion: "5ml" | "10ml";
  cantidad: number;
  precio: number;
};

const CART_KEY = "dg_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CartItem[];
  } catch {
    return [];
  }
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
}

export function addItemToCart(item: CartItem) {
  const cart = getCart();

  const idx = cart.findIndex(
    (i) =>
      i.product.id === item.product.id &&
      i.presentacion === item.presentacion
  );

  if (idx >= 0) {
    cart[idx] = {
      ...cart[idx],
      cantidad: cart[idx].cantidad + item.cantidad,
    };
  } else {
    cart.push(item);
  }

  saveCart(cart);
  return cart;
}

export function updateCartItemQuantity(index: number, cantidad: number) {
  const cart = getCart();

  if (index < 0 || index >= cart.length) return cart;

  if (cantidad <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index] = { ...cart[index], cantidad };
  }

  saveCart(cart);
  return cart;
}

export function removeCartItem(index: number) {
  const cart = getCart();
  if (index < 0 || index >= cart.length) return cart;
  cart.splice(index, 1);
  saveCart(cart);
  return cart;
}

export function getCartCount() {
  return getCart().reduce((acc, item) => acc + item.cantidad, 0);
}