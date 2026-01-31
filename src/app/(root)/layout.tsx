import { getCart } from "@/lib/actions/cart";
import { getCurrentUser } from "@/lib/auth/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/cart/CartContext";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cart = await getCart();
  const user = await getCurrentUser();

  return (
    <CartProvider initialCart={cart}>
      <Navbar cartCount={cart?.totalQuantity ?? 0} user={user} />
      {children}
      <Footer />
    </CartProvider>
  );
}
