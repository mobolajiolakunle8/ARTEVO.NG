"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ImageUploader from "@/components/ImageUploader";
import DatabaseSetupGuide from "@/components/DatabaseSetupGuide";
import { useLiveSync } from "@/components/useWishlist";
import { useAuth } from "@/components/useAuth";
import { Monitor, Wifi, WifiOff } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { syncBroadcast } from "@/lib/sync";
import { firebaseSyncPush } from "@/lib/firebase-sync";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Palette,
  Layers,
  ShoppingBag,
  Gavel,
  BookOpen,
  Building,
  Users,
  BarChart3,
  CreditCard,
  MessageSquare,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Save,
  TrendingUp,
  Wallet,
  Activity,
  Package,
  X,
  Banknote,
  FileCheck,
  Clock,
  Mail,
  Globe,
  Settings,
  RefreshCw,
  Info,
  Upload,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface AdminDashboardClientProps {
  initialArtworks: any[];
  initialCollections: any[];
  initialOrders: any[];
  initialBids: any[];
  initialArticles: any[];
  initialSpaces: any[];
  initialBank: any;
  initialInquiries: any[];
  initialEvents: any[];
  initialSubscribers?: any[];
  databaseReady?: boolean;
}

const fmt = (n: number) => `₦${(n || 0).toLocaleString()}`;
const shortN = (n: number) =>
  n >= 1_000_000 ? `₦${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `₦${Math.round(n / 1_000)}K` : `₦${n || 0}`;

const CHART_COLORS = ["#A85C43", "#B5965A", "#161616", "#B7AEA2", "#874632", "#D4BA82", "#6B6259", "#3A3A3A"];

const STATUS_STYLES: Record<string, string> = {
  "Payment Pending": "bg-amber-100 text-amber-800 border-amber-300",
  "Payment Submitted": "bg-orange-100 text-orange-800 border-orange-300",
  Paid: "bg-emerald-100 text-emerald-800 border-emerald-300",
  "Processing & Framing": "bg-sky-100 text-sky-800 border-sky-300",
  Dispatched: "bg-indigo-100 text-indigo-800 border-indigo-300",
  Delivered: "bg-teal-100 text-teal-800 border-teal-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

export default function AdminDashboardClient({
  initialArtworks,
  initialCollections,
  initialOrders,
  initialBids,
  initialArticles,
  initialSpaces,
  initialBank,
  initialInquiries,
  initialEvents,
  initialSubscribers = [],
  databaseReady = true,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const { user, signOut, firebaseEnabled, liveSessions, presenceState } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [liveIndicator, setLiveIndicator] = useState(false);

  // Cross-browser live sync: any change made in another browser instantly refreshes admin data.
  useLiveSync(
    ["orders", "auctions", "artworks", "collections", "journal", "site-content", "inquiries", "newsletter"],
    () => {
      setLiveIndicator(true);
      router.refresh();
      setTimeout(() => setLiveIndicator(false), 1500);
    }
  );

  const [artworksList, setArtworksList] = useState(initialArtworks);
  const [collectionsList, setCollectionsList] = useState(initialCollections);
  const [ordersList, setOrdersList] = useState(initialOrders);
  const [bidsList, setBidsList] = useState(initialBids);
  const [articlesList, setArticlesList] = useState(initialArticles);
  const [bankConfig, setBankConfig] = useState(initialBank);
  const [inquiriesList, setInquiriesList] = useState(initialInquiries);
  const [spacesList, setSpacesList] = useState(initialSpaces);

  const [artSearch, setArtSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  // Artwork modal
  const [showArtModal, setShowArtModal] = useState(false);
  const [editingArt, setEditingArt] = useState<any>(null);
  const [artTitle, setArtTitle] = useState("");
  const [artArtist, setArtArtist] = useState("Amina K. Bello");
  const [artCollection, setArtCollection] = useState("african-soul");
  const [artPrice, setArtPrice] = useState(1250000);
  const [artStory, setArtStory] = useState("");
  const [artImage, setArtImage] = useState("");
  const [artImagesStr, setArtImagesStr] = useState("");
  const [artOrientation, setArtOrientation] = useState("Portrait");
  const [artEdition, setArtEdition] = useState("Limited Edition (1/25)");
  const [artAuction, setArtAuction] = useState(false);
  const [artMinBid, setArtMinBid] = useState(1200000);

  // Collection modal
  const [showCollModal, setShowCollModal] = useState(false);
  const [collName, setCollName] = useState("");
  const [collSubtitle, setCollSubtitle] = useState("");
  const [collDesc, setCollDesc] = useState("");
  const [collCover, setCollCover] = useState("");

  // Bank form
  const [bankName, setBankName] = useState(bankConfig?.bankName || "");
  const [accountName, setAccountName] = useState(bankConfig?.accountName || "");
  const [accountNumber, setAccountNumber] = useState(bankConfig?.accountNumber || "");
  const [sortCode, setSortCode] = useState(bankConfig?.sortCodeOrSwift || "");
  const [instructions, setInstructions] = useState(bankConfig?.instructions || "");
  const [saveBankSuccess, setSaveBankSuccess] = useState(false);

  // Website editor state
  const [siteContentData, setSiteContentData] = useState<Record<string, Record<string, string>>>({});
  const [siteEditorSection, setSiteEditorSection] = useState("hero");
  const [siteEditorLoaded, setSiteEditorLoaded] = useState(false);
  const [siteEditorSaving, setSiteEditorSaving] = useState(false);
  const [siteEditorSuccess, setSiteEditorSuccess] = useState(false);

  const loadSiteContent = async () => {
    try {
      const res = await fetch("/api/site-content");
      const data = await res.json();
      if (data.content) { setSiteContentData(data.content); setSiteEditorLoaded(true); }
    } catch (e) { console.error(e); }
  };

  const handleSiteContentChange = (section: string, key: string, value: string) => {
    setSiteContentData((prev) => ({ ...prev, [section]: { ...(prev[section] || {}), [key]: value } }));
  };

  const handleSaveSiteContent = async () => {
    setSiteEditorSaving(true);
    try {
      await fetch("/api/site-content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(siteContentData) });
      syncBroadcast("artevo-site-content", { ts: Date.now() });
      setSiteEditorSuccess(true);
      showToast("Website content updated and published.");
      firebaseSyncPush("site-content", "update");
      setTimeout(() => setSiteEditorSuccess(false), 3500);
    } catch (e) { console.error(e); }
    finally { setSiteEditorSaving(false); }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // ---------- Derived analytics ----------
  const totalRevenue = useMemo(
    () =>
      ordersList
        .filter((o) => ["Paid", "Processing & Framing", "Dispatched", "Delivered"].includes(o.status))
        .reduce((s, o) => s + (o.amount || 0), 0),
    [ordersList]
  );
  const pendingRevenue = useMemo(
    () =>
      ordersList
        .filter((o) => ["Payment Pending", "Payment Submitted"].includes(o.status))
        .reduce((s, o) => s + (o.amount || 0), 0),
    [ordersList]
  );

  const revenueTrend = useMemo(() => {
    const days: { label: string; revenue: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const dayOrders = ordersList.filter((o) => new Date(o.createdAt).toDateString() === key);
      days.push({
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayOrders.reduce((s, o) => s + (o.amount || 0), 0),
        orders: dayOrders.length,
      });
    }
    return days;
  }, [ordersList]);

  const ordersByStatus = useMemo(() => {
    const statuses = ["Payment Pending", "Payment Submitted", "Paid", "Processing & Framing", "Dispatched", "Delivered"];
    return statuses.map((s) => ({
      status: s.replace("Processing & Framing", "Framing"),
      count: ordersList.filter((o) => o.status === s).length,
    }));
  }, [ordersList]);

  const artworksByCollection = useMemo(
    () =>
      collectionsList.map((c) => ({
        name: c.name,
        value: artworksList.filter((a) => a.collectionSlug === c.slug).length,
      })),
    [collectionsList, artworksList]
  );

  const pendingVerification = ordersList.filter((o) => o.status === "Payment Submitted");

  // ---------- Handlers ----------
  const handleVerifyOrderPayment = async (orderRef: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderRef}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrdersList((prev) => prev.map((o) => (o.orderRef === orderRef ? data.order : o)));
        showToast(`Order ${orderRef} moved to “${newStatus}”`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openNewArtModal = () => {
    setEditingArt(null);
    setArtTitle("");
    setArtArtist("Amina K. Bello");
    setArtCollection(collectionsList[0]?.slug || "african-soul");
    setArtPrice(1250000);
    setArtStory("A bespoke contemporary masterpiece produced on 310gsm archival cotton rag.");
    setArtImage("https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940");
    setArtImagesStr("https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940");
    setArtOrientation("Portrait");
    setArtEdition("Limited Edition (1/25)");
    setArtAuction(false);
    setArtMinBid(1200000);
    setShowArtModal(true);
  };

  const openEditArtModal = (art: any) => {
    setEditingArt(art);
    setArtTitle(art.title);
    setArtArtist(art.artist);
    setArtCollection(art.collectionSlug);
    setArtPrice(art.price);
    setArtStory(art.story);
    setArtImage(art.image);
    setArtImagesStr(art.images ? art.images.join(", ") : art.image);
    setArtOrientation(art.orientation);
    setArtEdition(art.editionType);
    setArtAuction(art.auctionEnabled || false);
    setArtMinBid(art.minBid || art.price);
    setShowArtModal(true);
  };

  const handleSaveArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    const imagesArr = artImagesStr.split(",").map((s) => s.trim()).filter((s) => s.length > 0);
    const payload = {
      title: artTitle,
      artist: artArtist,
      collectionSlug: artCollection,
      price: Number(artPrice),
      story: artStory,
      image: artImage || imagesArr[0] || "https://images.pexels.com/photos/34017793/pexels-photo-34017793.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
      images: imagesArr.length > 0 ? imagesArr : [artImage],
      orientation: artOrientation,
      editionType: artEdition,
      auctionEnabled: artAuction,
      minBid: Number(artMinBid),
      watermarkEnabled: true,
    };
    try {
      if (editingArt) {
        const res = await fetch(`/api/artworks/id/${editingArt.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setArtworksList((prev) => prev.map((a) => (a.id === editingArt.id ? data.artwork : a)));
          showToast("Artwork updated successfully.");
          firebaseSyncPush("artworks", "update", editingArt.id);
        }
      } else {
        const res = await fetch("/api/artworks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok) {
          setArtworksList((prev) => [data.artwork, ...prev]);
          showToast("New artwork published to catalog.");
          firebaseSyncPush("artworks", "create", data.artwork?.slug);
        }
      }
      setShowArtModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteArt = async (id: number) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId((cur) => (cur === id ? null : cur)), 3000);
      return;
    }
    try {
      const res = await fetch(`/api/artworks/id/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArtworksList((prev) => prev.filter((a) => a.id !== id));
        setConfirmDeleteId(null);
        showToast("Artwork removed from catalog.");
        firebaseSyncPush("artworks", "delete", id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveBankSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bankName, accountName, accountNumber, sortCodeOrSwift: sortCode, instructions, contactEmail: "mobolajiolakunle8@gmail.com" }),
      });
      const data = await res.json();
      if (res.ok) {
        setBankConfig(data.settings);
        setSaveBankSuccess(true);
        showToast("Bank transfer settings published to all checkout pages.");
        firebaseSyncPush("site-content", "payment");
        setTimeout(() => setSaveBankSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: collName,
          subtitle: collSubtitle,
          description: collDesc,
          coverImage: collCover || "https://images.pexels.com/photos/10313987/pexels-photo-10313987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
          featured: true,
          displayOrder: collectionsList.length + 1,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCollectionsList((prev) => [...prev, data.collection]);
        setShowCollModal(false);
        showToast("New collection created.");
        firebaseSyncPush("collections", "create", data.collection?.slug);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = ordersList.filter((o) => {
    if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return (
        o.orderRef.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q) ||
        o.artworkTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredArtworks = artworksList.filter((a) => {
    if (artSearch) {
      const q = artSearch.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q) || a.refCode.toLowerCase().includes(q) || a.collectionSlug.toLowerCase().includes(q);
    }
    return true;
  });

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "artworks", label: "Artwork Manager", icon: Palette, badge: artworksList.length },
    { id: "collections", label: "Collections", icon: Layers, badge: collectionsList.length },
    { id: "orders", label: "Orders & Payments", icon: ShoppingBag, badge: pendingVerification.length || undefined },
    { id: "auctions", label: "Auctions & Bids", icon: Gavel, badge: bidsList.length },
    { id: "journal", label: "Journal", icon: BookOpen },
    { id: "spaces", label: "Spaces Editor", icon: Building },
    { id: "crm", label: "Customers / CRM", icon: Users },
    { id: "analytics", label: "Visits & Analytics", icon: BarChart3 },
    { id: "payments", label: "Bank Payments", icon: CreditCard },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare, badge: inquiriesList.length },
    { id: "newsletter", label: "Newsletter", icon: Mail, badge: initialSubscribers.length || undefined },
    { id: "website_editor", label: "Website Editor", icon: Globe },
    { id: "settings", label: "Brand & Settings", icon: Settings },
  ];

  const tabMeta: Record<string, { title: string; sub: string }> = {
    overview: { title: "Executive Overview", sub: "Live performance across revenue, orders, auctions and curation." },
    artworks: { title: "Artwork Manager", sub: "Publish masterworks, assign collections, mockups and auction controls." },
    collections: { title: "Collections", sub: "Manage the ARTÉVO thematic series and artwork assignments." },
    orders: { title: "Orders & Bank Reconciliation", sub: "Verify Naira bank transfers and advance fulfillment stages." },
    auctions: { title: "Auctions & Bid Ledger", sub: "Confidential bids placed across the private bidding room." },
    journal: { title: "Journal Editor", sub: "Editorial essays, artist stories and styling guides." },
    spaces: { title: "Spaces Editor", sub: "Editions, Limited, Custom and Hospitality divisions." },
    crm: { title: "Collector CRM", sub: "Unified ledger of collectors, spend history and contacts." },
    analytics: { title: "Visits & Analytics", sub: "Database-backed event stream: views, CTA clicks, bids and orders." },
    payments: { title: "Bank Transfer Configuration", sub: "Live account details published to every customer checkout." },
    inquiries: { title: "Client Inquiries", sub: "Commission, hospitality and collector messages." },
    newsletter: { title: "Newsletter Subscribers", sub: "The Collector's Circle — captured for previews and remarketing." },
    website_editor: { title: "Website Content Editor", sub: "Edit every section of your public website — hero, about, contact details and more." },
    settings: { title: "Brand & Business Settings", sub: "Business identity, email, contact info and brand configuration." },
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* ---------- Sidebar ---------- */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#161616] rounded-lg overflow-hidden sticky top-24 self-start shadow-2xl border border-[#B5965A]/30">
        <div className="p-5 border-b border-[#FAF7F2]/10">
          <Logo variant="light" />
          <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-[#B5965A] font-mono">Executive Studio</div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[62vh]">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded text-left text-xs font-medium tracking-wide transition-all ${
                  active ? "bg-[#A85C43] text-[#FAF7F2] shadow-md" : "text-[#B7AEA2] hover:bg-[#FAF7F2]/10 hover:text-[#FAF7F2]"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <IconComp className={`w-4 h-4 ${active ? "text-[#FAF7F2]" : "text-[#B5965A]"}`} />
                  {item.label}
                </span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${active ? "bg-[#FAF7F2]/20 text-[#FAF7F2]" : "bg-[#B5965A]/20 text-[#B5965A]"}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#FAF7F2]/10 bg-[#0d0d0d] space-y-3">
          {/* Realtime session status */}
          {firebaseEnabled && user && (
            <div className="rounded border border-[#B5965A]/30 bg-[#161616] p-2.5">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-[#B7AEA2]">
                <span>Live sessions</span>
                {presenceState === "online" ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wifi className="w-3 h-3" /> Online
                  </span>
                ) : presenceState === "connecting" ? (
                  <span className="text-amber-400">connecting…</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400">
                    <WifiOff className="w-3 h-3" /> Offline
                  </span>
                )}
              </div>
              <div className="mt-1.5 space-y-1">
                {liveSessions.length === 0 ? (
                  <p className="text-[10px] text-[#B7AEA2]">No active sessions detected.</p>
                ) : (
                  liveSessions.slice(0, 5).map((s, i) => (
                    <div key={`${s.email}-${s.lastSeen}-${i}`} className="flex items-center gap-1.5 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="truncate text-[#FAF7F2]">{s.email}</span>
                      <span className="ml-auto flex items-center gap-0.5 text-[#B5965A] shrink-0">
                        <Monitor className="w-3 h-3" /> {s.device.split("·")[0]?.trim() || "device"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-[#B5965A]" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#B5965A] text-[#161616] flex items-center justify-center font-serif font-bold text-sm">
                {(user?.displayName?.[0] || user?.email?.[0] || "A").toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#FAF7F2] font-semibold truncate">
                {user?.displayName || "Chief Curator"}
              </div>
              <div className="text-[10px] text-[#B7AEA2] truncate">
                {user?.email || BRAND.email}
              </div>
            </div>
          </div>
          {firebaseEnabled && user && (
            <button
              onClick={() => signOut()}
              className="w-full text-center text-[10px] uppercase tracking-widest text-[#B7AEA2] hover:text-[#FAF7F2] border border-[#FAF7F2]/10 rounded py-1.5 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>
      </aside>

      {/* ---------- Main ---------- */}
      <div className="flex-1 min-w-0 w-full space-y-6">
        {/* Live database status + guided setup wizard */}
        <DatabaseSetupGuide />

        {/* Top bar */}
        <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <h1 className="font-serif text-2xl text-[#161616] flex items-center gap-2">
              {tabMeta[activeTab].title}
              <span
                title={liveIndicator ? "Live update received" : "Live sync connected"}
                className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border transition-all ${
                  liveIndicator
                    ? "border-emerald-500 bg-emerald-100 text-emerald-800"
                    : "border-[#B5965A]/40 text-[#B5965A]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${liveIndicator ? "bg-emerald-500 animate-pulse" : "bg-[#B5965A]"}`} />
                Live
              </span>
            </h1>
            <p className="text-xs text-[#B7AEA2] mt-0.5">{tabMeta[activeTab].sub}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openNewArtModal}
              className="bg-[#A85C43] text-[#FAF7F2] px-4 py-2.5 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#874632] transition-colors flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Add Artwork
            </button>
            <button
              onClick={() => setShowCollModal(true)}
              className="border border-[#161616]/25 text-[#161616] px-4 py-2.5 rounded text-xs uppercase tracking-widest font-semibold hover:border-[#A85C43] hover:text-[#A85C43] transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Collection
            </button>
          </div>
        </div>

        {/* Mobile nav chips */}
        <div className="lg:hidden bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-2 flex gap-1.5 overflow-x-auto shadow-sm">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`shrink-0 px-3 py-1.5 rounded text-[11px] uppercase tracking-wider font-semibold ${
                  active ? "bg-[#161616] text-[#FAF7F2]" : "text-[#161616]/70 bg-[#161616]/5"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-[60] bg-[#161616] text-[#FAF7F2] border border-[#B5965A] rounded-lg px-5 py-3.5 shadow-2xl flex items-center gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-[#B5965A]" /> {toast}
          </div>
        )}

        {/* ================= OVERVIEW ================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="bg-[#161616] text-[#FAF7F2] p-6 rounded-lg border border-[#B5965A]/40 shadow-lg relative overflow-hidden">
                <Wallet className="absolute -right-4 -bottom-4 w-24 h-24 text-[#B5965A]/10" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#B5965A] block">Verified Revenue</span>
                <span className="font-serif text-3xl font-bold mt-1 block">{shortN(totalRevenue)}</span>
                <span className="text-[11px] text-[#B7AEA2] mt-2 block flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> {fmt(totalRevenue)} confirmed
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-6 rounded-lg border border-[#161616]/15 shadow-sm relative overflow-hidden">
                <Clock className="absolute -right-4 -bottom-4 w-24 h-24 text-[#A85C43]/10" />
                <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2] block font-semibold">Pending Verification</span>
                <span className="font-serif text-3xl font-bold text-[#161616] mt-1 block">{shortN(pendingRevenue)}</span>
                <span className="text-[11px] text-[#A85C43] mt-2 block font-medium">
                  {pendingVerification.length} transfer{pendingVerification.length === 1 ? "" : "s"} awaiting review
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-6 rounded-lg border border-[#161616]/15 shadow-sm relative overflow-hidden">
                <Package className="absolute -right-4 -bottom-4 w-24 h-24 text-[#B5965A]/10" />
                <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2] block font-semibold">Total Orders</span>
                <span className="font-serif text-3xl font-bold text-[#161616] mt-1 block">{ordersList.length}</span>
                <span className="text-[11px] text-[#B7AEA2] mt-2 block">
                  {ordersList.filter((o) => ["Processing & Framing", "Dispatched"].includes(o.status)).length} in fulfillment
                </span>
              </div>

              <div className="bg-[#FAF7F2] p-6 rounded-lg border border-[#161616]/15 shadow-sm relative overflow-hidden">
                <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-[#A85C43]/10" />
                <span className="text-[10px] uppercase tracking-wider text-[#B7AEA2] block font-semibold">Bids & Inquiries</span>
                <span className="font-serif text-3xl font-bold text-[#161616] mt-1 block">{bidsList.length + inquiriesList.length}</span>
                <span className="text-[11px] text-[#B7AEA2] mt-2 block">
                  {artworksList.filter((a) => a.auctionEnabled).length} live auctions • {inquiriesList.length} messages
                </span>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2 bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg text-[#161616]">Order Value — Last 14 Days</h3>
                  <span className="text-[10px] uppercase tracking-wider text-[#B5965A] font-semibold">Naira ₦</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A85C43" stopOpacity={0.55} />
                          <stop offset="100%" stopColor="#A85C43" stopOpacity={0.03} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#16161615" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#B7AEA2" }} />
                      <YAxis tickFormatter={(v) => shortN(Number(v))} tick={{ fontSize: 10, fill: "#B7AEA2" }} />
                      <Tooltip formatter={(v: any) => [fmt(Number(v)), "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #B5965A55" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#A85C43" strokeWidth={2.5} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-5 shadow-sm">
                <h3 className="font-serif text-lg text-[#161616] mb-4">Artworks by Collection</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={artworksByCollection} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={3} stroke="#FAF7F2">
                        {artworksByCollection.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-5 shadow-sm">
                <h3 className="font-serif text-lg text-[#161616] mb-4">Orders Pipeline</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersByStatus} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#16161615" />
                      <XAxis dataKey="status" tick={{ fontSize: 9, fill: "#B7AEA2" }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#B7AEA2" }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#B5965A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Verification Queue */}
              <div className="xl:col-span-2 bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg text-[#161616] flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-[#A85C43]" /> Payment Verification Queue
                  </h3>
                  <button onClick={() => setActiveTab("orders")} className="text-xs uppercase text-[#A85C43] font-semibold hover:underline">
                    All Orders →
                  </button>
                </div>

                {pendingVerification.length === 0 ? (
                  <div className="py-10 text-center text-xs text-[#B7AEA2]">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    No transfers awaiting verification. Ledger is clear.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingVerification.map((o) => (
                      <div key={o.id} className="p-4 bg-[#161616]/5 border border-[#161616]/10 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#161616]">{o.orderRef}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded border bg-orange-100 text-orange-800 border-orange-300 uppercase font-semibold">{o.status}</span>
                          </div>
                          <div className="text-xs text-[#B7AEA2] mt-1">
                            {o.customerName} • {o.artworkTitle} • Ref: <span className="text-[#A85C43] font-mono">{o.paymentProofRef}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-serif font-bold text-[#161616]">{fmt(o.amount)}</span>
                          <button
                            onClick={() => handleVerifyOrderPayment(o.orderRef, "Paid")}
                            className="bg-emerald-700 text-white px-4 py-2 rounded text-[10px] font-semibold uppercase tracking-wider hover:bg-emerald-800 shadow"
                          >
                            Verify Deposit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-[#161616] text-[#FAF7F2] border border-[#B5965A]/30 rounded-lg p-5 shadow-lg">
              <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#B5965A]" /> Recent Platform Activity
              </h3>
              <div className="max-h-48 overflow-y-auto font-mono text-[11px] space-y-1">
                {initialEvents.slice(0, 20).map((ev) => (
                  <div key={ev.id} className="flex justify-between gap-3 py-1.5 border-b border-[#FAF7F2]/10">
                    <span className="text-[#B5965A] font-bold uppercase shrink-0">[{ev.eventType}]</span>
                    <span className="truncate text-[#FAF7F2]/80">{ev.path}</span>
                    <span className="text-[#B7AEA2] shrink-0">{new Date(ev.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ARTWORKS ================= */}
        {activeTab === "artworks" && (
          <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-[#B5965A]" />
              <input
                type="text"
                value={artSearch}
                onChange={(e) => setArtSearch(e.target.value)}
                placeholder="Search title, artist, ref code or collection..."
                className="flex-1 max-w-md p-2.5 border border-[#161616]/20 rounded bg-white text-xs"
              />
              <span className="text-xs text-[#B7AEA2]">{filteredArtworks.length} works</span>
            </div>

            <div className="overflow-x-auto rounded border border-[#161616]/10">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#161616] text-[#FAF7F2] uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Preview</th>
                    <th className="p-3">Ref</th>
                    <th className="p-3">Title / Artist</th>
                    <th className="p-3">Collection</th>
                    <th className="p-3">Price (₦)</th>
                    <th className="p-3">Auction</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]/10 bg-white">
                  {filteredArtworks.map((art) => (
                    <tr key={art.id} className="hover:bg-[#FAF7F2]">
                      <td className="p-3"><img src={art.image} alt={art.title} className="w-12 h-12 object-cover rounded" /></td>
                      <td className="p-3 font-mono font-bold text-[#B5965A]">{art.refCode}</td>
                      <td className="p-3">
                        <span className="font-serif font-medium text-[#161616] block">{art.title}</span>
                        <span className="text-[10px] text-[#B7AEA2]">by {art.artist}</span>
                      </td>
                      <td className="p-3 uppercase text-[10px] font-semibold">{art.collectionSlug}</td>
                      <td className="p-3 font-bold text-[#161616]">{fmt(art.price)}</td>
                      <td className="p-3">
                        {art.auctionEnabled ? (
                          <span className="px-2 py-0.5 bg-[#A85C43] text-white text-[9px] uppercase font-semibold rounded">Top {fmt(art.currentHighestBid || art.price)}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <Link href={`/artwork/${art.slug}`} className="inline-block p-1.5 text-gray-500 hover:text-black" title="Public page"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => openEditArtModal(art)} className="p-1.5 text-[#A85C43] hover:text-[#874632]" title="Edit"><Edit className="w-4 h-4" /></button>
                        <button
                          onClick={() => handleDeleteArt(art.id)}
                          className={`p-1.5 ${confirmDeleteId === art.id ? "bg-red-600 text-white rounded" : "text-red-500 hover:text-red-700"}`}
                          title={confirmDeleteId === art.id ? "Click again to confirm" : "Delete"}
                        >
                          {confirmDeleteId === art.id ? <X className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= COLLECTIONS ================= */}
        {activeTab === "collections" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {collectionsList.map((col) => {
              const artCount = artworksList.filter((a) => a.collectionSlug === col.slug).length;
              return (
                <div key={col.id} className="bg-white border border-[#161616]/10 rounded-lg overflow-hidden shadow-sm p-4 space-y-3">
                  <img src={col.coverImage} alt={col.name} className="w-full h-32 object-cover rounded" />
                  <span className="text-[10px] font-mono uppercase text-[#B5965A] block">/{col.slug}</span>
                  <h3 className="font-serif text-lg text-[#161616] font-medium">{col.name}</h3>
                  <p className="text-xs text-[#B7AEA2] line-clamp-2">{col.subtitle}</p>
                  <div className="pt-2 border-t border-[#161616]/10 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#161616]">{artCount} works</span>
                    <Link href={`/collections/${col.slug}`} className="text-[#A85C43] uppercase text-[10px] font-semibold">View →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= ORDERS ================= */}
        {activeTab === "orders" && (
          <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <Search className="w-4 h-4 text-[#B5965A]" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search order ref, customer, email, artwork..."
                className="flex-1 max-w-md p-2.5 border border-[#161616]/20 rounded bg-white text-xs"
              />
              <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="p-2.5 border border-[#161616]/20 rounded text-xs bg-white">
                <option value="all">All Statuses</option>
                {["Payment Pending", "Payment Submitted", "Paid", "Processing & Framing", "Dispatched", "Delivered"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto rounded border border-[#161616]/10">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#161616] text-[#FAF7F2] uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Order Ref</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Artwork & Spec</th>
                    <th className="p-3">Amount (₦)</th>
                    <th className="p-3">Transfer Ref</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Advance Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]/10 bg-white">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF7F2] align-top">
                      <td className="p-3 font-mono font-bold">{o.orderRef}</td>
                      <td className="p-3">
                        <span className="font-medium block">{o.customerName}</span>
                        <span className="text-[10px] text-[#B7AEA2] block">{o.customerEmail}</span>
                        <span className="text-[10px] text-[#B7AEA2]">{o.country}</span>
                      </td>
                      <td className="p-3">
                        <span className="font-serif font-medium block">{o.artworkTitle}</span>
                        <span className="text-[10px] text-[#B7AEA2] block">{o.selectedSize}</span>
                        <span className="text-[10px] text-[#B7AEA2]">{o.selectedFraming}</span>
                      </td>
                      <td className="p-3 font-bold">{fmt(o.amount)}</td>
                      <td className="p-3 font-mono text-[#A85C43]">{o.paymentProofRef || "—"}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded border text-[9px] uppercase font-semibold ${STATUS_STYLES[o.status] || "bg-gray-100 text-gray-700 border-gray-300"}`}>{o.status}</span>
                      </td>
                      <td className="p-3">
                        <select value={o.status} onChange={(e) => handleVerifyOrderPayment(o.orderRef, e.target.value)} className="p-1.5 border border-[#161616]/20 rounded text-[10px] bg-white font-medium">
                          {["Payment Pending", "Payment Submitted", "Paid", "Processing & Framing", "Dispatched", "Delivered", "Cancelled"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= AUCTIONS ================= */}
        {activeTab === "auctions" && (
          <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-5 shadow-sm space-y-5">
            <div className="overflow-x-auto rounded border border-[#161616]/10">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#161616] text-[#FAF7F2] uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Bid</th>
                    <th className="p-3">Artwork</th>
                    <th className="p-3">Bidder</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Amount (₦)</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]/10 bg-white">
                  {bidsList.map((b) => {
                    const art = artworksList.find((a) => a.id === b.artworkId);
                    return (
                      <tr key={b.id} className="hover:bg-[#FAF7F2]">
                        <td className="p-3 font-mono">#BID-{b.id}</td>
                        <td className="p-3 font-serif">{art?.title || `Artwork #${b.artworkId}`}</td>
                        <td className="p-3 font-semibold">{b.bidderName}</td>
                        <td className="p-3 text-[#B7AEA2]">{b.bidderEmail}<br />{b.bidderPhone}</td>
                        <td className="p-3 font-bold text-[#A85C43]">{fmt(b.amount)}</td>
                        <td className="p-3 text-[#B7AEA2]">{new Date(b.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 uppercase text-[10px] font-semibold">{b.status}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= JOURNAL ================= */}
        {activeTab === "journal" && (
          <div className="space-y-4">
            {articlesList.map((art) => (
              <div key={art.id} className="bg-white border border-[#161616]/10 rounded-lg p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={art.coverImage} alt={art.title} className="w-20 h-14 object-cover rounded" />
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#B5965A]">{art.category} • {art.readTime}</span>
                    <h3 className="font-serif text-base text-[#161616] font-medium">{art.title}</h3>
                    <p className="text-xs text-[#B7AEA2]">by {art.author}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-semibold ${art.published ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-700"}`}>
                    {art.published ? "Published" : "Draft"}
                  </span>
                  <Link href={`/journal/${art.slug}`} className="p-2 text-[#A85C43]"><Eye className="w-4 h-4" /></Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= SPACES ================= */}
        {activeTab === "spaces" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {spacesList.map((sp) => (
              <div key={sp.id} className="bg-white border border-[#161616]/10 rounded-lg p-5 shadow-sm space-y-2">
                <span className="text-[10px] uppercase font-mono text-[#B5965A]">/{sp.spaceKey}</span>
                <h3 className="font-serif text-xl text-[#161616] font-semibold">{sp.title}</h3>
                <p className="text-xs text-[#B7AEA2]">{sp.subtitle}</p>
                <Link href={`/spaces/${sp.spaceKey}`} className="inline-flex items-center gap-1 text-xs uppercase text-[#A85C43] font-semibold">
                  View Division <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* ================= CRM ================= */}
        {activeTab === "crm" && (
          <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-5 shadow-sm">
            <div className="overflow-x-auto rounded border border-[#161616]/10">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#161616] text-[#FAF7F2] uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3">Collector</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Orders</th>
                    <th className="p-3">Lifetime Value (₦)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]/10 bg-white">
                  {ordersList.map((o) => (
                    <tr key={o.id} className="hover:bg-[#FAF7F2]">
                      <td className="p-3 font-semibold">{o.customerName}</td>
                      <td className="p-3 text-[#B7AEA2]">{o.customerEmail}</td>
                      <td className="p-3 text-[#B7AEA2]">{o.customerPhone}</td>
                      <td className="p-3 font-mono font-bold">1</td>
                      <td className="p-3 font-serif font-bold text-[#A85C43]">{fmt(o.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= ANALYTICS ================= */}
        {activeTab === "analytics" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white border border-[#161616]/10 rounded-lg p-5 shadow-sm">
                <span className="text-[10px] uppercase text-[#B7AEA2] font-semibold block">Total Events</span>
                <span className="font-serif text-3xl font-bold text-[#161616]">{initialEvents.length}</span>
              </div>
              <div className="bg-white border border-[#161616]/10 rounded-lg p-5 shadow-sm">
                <span className="text-[10px] uppercase text-[#B7AEA2] font-semibold block">Artwork Views</span>
                <span className="font-serif text-3xl font-bold text-[#A85C43]">{initialEvents.filter((e) => e.eventType === "artwork_view").length}</span>
              </div>
              <div className="bg-white border border-[#161616]/10 rounded-lg p-5 shadow-sm">
                <span className="text-[10px] uppercase text-[#B7AEA2] font-semibold block">Checkout Starts</span>
                <span className="font-serif text-3xl font-bold text-[#B5965A]">{initialEvents.filter((e) => e.eventType === "order_create").length}</span>
              </div>
            </div>

            <div className="bg-[#161616] text-[#FAF7F2] border border-[#B5965A]/30 rounded-lg p-5 shadow-lg">
              <h3 className="font-serif text-lg mb-4">Event Stream</h3>
              <div className="max-h-72 overflow-y-auto font-mono text-[11px] space-y-1">
                {initialEvents.map((ev) => (
                  <div key={ev.id} className="flex justify-between gap-3 py-1.5 border-b border-[#FAF7F2]/10">
                    <span className="text-[#B5965A] font-bold uppercase shrink-0">[{ev.eventType}]</span>
                    <span className="truncate text-[#FAF7F2]/80">{ev.path}{ev.artworkSlug ? ` • ${ev.artworkSlug}` : ""}</span>
                    <span className="text-[#B7AEA2] shrink-0">{new Date(ev.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= PAYMENTS ================= */}
        {activeTab === "payments" && (
          <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-6 shadow-sm space-y-5 max-w-3xl">
            <div className="p-4 bg-[#B5965A]/10 border border-[#B5965A]/40 rounded text-xs text-[#161616] flex items-start gap-2">
              <Banknote className="w-4 h-4 text-[#B5965A] shrink-0 mt-0.5" />
              Changes here publish instantly to every customer payment checkout page across ARTÉVO.
            </div>

            {saveBankSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-800 text-xs rounded font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Bank transfer settings published successfully.
              </div>
            )}

            <form onSubmit={handleSaveBankSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Bank Name *</label>
                  <input type="text" required value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full p-3 border border-[#161616]/20 rounded bg-white" />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Account Name *</label>
                  <input type="text" required value={accountName} onChange={(e) => setAccountName(e.target.value)} className="w-full p-3 border border-[#161616]/20 rounded bg-white" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Account Number *</label>
                  <input type="text" required value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="w-full p-3 border border-[#161616]/20 rounded bg-white font-serif font-bold" />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">SWIFT / Sort Code *</label>
                  <input type="text" required value={sortCode} onChange={(e) => setSortCode(e.target.value)} className="w-full p-3 border border-[#161616]/20 rounded bg-white" />
                </div>
              </div>
              <div>
                <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Customer Payment Instructions *</label>
                <textarea required rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} className="w-full p-3 border border-[#161616]/20 rounded bg-white" />
              </div>
              <button type="submit" className="bg-[#A85C43] text-[#FAF7F2] px-8 py-3.5 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#874632] transition-colors shadow flex items-center gap-2">
                <Save className="w-4 h-4" /> Publish Bank Configuration
              </button>
            </form>
          </div>
        )}

        {/* ================= INQUIRIES ================= */}
        {activeTab === "inquiries" && (
          <div className="space-y-4">
            {inquiriesList.map((inq) => (
              <div key={inq.id} className="bg-white border border-[#161616]/10 rounded-lg p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#B5965A] uppercase font-bold">{inq.type}</span>
                  <span className="text-[#B7AEA2]">{new Date(inq.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-serif text-base text-[#161616] font-semibold">{inq.name} • {inq.email}</h3>
                {inq.company && <p className="text-xs text-[#B5965A]">{inq.company}</p>}
                <p className="text-xs text-[#161616]/80 bg-[#FAF7F2] p-3 rounded">{inq.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* ================= WEBSITE EDITOR ================= */}
        {activeTab === "website_editor" && (
          <div className="space-y-5">
            {/* Load prompt */}
            {!siteEditorLoaded && (
              <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-8 text-center space-y-4">
                <Globe className="w-10 h-10 text-[#B5965A] mx-auto" />
                <h3 className="font-serif text-xl text-[#161616]">Website Content Editor</h3>
                <p className="text-xs text-[#B7AEA2] max-w-md mx-auto">Load the current live website copy to begin editing hero text, about section, contact details and more.</p>
                <button onClick={loadSiteContent} className="inline-flex items-center gap-2 bg-[#A85C43] text-[#FAF7F2] px-6 py-3 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#874632] transition-colors shadow">
                  <RefreshCw className="w-4 h-4" /> Load Website Content
                </button>
              </div>
            )}

            {siteEditorLoaded && (
              <>
                {/* Section tabs */}
                <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-4 shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    {["announcement", "hero", "about_section", "contact_info", "brand", "journal_section", "spaces_section", "footer_note"].map((sec) => (
                      <button key={sec} onClick={() => setSiteEditorSection(sec)}
                        className={`px-3 py-1.5 rounded text-[11px] uppercase tracking-wider font-semibold transition-colors ${siteEditorSection === sec ? "bg-[#161616] text-[#FAF7F2]" : "bg-[#161616]/8 text-[#161616]/70 hover:bg-[#161616]/15"}`}>
                        {sec.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fields */}
                <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-[#161616] capitalize">{siteEditorSection.replace(/_/g, " ")}</h3>
                      <p className="text-[10px] text-[#B7AEA2] uppercase tracking-wider mt-0.5">Editing live website copy</p>
                    </div>
                    {siteEditorSuccess && (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
                        <CheckCircle2 className="w-4 h-4" /> Saved & published
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-xs max-w-2xl">
                    {Object.entries(siteContentData[siteEditorSection] || {}).map(([key, value]) => {
                      const isLong = value.length > 80 || key === "body" || key === "copy" || key === "instructions";
                      return (
                        <div key={key}>
                          <label className="block uppercase tracking-wider text-[#161616] mb-1.5 font-semibold text-[10px]">
                            {key.replace(/_/g, " ")}
                          </label>
                          {isLong ? (
                            <textarea rows={3} value={value}
                              onChange={(e) => handleSiteContentChange(siteEditorSection, key, e.target.value)}
                              className="w-full p-3 border border-[#161616]/20 rounded bg-white focus:outline-none focus:border-[#A85C43] resize-y" />
                          ) : (
                            <input type="text" value={value}
                              onChange={(e) => handleSiteContentChange(siteEditorSection, key, e.target.value)}
                              className="w-full p-3 border border-[#161616]/20 rounded bg-white focus:outline-none focus:border-[#A85C43]" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button onClick={handleSaveSiteContent} disabled={siteEditorSaving}
                    className="inline-flex items-center gap-2 bg-[#A85C43] text-[#FAF7F2] px-8 py-3.5 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#874632] disabled:opacity-50 transition-colors shadow">
                    {siteEditorSaving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save &amp; Publish</>}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= SETTINGS ================= */}
        {activeTab === "settings" && (
          <div className="space-y-5 max-w-3xl">
            {/* Brand identity card */}
            <div className="bg-[#161616] text-[#FAF7F2] border border-[#B5965A]/30 rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-5">
                <Logo variant="light" />
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#B5965A] block">Brand Identity</span>
                  <span className="text-xs text-[#B7AEA2]">All colours extracted from the official ARTÉVO logo</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: "Brand Primary", hex: "#A85C43", note: "Logo square + ÉVO." },
                  { name: "Brand Dark",    hex: "#0A0A0A", note: "Logo ART wordmark"  },
                  { name: "Brand Light",   hex: "#FAFAFA", note: "Logo slash accent"  },
                  { name: "Gold Accent",   hex: "#B5965A", note: "Luxury UI accent"   },
                ].map((c) => (
                  <div key={c.hex} className="space-y-2">
                    <div className="h-14 rounded border-2 border-[#FAF7F2]/10" style={{ background: c.hex }} />
                    <div>
                      <div className="text-[10px] font-semibold text-[#FAF7F2]">{c.name}</div>
                      <div className="text-[9px] font-mono text-[#B5965A]">{c.hex}</div>
                      <div className="text-[9px] text-[#B7AEA2]">{c.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business info */}
            <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-6 shadow-sm space-y-4 text-xs">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-[#B5965A]" />
                <h3 className="font-serif text-lg text-[#161616]">Business Information</h3>
              </div>
              <div className="p-3 bg-[#B5965A]/10 border border-[#B5965A]/30 rounded text-[11px] text-[#161616]">
                These details come from <code className="font-mono bg-[#161616]/10 px-1 rounded">src/lib/brand.ts</code> — the single source of truth for the whole site.
              </div>
              {([
                ["Legal name",    BRAND.legalName],
                ["Business email", BRAND.email],
                ["Phone / WA",    BRAND.phoneDisplay],
                ["Location",      BRAND.addressLine],
                ["Founded",       String(BRAND.foundedYear)],
                ["Currency",      `${BRAND.currency} (${BRAND.currencySymbol})`],
                ["Tagline",       BRAND.tagline],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center gap-1 border-b border-[#161616]/8 pb-2">
                  <span className="font-semibold uppercase tracking-wider text-[10px] w-36 shrink-0 text-[#B7AEA2]">{label}</span>
                  <span className="font-medium text-[#161616]">{val}</span>
                </div>
              ))}
              <p className="text-[10px] text-[#B7AEA2] pt-1">To update these values, edit <code className="font-mono bg-[#161616]/10 px-1 rounded">src/lib/brand.ts</code> and redeploy.</p>
            </div>

            {/* Upload test */}
            <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-6 shadow-sm space-y-3">
              <h3 className="font-serif text-lg text-[#161616] flex items-center gap-2"><Upload className="w-5 h-5 text-[#B5965A]" /> Media Upload Test</h3>
              <p className="text-xs text-[#B7AEA2]">All images are auto-compressed to WebP at ≤82% quality and capped at 2,400 px. Originals are never stored.</p>
              <ImageUploader label="Test upload — drops here" onUpload={(urls) => showToast(`Uploaded: ${urls.join(", ")}`)} />
            </div>
          </div>
        )}

        {/* ================= NEWSLETTER ================= */}
        {activeTab === "newsletter" && (
          <div className="bg-[#FAF7F2] border border-[#161616]/15 rounded-lg p-5 shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-white border border-[#161616]/10 rounded-lg p-5 shadow-sm">
                <span className="text-[10px] uppercase text-[#B7AEA2] font-semibold block">Total Subscribers</span>
                <span className="font-serif text-3xl font-bold text-[#161616]">{initialSubscribers.length}</span>
              </div>
              <div className="bg-white border border-[#161616]/10 rounded-lg p-5 shadow-sm">
                <span className="text-[10px] uppercase text-[#B7AEA2] font-semibold block">Active</span>
                <span className="font-serif text-3xl font-bold text-[#A85C43]">{initialSubscribers.filter((s) => s.status === "subscribed").length}</span>
              </div>
              <div className="bg-white border border-[#161616]/10 rounded-lg p-5 shadow-sm">
                <span className="text-[10px] uppercase text-[#B7AEA2] font-semibold block">This Week</span>
                <span className="font-serif text-3xl font-bold text-[#B5965A]">
                  {initialSubscribers.filter((s) => Date.now() - new Date(s.createdAt).getTime() < 7 * 864e5).length}
                </span>
              </div>
            </div>

            {initialSubscribers.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#B7AEA2]">
                <Mail className="w-8 h-8 mx-auto mb-2 text-[#B7AEA2]" />
                No subscribers yet. The footer sign-up feeds this list automatically.
              </div>
            ) : (
              <div className="overflow-x-auto rounded border border-[#161616]/10">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#161616] text-[#FAF7F2] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Email</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Subscribed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161616]/10 bg-white">
                    {initialSubscribers.map((s) => (
                      <tr key={s.id} className="hover:bg-[#FAF7F2]">
                        <td className="p-3 font-medium text-[#161616]">{s.email}</td>
                        <td className="p-3 text-[#B7AEA2] uppercase text-[10px]">{s.source}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-emerald-100 text-emerald-800">{s.status}</span>
                        </td>
                        <td className="p-3 text-[#B7AEA2]">{new Date(s.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------- Artwork Modal ---------- */}
      {showArtModal && (
        <div className="fixed inset-0 z-50 bg-[#161616]/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-lg shadow-2xl border border-[#B5965A] p-8 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#161616]/10 pb-4">
              <h3 className="font-serif text-2xl text-[#161616]">{editingArt ? `Edit — ${editingArt.title}` : "Add New Artwork"}</h3>
              <button onClick={() => setShowArtModal(false)} className="text-[#161616]/60 hover:text-[#161616]"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSaveArtwork} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Title *</label>
                  <input type="text" required value={artTitle} onChange={(e) => setArtTitle(e.target.value)} placeholder="Echoes of Ancestry No. 4" className="w-full p-2.5 border border-[#161616]/20 rounded bg-white" />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Artist *</label>
                  <input type="text" required value={artArtist} onChange={(e) => setArtArtist(e.target.value)} className="w-full p-2.5 border border-[#161616]/20 rounded bg-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Collection *</label>
                  <select value={artCollection} onChange={(e) => setArtCollection(e.target.value)} className="w-full p-2.5 border border-[#161616]/20 rounded bg-white">
                    {collectionsList.map((c) => (<option key={c.id} value={c.slug}>{c.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Price (₦ Naira) *</label>
                  <input type="number" required value={artPrice} onChange={(e) => setArtPrice(Number(e.target.value))} className="w-full p-2.5 border border-[#161616]/20 rounded bg-white" />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Orientation *</label>
                  <select value={artOrientation} onChange={(e) => setArtOrientation(e.target.value)} className="w-full p-2.5 border border-[#161616]/20 rounded bg-white">
                    <option>Portrait</option><option>Landscape</option><option>Square</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Edition Type *</label>
                <input type="text" required value={artEdition} onChange={(e) => setArtEdition(e.target.value)} className="w-full p-2.5 border border-[#161616]/20 rounded bg-white" />
              </div>

              <ImageUploader
                label="Upload Artwork Image(s) — auto-compressed to WebP"
                multiple
                existing={artImagesStr.split(",").map((s) => s.trim()).filter(Boolean)}
                onUpload={(urls) => {
                  setArtImage(urls[0] || "");
                  setArtImagesStr(urls.join(", "));
                }}
              />

              <div>
                <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Story & Concept *</label>
                <textarea required rows={3} value={artStory} onChange={(e) => setArtStory(e.target.value)} className="w-full p-2.5 border border-[#161616]/20 rounded bg-white" />
              </div>

              <div className="p-3 bg-[#161616]/5 rounded border border-[#161616]/10 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold uppercase tracking-wider">
                  <input type="checkbox" checked={artAuction} onChange={(e) => setArtAuction(e.target.checked)} className="w-4 h-4 accent-[#A85C43]" />
                  <span>Enable Live Auction</span>
                </label>
                {artAuction && (
                  <div className="flex items-center gap-2">
                    <span>Min Bid (₦):</span>
                    <input type="number" value={artMinBid} onChange={(e) => setArtMinBid(Number(e.target.value))} className="w-32 p-1.5 border rounded bg-white" />
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowArtModal(false)} className="px-4 py-2.5 border border-[#161616]/30 rounded uppercase tracking-wider">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-[#A85C43] text-[#FAF7F2] rounded uppercase tracking-wider font-semibold hover:bg-[#874632]">Save Artwork</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Collection Modal ---------- */}
      {showCollModal && (
        <div className="fixed inset-0 z-50 bg-[#161616]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] w-full max-w-lg rounded-lg shadow-2xl border border-[#B5965A] p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#161616]/10 pb-4">
              <h3 className="font-serif text-xl text-[#161616]">Add New Collection</h3>
              <button onClick={() => setShowCollModal(false)} className="text-[#161616]/60"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCollection} className="space-y-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Name *</label>
                <input type="text" required value={collName} onChange={(e) => setCollName(e.target.value)} placeholder="e.g. Solitude" className="w-full p-2.5 border border-[#161616]/20 rounded bg-white" />
              </div>
              <div>
                <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Subtitle *</label>
                <input type="text" required value={collSubtitle} onChange={(e) => setCollSubtitle(e.target.value)} className="w-full p-2.5 border border-[#161616]/20 rounded bg-white" />
              </div>
              <ImageUploader
                label="Cover Image — upload or drag & drop"
                multiple={false}
                existing={collCover ? [collCover] : []}
                onUpload={(urls) => setCollCover(urls[0] || "")}
              />
              <div>
                <label className="block uppercase tracking-wider text-[#161616] mb-1 font-medium">Description *</label>
                <textarea required rows={3} value={collDesc} onChange={(e) => setCollDesc(e.target.value)} className="w-full p-2.5 border border-[#161616]/20 rounded bg-white" />
              </div>
              <div className="pt-3 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCollModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-[#A85C43] text-white rounded font-semibold">Create Collection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
