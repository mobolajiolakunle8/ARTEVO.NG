"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import NotificationBar from "./NotificationBar";
import { Search, Menu, X, ArrowRight, Heart } from "lucide-react";
import { useWishlist } from "./useWishlist";

export default function Header() {
  const { count: wishlistCount } = useWishlist();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
    setShowSearchModal(false);
  }, [pathname]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/artworks?search=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSearchResults(data.artworks || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const navLinks = [
    { name: "Collections", href: "/collections" },
    { name: "Artwork", href: "/artwork" },
    { name: "Spaces", href: "/spaces" },
    { name: "Journal", href: "/journal" },
    { name: "Auction Room", href: "/auction" },
    { name: "About", href: "/about" },
    { name: "Track Order", href: "/track-order" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <>
      <NotificationBar />

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#161616]/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Logo variant="full" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-widest uppercase transition-colors relative py-1 font-medium ${
                    active ? "text-[#A85C43] font-semibold" : "text-[#161616]/80 hover:text-[#A85C43]"
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A85C43]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 text-[#161616] hover:text-[#A85C43] transition-colors rounded-full hover:bg-[#161616]/5"
              title="Search Artwork"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/wishlist"
              className="relative p-2 text-[#161616] hover:text-[#A85C43] transition-colors rounded-full hover:bg-[#161616]/5"
              title="Saved Artworks"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-[#A85C43] text-[#FAF7F2] text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              href="/track-order"
              className="hidden lg:inline-flex items-center text-xs tracking-wider uppercase border border-[#161616]/30 px-3.5 py-2 hover:border-[#A85C43] hover:text-[#A85C43] transition-all rounded-sm font-medium"
            >
              Track Order
            </Link>

            <Link
              href="/spaces/custom"
              className="hidden sm:inline-flex items-center text-xs tracking-wider uppercase bg-[#161616] text-[#FAF7F2] px-4 py-2 hover:bg-[#A85C43] transition-all rounded-sm font-medium shadow-sm"
            >
              Commission Art
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-[#161616] hover:text-[#A85C43]"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#161616]/60 backdrop-blur-sm md:hidden flex justify-end">
          <div className="w-4/5 max-w-sm bg-[#FAF7F2] h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-[#161616]/10">
                <Logo />
                <button onClick={() => setIsOpen(false)} className="p-2 text-[#161616]">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-8 flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-serif tracking-wider text-[#161616] hover:text-[#A85C43] py-2 border-b border-[#161616]/5 flex items-center justify-between"
                  >
                    <span>{link.name}</span>
                    <ArrowRight className="w-4 h-4 text-[#B5965A]" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-[#161616]/10 space-y-3">
              <Link
                href="/spaces/custom"
                className="w-full text-center block text-xs tracking-widest uppercase bg-[#161616] text-[#FAF7F2] py-3 rounded hover:bg-[#A85C43] transition-colors"
              >
                Request Custom Commission
              </Link>
              <Link
                href="/admin"
                className="w-full text-center block text-xs tracking-widest uppercase border border-[#B5965A] text-[#161616] py-3 rounded hover:bg-[#B5965A] hover:text-white transition-colors"
              >
                Admin Studio Access
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-[#161616]/80 backdrop-blur-md flex items-start justify-center pt-20 px-4">
          <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden border border-[#B5965A]/40">
            <div className="p-4 border-b border-[#161616]/10 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#B5965A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search artwork title, artist, or reference code (e.g. ART-AFR-001)..."
                className="w-full bg-transparent text-base focus:outline-none text-[#161616] placeholder:text-[#B7AEA2]"
                autoFocus
              />
              <button onClick={() => setShowSearchModal(false)} className="p-1 text-[#161616]/60 hover:text-[#161616]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-4">
              {searching ? (
                <div className="py-8 text-center text-sm text-[#B7AEA2]">Searching ARTÉVO archives...</div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {searchResults.map((art) => (
                    <Link
                      key={art.id}
                      href={`/artwork/${art.slug}`}
                      className="flex items-center gap-4 p-2 rounded hover:bg-[#161616]/5 transition-colors group"
                    >
                      <img src={art.image} alt={art.title} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <div className="text-xs text-[#B5965A] font-medium uppercase tracking-wider">{art.refCode} • {art.collectionSlug}</div>
                        <h4 className="font-serif text-base text-[#161616] group-hover:text-[#A85C43] transition-colors">{art.title}</h4>
                        <div className="text-xs text-[#B7AEA2]">by {art.artist}</div>
                      </div>
                      <div className="font-serif text-sm font-semibold text-[#161616]">₦{art.price.toLocaleString()}</div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="py-8 text-center text-sm text-[#B7AEA2]">No artwork found matching "{searchQuery}"</div>
              ) : (
                <div className="py-6 text-xs text-[#B7AEA2] uppercase tracking-wider text-center">
                  Try searching "Echoes", "Bello", "ART-AFR-001", or "Form"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
