"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthRole } from "@/lib/api";

const PUBLIC_PATHS = ["/", "/login", "/signup"];

export default function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = getAuthRole();
    const isPublic = PUBLIC_PATHS.includes(pathname);
    const isAdminRoute = pathname.startsWith("/admin");

    if (!token && !isPublic) {
      router.replace("/login");
      return;
    }

    if (isAdminRoute && role !== "admin") {
      router.replace("/");
      return;
    }

    if (token && isPublic) {
      router.replace("/");
    }
  }, [pathname, router]);

  return null;
}
