import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { AssetType, Holding } from "@/hooks/useHoldings";

interface HoldingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<any>;
  holding?: Holding | null;
  defaultAssetType?: AssetType;
}

export const HoldingFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  holding,
  defaultAssetType = "stock",
}: HoldingFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [assetType, setAssetType] = useState<AssetType>(defaultAssetType);
  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    institution: "",
    shares: "",
    units: "",
    principal: "",
    purchase_price: "",
    current_price: "",
    rate: "",
    maturity_date: "",
    currency: "USD",
    risk_level: "medium",
  });

  useEffect(() => {
    if (holding) {
      setAssetType(holding.asset_type);
      setFormData({
        name: holding.name,
        ticker: holding.ticker || "",
        institution: holding.institution || "",
        shares: holding.shares?.toString() || "",
        units: holding.units?.toString() || "",
        principal: holding.principal?.toString() || "",
        purchase_price: holding.purchase_price.toString(),
        current_price: holding.current_price.toString(),
        rate: holding.rate?.toString() || "",
        maturity_date: holding.maturity_date || "",
        currency: holding.currency,
        risk_level: holding.risk_level,
      });
    } else {
      setAssetType(defaultAssetType);
      setFormData({
        name: "",
        ticker: "",
        institution: "",
        shares: "",
        units: "",
        principal: "",
        purchase_price: "",
        current_price: "",
        rate: "",
        maturity_date: "",
        currency: "USD",
        risk_level: "medium",
      });
    }
  }, [holding, defaultAssetType, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data: any = {
      asset_type: assetType,
      name: formData.name.trim(),
      ticker: formData.ticker.trim() || null,
      institution: formData.institution.trim() || null,
      purchase_price: parseFloat(formData.purchase_price),
      current_price: parseFloat(formData.current_price),
      currency: formData.currency,
      risk_level: formData.risk_level,
    };

    if (assetType === "stock" || assetType === "fund") {
      data.shares = parseFloat(formData.shares) || null;
    } else if (assetType === "bond") {
      data.units = parseFloat(formData.units) || null;
    } else if (assetType === "cd") {
      data.principal = parseFloat(formData.principal) || null;
      data.rate = parseFloat(formData.rate) || null;
      data.maturity_date = formData.maturity_date || null;
    }

    const result = await onSubmit(data);
    setLoading(false);
    if (result) {
      onOpenChange(false);
    }
  };

  const isCD = assetType === "cd";
  const isBond = assetType === "bond";
  const isStockOrFund = assetType === "stock" || assetType === "fund";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{holding ? "Edit Holding" : "Add New Holding"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Asset Type</Label>
            <Select value={assetType} onValueChange={(v) => setAssetType(v as AssetType)} disabled={!!holding}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="bond">Bond</SelectItem>
                <SelectItem value="fund">Fund</SelectItem>
                <SelectItem value="cd">Certificate of Deposit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Apple Inc."
              required
              maxLength={100}
            />
          </div>

          {!isCD && (
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker Symbol</Label>
              <Input
                id="ticker"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                placeholder="e.g., AAPL"
                maxLength={10}
              />
            </div>
          )}

          {isCD && (
            <div className="space-y-2">
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                placeholder="e.g., Barclays"
                maxLength={100}
              />
            </div>
          )}

          {isStockOrFund && (
            <div className="space-y-2">
              <Label htmlFor="shares">Number of Shares *</Label>
              <Input
                id="shares"
                type="number"
                step="0.0001"
                min="0"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                placeholder="e.g., 100"
                required
              />
            </div>
          )}

          {isBond && (
            <div className="space-y-2">
              <Label htmlFor="units">Number of Units *</Label>
              <Input
                id="units"
                type="number"
                step="0.0001"
                min="0"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                placeholder="e.g., 1000"
                required
              />
            </div>
          )}

          {isCD && (
            <>
              <div className="space-y-2">
                <Label htmlFor="principal">Principal Amount *</Label>
                <Input
                  id="principal"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                  placeholder="e.g., 100000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Interest Rate (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="e.g., 5.25"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maturity_date">Maturity Date</Label>
                <Input
                  id="maturity_date"
                  type="date"
                  value={formData.maturity_date}
                  onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_price">{isCD ? "Value" : "Purchase Price"} *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current_price">{isCD ? "Current Value" : "Current Price"} *</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.current_price}
                onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Risk Level</Label>
              <Select value={formData.risk_level} onValueChange={(v) => setFormData({ ...formData, risk_level: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : holding ? (
                "Update"
              ) : (
                "Add Holding"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
