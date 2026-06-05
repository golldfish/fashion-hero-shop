"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

interface SellerSession {
  id: string;
  name: string;
  returnRate: number;
  commissionRate: number;
  canPromote: boolean;
}

export function useSellerSession() {
  const [seller, setSeller] = useState<SellerSession | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/seller/me");
      if (res.ok) {
        setSeller(await res.json() as SellerSession);
      } else {
        setSeller(null);
      }
    } catch {
      setSeller(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check, pathname]);

  const logout = useCallback(async () => {
    await fetch("/api/seller/logout", { method: "POST" });
    setSeller(null);
  }, []);

  return { seller, loading, refetch: check, logout };
}
