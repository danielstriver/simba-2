"use client";
import { useState, useEffect, useMemo } from "react";
import {
  getProducts,
  Product,
  CATEGORIES,
  CATEGORY_META,
  formatPrice,
} from "@/lib/products";
import {
  addCustomProduct,
  updateCustomProduct,
  deleteCustomProduct,
  setProductOverride,
  getCustomProducts,
} from "@/lib/productCatalog";
import { getProductImage } from "@/lib/imageMap";
import { useLang } from "@/lib/LanguageContext";
import { useToast } from "@/components/Toast";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  ImageOff,
} from "lucide-react";

interface ProductFormData {
  name: string;
  category: string;
  price: string;
  unit: string;
  description: string;
  image: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  category: CATEGORIES[2], // Food Products
  price: "",
  unit: "",
  description: "",
  image: "",
};

export function ProductsPanel() {
  const { t } = useLang();
  const { toast } = useToast();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ProductFormData>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [rev, setRev] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    getProducts().then((data) => {
      if (!cancelled) {
        setAllProducts(data.products);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [rev]);

  const customIds = useMemo(
    () => new Set(getCustomProducts().map((p) => p.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rev]
  );

  const filtered = useMemo(() => {
    const q = searchDebounced.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [allProducts, searchDebounced]);

  const byCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const cat of CATEGORIES) map.set(cat, []);
    for (const p of filtered) {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    }
    return Array.from(map.entries()).filter(([, prods]) => prods.length > 0);
  }, [filtered]);

  function toggleCat(cat: string) {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditingProduct(null);
    setModalMode("add");
  }

  function openEdit(product: Product) {
    setForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      unit: product.unit || "",
      description: (product as Product & { description?: string }).description || "",
      image: product.image || "",
    });
    setErrors({});
    setEditingProduct(product);
    setModalMode("edit");
  }

  function validate(): boolean {
    const errs: Partial<ProductFormData> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.price.trim()) errs.price = "Required";
    else if (isNaN(Number(form.price)) || Number(form.price) < 0)
      errs.price = "Must be a positive number";
    if (!form.category) errs.category = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));

    const price = Math.round(Number(form.price));
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price,
      unit: form.unit.trim() || "1pc",
      description: form.description.trim(),
      image: form.image.trim() || undefined,
    };

    if (modalMode === "add") {
      addCustomProduct(payload);
      toast(`"${payload.name}" added to catalogue`);
    } else if (modalMode === "edit" && editingProduct) {
      if (customIds.has(editingProduct.id)) {
        updateCustomProduct(editingProduct.id, payload);
      } else {
        setProductOverride(editingProduct.id, payload);
      }
      toast(`"${payload.name}" updated successfully`);
    }

    setSaving(false);
    setModalMode(null);
    setRev((n) => n + 1);
  }

  function handleDelete(id: number) {
    const name = allProducts.find((p) => p.id === id)?.name;
    deleteCustomProduct(id);
    setDeleteConfirm(null);
    setRev((n) => n + 1);
    toast(name ? `"${name}" removed from catalogue` : "Product removed", "success");
  }

  const customCount = customIds.size;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard label={t.allProducts} value={allProducts.length} color="text-gray-900 dark:text-white" />
        <StatCard label={t.categories} value={CATEGORIES.length} color="text-orange-600" />
        <StatCard label={t.customAdded} value={customCount} color="text-purple-600" />
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchProductsPlaceholder}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
          />
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 active:scale-95 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t.addProduct}</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Category sections */}
      {byCategory.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-500 dark:text-gray-400">{t.noProducts}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {byCategory.map(([cat, products]) => {
            const meta = CATEGORY_META[cat];
            const isOpen = expandedCats.has(cat);
            const catCustomCount = products.filter((p) => customIds.has(p.id)).length;
            return (
              <div
                key={cat}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Category header */}
                <button
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-xl leading-none">{meta?.icon || "🛒"}</span>
                  <span className="flex-1 text-left font-bold text-gray-900 dark:text-white text-sm">
                    {cat}
                  </span>
                  {catCustomCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full">
                      +{catCustomCount} {t.customLabel}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 font-medium">
                    {products.length} {t.productsInCategory}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {/* Product rows */}
                {isOpen && (
                  <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700/50">
                    {products.map((product) => (
                      <ProductRow
                        key={product.id}
                        product={product}
                        isCustom={customIds.has(product.id)}
                        deleteConfirm={deleteConfirm === product.id}
                        onEdit={() => openEdit(product)}
                        onDeleteRequest={() => setDeleteConfirm(product.id)}
                        onDeleteConfirm={() => handleDelete(product.id)}
                        onDeleteCancel={() => setDeleteConfirm(null)}
                        customLabel={t.customLabel}
                        confirmDeleteLabel={t.confirmDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      {modalMode && (
        <ProductModal
          mode={modalMode}
          form={form}
          errors={errors}
          saving={saving}
          onChangeField={(field, value) =>
            setForm((prev) => ({ ...prev, [field]: value }))
          }
          onSave={handleSave}
          onClose={() => setModalMode(null)}
          t={t}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 sm:p-4 text-center">
      <p className={`text-2xl sm:text-3xl font-black ${color}`}>{value}</p>
      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium leading-tight">
        {label}
      </p>
    </div>
  );
}

function ProductRow({
  product,
  isCustom,
  deleteConfirm,
  onEdit,
  onDeleteRequest,
  onDeleteConfirm,
  onDeleteCancel,
  customLabel,
  confirmDeleteLabel,
}: {
  product: Product;
  isCustom: boolean;
  deleteConfirm: boolean;
  onEdit: () => void;
  onDeleteRequest: () => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  customLabel: string;
  confirmDeleteLabel: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const src = imgFailed || product.image.includes("placehold.co") || !product.image
    ? getProductImage(product.id, product.name, product.category)
    : product.image;
  const meta = CATEGORY_META[product.category];

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
      {/* Thumbnail */}
      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-700">
        {imgFailed ? (
          <div
            className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${meta?.color || "from-gray-200 to-gray-400"}`}
          >
            <span className="text-lg">{meta?.icon || "🛒"}</span>
          </div>
        ) : (
          <img
            src={src}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {product.name}
          </p>
          {isCustom && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-full shrink-0">
              {customLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-bold text-orange-600">
            {formatPrice(product.price)}
          </span>
          {product.unit && (
            <span className="text-xs text-gray-400">· {product.unit}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          title="Edit product"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        {isCustom && !deleteConfirm && (
          <button
            onClick={onDeleteRequest}
            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
            title="Delete product"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {isCustom && deleteConfirm && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-red-600 font-bold hidden sm:inline whitespace-nowrap">
              {confirmDeleteLabel}
            </span>
            <button
              onClick={onDeleteConfirm}
              className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Confirm"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDeleteCancel}
              className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition-colors"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductModal({
  mode,
  form,
  errors,
  saving,
  onChangeField,
  onSave,
  onClose,
  t,
}: {
  mode: "add" | "edit";
  form: ProductFormData;
  errors: Partial<ProductFormData>;
  saving: boolean;
  onChangeField: (field: keyof ProductFormData, value: string) => void;
  onSave: () => void;
  onClose: () => void;
  t: import("@/lib/i18n").Translations;
}) {
  const [imgPreviewFailed, setImgPreviewFailed] = useState(false);

  const previewSrc = form.image.trim() || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">
            {mode === "add" ? t.addProduct : t.editProduct}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Image preview + URL */}
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
              {previewSrc && !imgPreviewFailed ? (
                <img
                  src={previewSrc}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => setImgPreviewFailed(true)}
                />
              ) : (
                <ImageOff className="w-8 h-8 text-gray-300" />
              )}
            </div>
            <div className="flex-1">
              <Field
                label={t.productImageLabel}
                value={form.image}
                onChange={(v) => {
                  setImgPreviewFailed(false);
                  onChangeField("image", v);
                }}
                placeholder="https://images.unsplash.com/..."
                error={errors.image}
              />
            </div>
          </div>

          {/* Name */}
          <Field
            label={t.productName}
            value={form.name}
            onChange={(v) => onChangeField("name", v)}
            placeholder="e.g. Organic Honey 500g"
            error={errors.name}
            required
          />

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.productCategoryLabel} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => onChangeField("category", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_META[cat]?.icon} {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Price + Unit row */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              label={t.productPriceLabel}
              value={form.price}
              onChange={(v) => onChangeField("price", v)}
              placeholder="2500"
              type="number"
              min="0"
              error={errors.price}
              required
            />
            <Field
              label={t.productUnitLabel}
              value={form.unit}
              onChange={(v) => onChangeField("unit", v)}
              placeholder="1L, 500g, 1pc…"
              error={errors.unit}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {t.productDescriptionLabel}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => onChangeField("description", e.target.value)}
              placeholder="Short product description…"
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition resize-none"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : (
              t.saveProduct
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  required,
  type = "text",
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  type?: string;
  min?: string;
}) {
  const errorId = `${label.toLowerCase().replace(/\s+/g, "-")}-error`;
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`w-full px-3 py-2.5 rounded-xl border text-sm text-gray-900 dark:text-white placeholder-gray-400 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 transition ${
          error
            ? "border-red-400 dark:border-red-600"
            : "border-gray-200 dark:border-gray-700"
        }`}
      />
      {error && <p id={errorId} role="alert" className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
