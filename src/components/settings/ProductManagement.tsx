import React, { useState, useMemo } from "react";
import { Pencil, Trash2, Plus, Search, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducts } from "@/context/products/ProductsContext";
import { Product } from "@/types";

type ProductFormState = {
  code: string;
  description: string;
  price: string;
  cost: string;
  vat: string;
  caseQuantity: string;
  firstOrderCommission: string;
  nextOrdersCommission: string;
};

const emptyForm = (): ProductFormState => ({
  code: "",
  description: "",
  price: "",
  cost: "",
  vat: "",
  caseQuantity: "",
  firstOrderCommission: "",
  nextOrdersCommission: "",
});

const productToForm = (p: Product): ProductFormState => ({
  code: p.code,
  description: p.description,
  price: String(p.price),
  cost: String(p.cost ?? ""),
  vat: p.vat != null ? String(p.vat) : "",
  caseQuantity: p.caseQuantity != null ? String(p.caseQuantity) : "",
  firstOrderCommission: p.firstOrderCommission != null ? String(p.firstOrderCommission) : "",
  nextOrdersCommission: p.nextOrdersCommission != null ? String(p.nextOrdersCommission) : "",
});

const parseNum = (v: string): number | undefined =>
  v.trim() === "" ? undefined : Number(v);

const ProductManagement = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, search]);

  const openAdd = () => {
    setEditingProduct(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm(productToForm(p));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.description.trim() || form.price.trim() === "") return;
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        cost: parseNum(form.cost) ?? 0,
        vat: parseNum(form.vat),
        caseQuantity: parseNum(form.caseQuantity),
        firstOrderCommission: parseNum(form.firstOrderCommission),
        nextOrdersCommission: parseNum(form.nextOrdersCommission),
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await addProduct(payload);
      }
      setDialogOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
  };

  const field = (
    label: string,
    key: keyof ProductFormState,
    type: "text" | "number" = "text",
    required = false
  ) => (
    <div className="space-y-1">
      <Label htmlFor={key}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        id={key}
        type={type}
        step={type === "number" ? "any" : undefined}
        value={form[key]}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add Product
        </Button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">VAT %</TableHead>
                <TableHead className="text-right">Case Qty</TableHead>
                <TableHead className="text-right">1st Comm %</TableHead>
                <TableHead className="text-right">Next Comm %</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    {search ? "No products match your search." : "No products yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.code}</TableCell>
                    <TableCell>{p.description}</TableCell>
                    <TableCell className="text-right">€{p.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      {p.cost != null ? `€${p.cost.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.vat != null ? `${p.vat}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.caseQuantity ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.firstOrderCommission != null ? `${p.firstOrderCommission}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.nextOrdersCommission != null ? `${p.nextOrdersCommission}%` : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Duplicate"
                          onClick={() => {
                            setEditingProduct(null);
                            setForm({ ...productToForm(p), code: p.code + "-COPY" });
                            setDialogOpen(true);
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Edit"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          title="Delete"
                          onClick={() => setDeleteTarget(p)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        {search ? " found" : " total"}
      </p>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            {field("Code", "code", "text", true)}
            {field("Price (€)", "price", "number", true)}
            <div className="col-span-2">
              {field("Description", "description", "text", true)}
            </div>
            {field("Cost (€)", "cost", "number")}
            {field("VAT (%)", "vat", "number")}
            {field("Case Quantity", "caseQuantity", "number")}
            {field("1st Order Commission (%)", "firstOrderCommission", "number")}
            {field("Next Orders Commission (%)", "nextOrdersCommission", "number")}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !form.code.trim() ||
                !form.description.trim() ||
                form.price.trim() === ""
              }
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.code} — {deleteTarget?.description}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProductManagement;
