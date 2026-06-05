"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface ProductColor { name: string; hex: string; }

interface SellerProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  sizes: (string | number)[];
  colors: ProductColor[];
  isPromoted: boolean;
}

interface SellerInfo { name: string; returnRate: number; }

const CATEGORY_LABELS: Record<string, string> = {
  shoes: "Buty", heels: "Szpilki", tops: "Bluzki", dresses: "Sukienki",
};

const SIZE_OPTIONS: Record<string, (string | number)[]> = {
  shoes: [35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
  heels: [35, 36, 37, 38, 39, 40, 41],
  tops: ["XS", "S", "M", "L", "XL", "XXL"],
  dresses: ["XS", "S", "M", "L", "XL", "XXL"],
};

const PRESET_COLORS = [
  { name: "Czarny", hex: "#1a1a1a" },
  { name: "Biały", hex: "#fafafa" },
  { name: "Szary", hex: "#9e9e9e" },
  { name: "Beżowy", hex: "#f5f0e8" },
  { name: "Granatowy", hex: "#1a237e" },
  { name: "Czerwony", hex: "#c62828" },
  { name: "Burgund", hex: "#880e4f" },
  { name: "Różowy", hex: "#f48fb1" },
  { name: "Zielony", hex: "#2e7d32" },
  { name: "Brązowy", hex: "#8B4513" },
];

type ModalMode = "add" | "edit";

interface FormState {
  name: string;
  description: string;
  price: string;
  category: string;
  sizes: (string | number)[];
  colors: ProductColor[];
  customColorName: string;
  customColorHex: string;
  imageFile: File | null;
  imagePreview: string;
}

const emptyForm = (): FormState => ({
  name: "", description: "", price: "", category: "shoes",
  sizes: [], colors: [], customColorName: "", customColorHex: "#000000",
  imageFile: null, imagePreview: "",
});

export default function SellerProductsPage() {
  const router = useRouter();
  const [seller, setSeller] = useState<SellerInfo | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    const [meRes, productsRes] = await Promise.all([
      fetch("/api/seller/me"),
      fetch("/api/seller/products"),
    ]);
    if (!meRes.ok) { router.push("/login"); return; }
    setSeller(await meRes.json() as SellerInfo);
    const data = await productsRes.json() as { products: SellerProduct[] };
    setProducts(data.products);
    setLoading(false);
  }, [router]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  function openAdd() {
    setForm(emptyForm());
    setEditingProduct(null);
    setDeleteConfirm(false);
    setModalMode("add");
  }

  function openEdit(p: SellerProduct) {
    setForm({
      name: p.name, description: p.description, price: String(p.price),
      category: p.category, sizes: p.sizes, colors: p.colors,
      customColorName: "", customColorHex: "#000000",
      imageFile: null, imagePreview: p.images[0] ?? "",
    });
    setEditingProduct(p);
    setDeleteConfirm(false);
    setModalMode("edit");
  }

  function closeModal() { setModalMode(null); setEditingProduct(null); setDeleteConfirm(false); }

  function toggleSize(size: string | number) {
    setForm((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  }

  function togglePresetColor(color: ProductColor) {
    setForm((f) => {
      const exists = f.colors.some((c) => c.hex === color.hex);
      return { ...f, colors: exists ? f.colors.filter((c) => c.hex !== color.hex) : [...f.colors, color] };
    });
  }

  function addCustomColor() {
    if (!form.customColorName.trim()) return;
    setForm((f) => ({
      ...f,
      colors: [...f.colors, { name: f.customColorName.trim(), hex: f.customColorHex }],
      customColorName: "", customColorHex: "#000000",
    }));
  }

  function removeColor(hex: string) {
    setForm((f) => ({ ...f, colors: f.colors.filter((c) => c.hex !== hex) }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((f) => ({ ...f, imageFile: file, imagePreview: URL.createObjectURL(file) }));
  }

  async function handleSave() {
    setSaving(true);
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("description", form.description);
    fd.append("price", form.price);
    fd.append("category", form.category);
    fd.append("sizes", JSON.stringify(form.sizes));
    fd.append("colors", JSON.stringify(form.colors));
    if (form.imageFile) fd.append("image", form.imageFile);

    const url = modalMode === "add"
      ? "/api/seller/products"
      : `/api/seller/products/${editingProduct!.id}`;
    const method = modalMode === "add" ? "POST" : "PUT";

    const res = await fetch(url, { method, body: fd });
    setSaving(false);
    if (res.ok) { closeModal(); void fetchData(); }
  }

  async function handleDelete() {
    if (!editingProduct) return;
    setSaving(true);
    await fetch(`/api/seller/products/${editingProduct.id}`, { method: "DELETE" });
    setSaving(false);
    closeModal();
    void fetchData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
        <p className="text-sm text-[var(--color-warm-gray)]">Ładowanie...</p>
      </div>
    );
  }

  const availableSizes = SIZE_OPTIONS[form.category] ?? [];

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[var(--color-warm-gray)] mb-6">
          <Link href="/seller/dashboard" className="hover:text-[var(--color-charcoal)] transition">Dashboard</Link>
          <span>/</span>
          <span className="text-[var(--color-charcoal)]">Moje produkty</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">Moje produkty</h1>
            <p className="text-sm text-[var(--color-warm-gray)] mt-1">{seller?.name} · {products.length} produktów</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[var(--color-charcoal)] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-black transition"
          >
            <span className="text-lg leading-none">+</span>
            Dodaj produkt
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={() => openEdit(product)} />
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--color-warm-gray)] text-sm mb-4">Nie masz jeszcze żadnych produktów.</p>
            <button onClick={openAdd} className="text-xs border border-[var(--color-charcoal)] px-4 py-2 rounded hover:bg-[var(--color-charcoal)] hover:text-white transition">
              Dodaj pierwszy produkt
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-base font-semibold text-[var(--color-charcoal)]">
                {modalMode === "add" ? "Dodaj produkt" : "Edytuj produkt"}
              </h2>
              <button onClick={closeModal} className="text-[var(--color-warm-gray)] hover:text-[var(--color-charcoal)] text-xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Nazwa */}
              <Field label="Nazwa produktu *">
                <input
                  type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={input} placeholder="np. Eleganckie Derby" required
                />
              </Field>

              {/* Opis */}
              <Field label="Opis *">
                <textarea
                  value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3} className={`${input} resize-none`} placeholder="Opisz produkt szczegółowo..."
                />
              </Field>

              {/* Cena + Kategoria */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Cena (zł) *">
                  <input
                    type="number" min="1" step="0.01" value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className={input} placeholder="199"
                  />
                </Field>
                <Field label="Kategoria *">
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, sizes: [] }))}
                    className={input}
                  >
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Zdjęcie */}
              <Field label="Zdjęcie produktu">
                <div className="flex items-start gap-4">
                  {form.imagePreview && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                      <Image src={form.imagePreview} alt="" fill className="object-cover" unoptimized />
                    </div>
                  )}
                  <div className="flex-1">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button
                      type="button" onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-200 rounded-lg py-3 px-4 text-sm text-[var(--color-warm-gray)] hover:border-[var(--color-charcoal)] hover:text-[var(--color-charcoal)] transition text-center"
                    >
                      {form.imagePreview ? "Zmień zdjęcie" : "Kliknij aby wybrać plik"}
                    </button>
                    <p className="text-xs text-[var(--color-warm-gray)] mt-1">JPG, PNG, WebP · maks. 5 MB</p>
                  </div>
                </div>
              </Field>

              {/* Rozmiary */}
              <Field label={`Dostępne rozmiary (${form.sizes.length} wybrano)`}>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={String(size)} type="button" onClick={() => toggleSize(size)}
                      className={`px-3 py-1.5 rounded border text-xs font-medium transition ${
                        form.sizes.includes(size)
                          ? "bg-[var(--color-charcoal)] text-white border-[var(--color-charcoal)]"
                          : "border-gray-200 text-[var(--color-warm-gray)] hover:border-[var(--color-charcoal)]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Kolory */}
              <Field label={`Dostępne kolory (${form.colors.length} wybrano)`}>
                {/* Wybrane kolory */}
                {form.colors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.colors.map((c) => (
                      <div key={c.hex} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.hex }} />
                        <span className="text-xs">{c.name}</span>
                        <button type="button" onClick={() => removeColor(c.hex)} className="text-gray-400 hover:text-red-500 text-xs leading-none">×</button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Predefiniowane */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex} type="button" title={c.name} onClick={() => togglePresetColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition ${form.colors.some((fc) => fc.hex === c.hex) ? "border-[var(--color-charcoal)] scale-110" : "border-gray-200 hover:border-gray-400"}`}
                      style={{ backgroundColor: c.hex }}
                    />
                  ))}
                </div>
                {/* Własny kolor */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <input
                    type="color" value={form.customColorHex}
                    onChange={(e) => setForm((f) => ({ ...f, customColorHex: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text" value={form.customColorName} placeholder="Nazwa koloru"
                    onChange={(e) => setForm((f) => ({ ...f, customColorName: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomColor(); } }}
                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--color-charcoal)]"
                  />
                  <button type="button" onClick={addCustomColor} className="text-xs px-2 py-1 border border-[var(--color-charcoal)] rounded hover:bg-[var(--color-charcoal)] hover:text-white transition">
                    Dodaj
                  </button>
                </div>
              </Field>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                {modalMode === "edit" && !deleteConfirm && (
                  <button
                    type="button" onClick={() => setDeleteConfirm(true)}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition"
                  >
                    🗑 Usuń produkt
                  </button>
                )}
                {modalMode === "edit" && deleteConfirm && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 font-medium">Na pewno usunąć?</span>
                    <button type="button" onClick={() => void handleDelete()} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition" disabled={saving}>
                      {saving ? "..." : "Tak, usuń"}
                    </button>
                    <button type="button" onClick={() => setDeleteConfirm(false)} className="text-xs text-gray-500 hover:text-gray-700">Anuluj</button>
                  </div>
                )}
                {modalMode === "add" && <span />}

                <div className="flex gap-2 ml-auto">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-[var(--color-warm-gray)] hover:text-[var(--color-charcoal)] transition">
                    Anuluj
                  </button>
                  <button
                    type="button" onClick={() => void handleSave()}
                    disabled={saving || !form.name || !form.description || !form.price}
                    className="px-5 py-2 bg-[var(--color-charcoal)] text-white text-sm font-medium rounded-lg hover:bg-black transition disabled:opacity-50"
                  >
                    {saving ? "Zapisuję..." : modalMode === "add" ? "Dodaj produkt" : "Zapisz zmiany"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-charcoal)] uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const input = "w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-charcoal)] transition bg-white";

function ProductCard({ product, onEdit }: { product: SellerProduct; onEdit: () => void }) {
  const imageSrc = product.images[0] ?? "";
  const hasImage = imageSrc.startsWith("/images/");

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm group relative">
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 z-10 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-[var(--color-warm-gray)] hover:text-[var(--color-charcoal)] shadow-sm opacity-0 group-hover:opacity-100 transition"
        title="Edytuj produkt"
      >
        ✏️
      </button>
      {product.isPromoted && (
        <span className="absolute top-2 left-2 z-10 text-[9px] font-bold uppercase tracking-wider bg-[var(--color-charcoal)] text-white px-1.5 py-0.5 rounded-sm">
          Promowany
        </span>
      )}
      <div className="relative aspect-square bg-gray-50">
        {hasImage ? (
          <Image src={imageSrc} alt={product.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--color-cream)]">
            <span className="text-4xl">{{ shoes: "👟", heels: "👠", tops: "👕", dresses: "👗" }[product.category] ?? "🛍️"}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-xs font-medium text-[var(--color-charcoal)] leading-tight truncate">{product.name}</h3>
        <p className="text-[11px] text-[var(--color-warm-gray)] mt-0.5">{CATEGORY_LABELS[product.category] ?? product.category}</p>
        <p className="text-xs font-semibold text-[var(--color-charcoal)] mt-1.5">{product.price} zł</p>
        {product.colors.length > 0 && (
          <div className="flex gap-1 mt-1.5">
            {product.colors.slice(0, 4).map((c) => (
              <span key={c.hex} className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} title={c.name} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
