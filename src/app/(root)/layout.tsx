import { getCart } from "@/lib/actions/cart";
import { CartProvider } from "@/components/cart/CartContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cart = await getCart();

  return (
    <CartProvider initialCart={cart}>
      {children}
    </CartProvider>
  );
}
