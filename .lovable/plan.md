

## Integrate PaynowQR on Admin Deposit Page

### What is PaynowQR
A Singapore PayNow QR code generator library (`paynowqr` on npm). It produces a QR string from a UEN, amount, and reference number. We'll pair it with a QR rendering library (`qrcode.react`) to display the QR image.

### Plan

**1. Install dependencies**
- `paynowqr` — generates the PayNow QR data string
- `qrcode.react` — renders QR codes as SVG/canvas in React

**2. Create a `PaynowQRDialog` component** (`src/components/PaynowQRDialog.tsx`)
- Accepts `deposit` (amount, currency, reference_code) and `open`/`onOpenChange` props
- Uses `PaynowQR` to generate a QR string with the deposit's reference code and amount
- Renders it via `QRCodeSVG` from `qrcode.react` inside a Dialog
- Displays the reference code and amount below the QR for confirmation
- UEN will be a configurable constant (admin can set their company UEN)

**3. Update `BackOffice.tsx` — Deposits tab**
- Add a "QR" button to each deposit row in the Actions column
- Clicking it opens the `PaynowQRDialog` with that deposit's details
- Also show a QR button in the Create Deposit dialog after successful creation

**4. Update `Deposit.tsx` — Client view**
- For pending deposits, show a "View QR" button that opens the same `PaynowQRDialog` so clients can scan and pay

### Files

| File | Change |
|------|--------|
| `package.json` | Add `paynowqr`, `qrcode.react` |
| `src/components/PaynowQRDialog.tsx` | New reusable QR dialog component |
| `src/pages/BackOffice.tsx` | Add QR button per deposit row |
| `src/pages/Deposit.tsx` | Add QR button for client's pending deposits |

