

## Match Footer Legal Strip to Official Barclays IB Site

The screenshot shows a bottom legal strip with: Barclays logo (with eagle) on the left, then legal links separated by `|` pipes, then "© Barclays 2026" on the far right — all on one line.

Current implementation is close but needs minor tweaks:

### Changes to `src/components/landing/LandingFooter.tsx`

1. **Logo**: Use the eagle+text logo (`/barclays-logo.svg`) with proper sizing — matches screenshot showing the full Barclays wordmark with eagle
2. **Legal links**: Convert from external URLs to local React Router `Link` components for the 5 legal pages: Important information, Privacy Notice, Disclosures, Accessibility, Cookies policy
3. **Pipe separators**: Already present — keep as-is
4. **Copyright**: Already shows "© Barclays {year}" — keep as-is
5. **Layout**: Ensure single-row flex with logo left, links center, copyright right — matching screenshot exactly

### New local pages (minimal placeholder content)

Create 5 info pages under `src/pages/info/`:
- `ImportantInformation.tsx`
- `PrivacyNotice.tsx`
- `Disclosures.tsx`
- `Accessibility.tsx`
- `CookiesPolicy.tsx`

Each uses LandingHeader + LandingFooter wrapper with placeholder legal text.

### Routing

Add 5 routes in `App.tsx`.

### Files
| File | Change |
|------|--------|
| `src/components/landing/LandingFooter.tsx` | Legal strip links → local routes via `Link` |
| `src/pages/info/ImportantInformation.tsx` | New |
| `src/pages/info/PrivacyNotice.tsx` | New |
| `src/pages/info/Disclosures.tsx` | New |
| `src/pages/info/Accessibility.tsx` | New |
| `src/pages/info/CookiesPolicy.tsx` | New |
| `src/App.tsx` | Add 5 routes |

