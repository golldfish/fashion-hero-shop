"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SearchIcon,
  UserIcon,
  CartIcon,
  MenuIcon,
  CloseIcon,
  HeartIcon,
  StoreIcon,
  LogOutIcon,
  LayoutDashboardIcon,
} from "./icons";
import { SearchModal } from "./search-modal";
import { MegaMenuNav, MobileMegaMenuContent } from "./mega-menu";
import { useAuth } from "./auth-provider";
import { useSellerSession } from "@/hooks/use-seller-session";

interface HeaderProps {
  onCartOpen?: () => void;
  cartCount?: number;
  wishlistCount?: number;
}

export function Header({ onCartOpen, cartCount = 0, wishlistCount = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();

  const { user: buyer, logout: buyerLogout } = useAuth();
  const { seller, logout: sellerLogout } = useSellerSession();

  const isSeller = !!seller;
  const isBuyer = !isSeller && !!buyer;
  const isGuest = !isSeller && !buyer;

  async function handleBuyerLogout() {
    buyerLogout();
    router.push("/");
  }

  async function handleSellerLogout() {
    await sellerLogout();
    router.push("/login");
  }

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-black/5">
      <nav className="mx-auto flex h-14 items-center px-4 lg:px-8 relative">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-1 mr-3"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>

        {/* Logo */}
        <Link href={isSeller ? "/seller/dashboard" : "/"} className="mr-8">
          <span className="text-xl font-semibold italic tracking-tight text-charcoal">
            FashionHero
          </span>
        </Link>

        {/* Desktop nav — only for buyers and guests */}
        {!isSeller && <MegaMenuNav />}

        {/* Seller context label */}
        {isSeller && (
          <span className="hidden lg:flex items-center gap-1.5 text-xs text-[var(--color-warm-gray)]">
            <StoreIcon className="h-4 w-4" />
            Panel Sprzedawcy
            <span className="font-medium text-[var(--color-charcoal)]">· {seller.name}</span>
          </span>
        )}

        {/* ── Right side icons ── */}
        <div className="flex items-center gap-1 ml-auto">

          {/* GUEST */}
          {isGuest && (
            <>
              <button
                aria-label="Szukaj"
                className="p-2 hover:opacity-60 transition-opacity"
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon />
              </button>
              <Link
                href="/login"
                className="ml-1 px-3 py-1.5 text-[12px] font-medium border border-[var(--color-charcoal)] text-[var(--color-charcoal)] rounded hover:bg-[var(--color-charcoal)] hover:text-white transition"
              >
                Zaloguj się
              </Link>
            </>
          )}

          {/* BUYER */}
          {isBuyer && (
            <>
              <button
                aria-label="Szukaj"
                className="p-2 hover:opacity-60 transition-opacity"
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon />
              </button>
              <Link
                href="/wishlist"
                aria-label="Ulubione"
                className="p-2 hover:opacity-60 transition-opacity relative hidden sm:block"
              >
                <HeartIcon className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                aria-label="Koszyk"
                className="p-2 hover:opacity-60 transition-opacity relative"
                onClick={onCartOpen}
              >
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[var(--color-charcoal)] text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link
                href="/account"
                aria-label="Konto"
                className="p-2 hover:opacity-60 transition-opacity hidden sm:flex items-center justify-center"
              >
                <span className="w-5 h-5 rounded-full bg-[var(--color-charcoal)] text-white text-[11px] font-medium flex items-center justify-center">
                  {buyer.firstName.charAt(0).toUpperCase()}
                </span>
              </Link>
              <button
                aria-label="Wyloguj"
                onClick={handleBuyerLogout}
                className="p-2 hover:opacity-60 transition-opacity hidden sm:block"
                title="Wyloguj się"
              >
                <LogOutIcon />
              </button>
            </>
          )}

          {/* SELLER */}
          {isSeller && (
            <>
              <Link
                href="/seller/dashboard"
                aria-label="Dashboard"
                className="p-2 hover:opacity-60 transition-opacity hidden sm:block"
                title="Dashboard sprzedawcy"
              >
                <LayoutDashboardIcon />
              </Link>
              <Link
                href="/seller/products"
                aria-label="Moje produkty"
                className="p-2 hover:opacity-60 transition-opacity relative hidden sm:block"
                title="Wszystkie moje produkty"
              >
                <StoreIcon />
              </Link>
              <button
                aria-label="Wyloguj"
                onClick={handleSellerLogout}
                className="p-2 hover:opacity-60 transition-opacity hidden sm:block"
                title="Wyloguj się"
              >
                <LogOutIcon />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Mobile menu — buyers and guests only */}
      {!isSeller && (
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-[500px]" : "max-h-0"
          )}
        >
          <div className="px-4 py-4 space-y-1 border-t border-black/5">
            <MobileMegaMenuContent onLinkClick={() => setMobileMenuOpen(false)} />
            {isGuest && (
              <Link
                href="/login"
                className="block text-sm py-2 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Zaloguj się
              </Link>
            )}
            {isBuyer && (
              <>
                <Link href="/account" className="block text-sm py-2" onClick={() => setMobileMenuOpen(false)}>
                  Moje konto
                </Link>
                <Link href="/wishlist" className="block text-sm py-2" onClick={() => setMobileMenuOpen(false)}>
                  Ulubione
                </Link>
                <button className="block text-sm py-2 text-left w-full" onClick={handleBuyerLogout}>
                  Wyloguj się
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile seller nav */}
      {isSeller && (
        <div
          className={cn(
            "lg:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-[300px]" : "max-h-0"
          )}
        >
          <div className="px-4 py-4 space-y-1 border-t border-black/5">
            <Link href="/seller/dashboard" className="block text-sm py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
            <Link href="/seller/products" className="block text-sm py-2" onClick={() => setMobileMenuOpen(false)}>
              Moje produkty
            </Link>
            <button className="block text-sm py-2 text-left w-full" onClick={handleSellerLogout}>
              Wyloguj się
            </button>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
