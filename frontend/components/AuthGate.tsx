"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function AuthGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!token && !isPublic) {
      router.replace("/login");
      return;
    }

    if (token && isPublic) {
      router.replace("/");
    }
  }, [pathname, router]);

  return null;
}
