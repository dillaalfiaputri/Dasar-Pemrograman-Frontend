"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const HIDE_NAVBAR_ROUTES = ["/login", "/register"];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const shouldHideNavbar = HIDE_NAVBAR_ROUTES.includes(pathname);

  return (
    <>
      {!shouldHideNavbar && <Navbar />}
      {children}
    </>
  );
}
