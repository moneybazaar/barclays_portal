

## Match Header to Official Barclays IB Site + Update Navy to #1A2142

### Color Change

`#1A2142` converts to HSL `230 43% 18%`. Update these CSS variables in `src/index.css`:

- `--primary` (light mode): `230 43% 18%` (was `210 100% 20%`)
- `--barclays-navy`: `230 43% 18%`
- `--secondary-foreground`: `230 43% 18%`

This cascades through the entire app since all navy references use these tokens.

### Header Alignment with Official Site

The current `LandingHeader.tsx` structure is close but needs these adjustments to match the HTML you provided:

1. **Logo section**: Add the thin vertical divider line between logo and "Investment Bank" text matching the official `redesign-header-logo-line` — currently uses a `div` with `bg-border`, should be a more prominent styled line matching the site
2. **Navigation row**: The official site uses a clean horizontal nav bar. Current implementation matches this.
3. **Client Login**: The official site shows a popup with "Barclays Live" and "BARX" links on hover. Current implementation routes to `/login` instead. Keep routing to `/login` since this is a client portal, but the visual style should match.
4. **Contact Us**: Currently styled as plain text — matches the official site.
5. **Search**: Currently matches with a search icon + "Search" text.

### Files Modified

| File | Change |
|------|--------|
| `src/index.css` | Update `--primary`, `--barclays-navy`, `--secondary-foreground` to `230 43% 18%` in light mode |
| `src/components/landing/LandingHeader.tsx` | Minor styling tweaks to logo divider and nav bar to precisely match official header spacing |
| `src/components/Header.tsx` | Update `bg-primary` header to use the new navy — automatic via CSS var change |

### What stays the same
- All navigation links and mega menu content
- Mobile menu behavior
- Dark mode palette (unchanged)
- Client Login routing to `/login`

