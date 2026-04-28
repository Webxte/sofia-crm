import { useRef, useState } from "react";
import { useProducts } from "@/context/products/ProductsContext";
import { Button } from "@/components/ui/button";
import { Package, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Step2Props {
  onNext: () => void;
  onSkip: () => void;
}

export const Step2Products = ({ onNext, onSkip }: Step2Props) => {
  const { products, refreshProducts } = useProducts();
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rows = (results.data as any[]).map((row) => ({
            code:        row.code        || row.Code        || "",
            description: row.description || row.Description || "",
            price:       parseFloat(row.price || row.Price || "0") || 0,
            cost:        parseFloat(row.cost  || row.Cost  || "0") || 0,
            vat:         parseFloat(row.vat   || row.VAT   || "0") || null,
          })).filter((r) => r.code && r.description);

          if (rows.length === 0) {
            toast.error("No valid rows found. Ensure your CSV has code, description, price columns.");
            setImporting(false);
            return;
          }

          const { error } = await supabase.from("products").insert(rows);
          if (error) throw error;

          await refreshProducts();
          setImported(rows.length);
          toast.success(`${rows.length} products imported`);
        } catch (err: any) {
          toast.error(err.message || "Import failed");
        } finally {
          setImporting(false);
        }
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
          <Package className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">Import your products</h3>
          <p className="text-sm text-muted-foreground">Upload a CSV with code, description, price</p>
        </div>
      </div>

      {products.length > 0 || imported > 0 ? (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          {products.length} product{products.length !== 1 ? "s" : ""} in your catalog
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <Package className="h-8 w-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            CSV format: <code className="bg-gray-100 px-1 rounded text-xs">code, description, price, cost, vat</code>
          </p>
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? "Importing…" : "Choose CSV file"}
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </div>
      )}

      {(products.length > 0 || imported > 0) && (
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing} className="w-full">
          <Upload className="h-4 w-4 mr-2" />Import more products
        </Button>
      )}
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />

      <div className="flex gap-2">
        <Button variant="ghost" onClick={onSkip} className="flex-1">Skip for now</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
};
