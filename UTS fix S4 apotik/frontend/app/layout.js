import "./global.css";
import { CartProvider } from "./context/CartContext";
import AppShell from "./components/AppShell";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      </body>
    </html>
  );
}