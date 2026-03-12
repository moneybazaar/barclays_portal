import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import PaynowQR from "paynowqr";

// Configurable UEN for the receiving company
const COMPANY_UEN = "202312345A";
const COMPANY_NAME = "Barclays IB Client Account";

interface PaynowQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deposit: {
    amount: number;
    currency: string;
    reference_code: string;
  } | null;
}

export function PaynowQRDialog({ open, onOpenChange, deposit }: PaynowQRDialogProps) {
  if (!deposit) return null;

  const qrData = new PaynowQR({
    uen: COMPANY_UEN,
    amount: deposit.amount,
    refNumber: deposit.reference_code,
    company: COMPANY_NAME,
  });

  const qrString = qrData.output();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>PayNow QR Code</DialogTitle>
          <DialogDescription>Scan this QR code to complete the deposit via PayNow</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG value={qrString} size={220} level="M" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-bold text-foreground">
              {deposit.currency === "GBP" ? "£" : "$"}
              {Number(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-muted-foreground font-mono">{deposit.reference_code}</p>
            <p className="text-xs text-muted-foreground mt-2">UEN: {COMPANY_UEN}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
