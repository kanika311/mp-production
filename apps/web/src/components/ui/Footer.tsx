"use client";
import { usePathname } from "next/navigation";
import { HoverFooter } from "./hover-footer";

export function Footer() {
  const pathname = usePathname() || "";
  
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/super-admin") ||
    pathname.startsWith("/sushant") ||
    pathname.startsWith("/sushnat") ||
    pathname.startsWith("/studio-8f2k") ||
    pathname.startsWith("/talent-dashboard") ||
    pathname.startsWith("/client-portal") ||
    pathname.startsWith("/editor-portal") ||
    pathname.startsWith("/employee-portal") ||
    pathname.startsWith("/project-manager") ||
    pathname.startsWith("/model/dashboard")
  ) {
    return null;
  }

  return <HoverFooter />;
}

export default Footer;
