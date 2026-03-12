

## Populate Legal Pages with Official Barclays Content

Content fetched from `ib.barclays` and `home.barclays`. Here's what goes into each page:

### 1. Disclosures (`src/pages/info/Disclosures.tsx`)
From `ib.barclays/disclosures.html` — real Status Disclosure content:
- Barclays Bank PLC (PRA/FCA, Reg No: 1026167, 1 Churchill Place)
- Barclays Capital Inc. (SIPC/FINRA/NFA, 745 Seventh Avenue, NY)
- Barclays Bank Ireland PLC (Central Bank of Ireland, Reg No: 396330)
- "Financial information by type" section header

### 2. Privacy Notice (`src/pages/info/PrivacyNotice.tsx`)
From `home.barclays/privacy-policy/` — real content:
- "Your personal information and Barclays: The principles" intro about GDPR
- "Barclays' responsibilities to you" — 4 numbered commitments (never sell data, respect privacy, etc.)
- "Our privacy principles" — 6 bullet points (Lawfulness, Purpose limitations, Data minimisation, Accuracy, Storage limitations, Integrity and confidentiality)
- "This website" disclaimer
- Cookies cross-reference

### 3. Accessibility (`src/pages/info/Accessibility.tsx`)
From `home.barclays/accessibility/` — real content:
- "Our Accessibility Commitment" — full paragraph about WCAG 2.2 AA, EN 301 549
- Goal bullet list (keyboard navigation, colours/contrast, zoom, graphical content, screen readers)
- "Accessible Services and Support" with links to Barclays UK, Corporate, Barclaycard, Wealth, US
- "Adjust your device" — AbilityNet reference
- "Working with our Suppliers" section
- "Accessibility Statements and Regulatory Disclosures" section
- "Accessibility feedback" section with contact link

### 4. Important Information (`src/pages/info/ImportantInformation.tsx`)
Official page returned 404 — will use regulatory content derived from the Disclosures page (same entity registrations) plus standard IB disclaimers about investment professionals, past performance, and website use.

### 5. Cookies Policy (`src/pages/info/CookiesPolicy.tsx`)
Official page returned 404 — will use standard Barclays cookie categories: Essential, Analytical/Performance, Functional, consistent with group-level language.

### Files Modified
| File | Change |
|------|--------|
| `src/pages/info/Disclosures.tsx` | Replace with real Status Disclosure content |
| `src/pages/info/PrivacyNotice.tsx` | Replace with real privacy principles and commitments |
| `src/pages/info/Accessibility.tsx` | Replace with real WCAG 2.2 AA commitment and services |
| `src/pages/info/ImportantInformation.tsx` | Enhance with official regulatory language |
| `src/pages/info/CookiesPolicy.tsx` | Enhance with standard cookie categories |

