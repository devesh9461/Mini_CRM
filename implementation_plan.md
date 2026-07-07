# Redesign Mini CRM UI/UX – Light Theme, Sarvam-inspired

**Goal**: Transform the entire frontend to a premium, responsive, white‑background design with Indian accent colours, matching Sarvam AI aesthetics. All components must adopt the new design tokens defined in `index.css` and work flawlessly on desktop, tablet, and mobile screens.

## User Review Required
> [!IMPORTANT]
> This plan introduces sweeping visual changes across many files (Sidebar, Header, Dashboard, Lead Detail, AICopilot, forms, tables, modals, etc.). It will also adjust API URLs for stats fetching. Approve before we start editing code.

## Open Questions
> [!QUESTION]
> 1. Do you want the new logo (SVG Chakra) to replace the existing one, or keep the current branding?
> 2. Should we keep the current dark‑mode toggle (if any) or remove it entirely?
> 3. Any specific breakpoints or devices you want us to test beyond the default responsive ones?

## Proposed Changes
---
### Global Styles
- **File**: `frontend/src/index.css` – already replaced with the full light‑theme design system.

### Layout Adjustments
- **Sidebar** (`components/Sidebar.jsx`)
  - Update class names to use `.sidebar`, `.sidebar__brand`, `.sidebar__link`, etc., matching new CSS.
  - Add mobile toggle button (`.sidebar-mobile-toggle`) and overlay handling.
  - Replace brand logo with a simple circular SVG chakra (similar to Sarvam).
- **Top Navbar** (`components/TopNavbar.jsx` – new file)
  - Introduced for mobile screens (hamburger button) to open the sidebar.

### Dashboard Page (`pages/DashboardPage.jsx`)
- Refactor stats cards to use `.stat-card` classes.
- Ensure `fetchStats` uses the correct `VITE_API_BASE_URL` environment variable (already set in `axios.js`).
- Add fallback UI for loading / error states using new `.loader-container` and `.empty-state`.

### Lead Table (`components/LeadTable.jsx`)
- Apply `.data-table`, `.status-badge` classes for rows and status chips.
- Ensure responsive table wrapper (`.table-wrapper`).

### Lead Detail Page (`pages/LeadDetailPage.jsx`)
- Convert layout to `.lead-detail-grid` with left info card and right notes section.
- Use new form classes (`.form-group`, `.form-input`, `.form-select`).
- Replace status dropdown with `.lead-status-select`.
- Integrate `AICopilot` inside a `.copilot-card`.

### AICopilot Component (`components/AICopilot.jsx`)
- Update container to use `.copilot-card` and align internal gauges with new `.stat-card__icon` styling.
- Add subtle entrance animation.

### Forms & Modals
- Standardise all forms (`.form-group`, `.form-input`, `.btn-primary`).
- Update modal markup to use `.modal-overlay`, `.modal-content`.

### Login Page (`pages/LoginPage.jsx`)
- Already uses `.login-page`, `.login-card` – ensure colours use the new accent gradient.

### Miscellaneous
- Update any hard‑coded colours in JSX to use CSS variables.
- Add `data-testid` attributes where useful for future testing.
- Verify all components import `../index.css` or that the Vite entry point includes it.

## Verification Plan
### Automated Tests
- Run `npm run test` (if Jest tests exist) to ensure no breaking imports.
- Use Cypress (or Playwright) to snapshot critical UI screens on desktop and mobile breakpoints.

### Manual Verification
- Launch the dev server (`npm run dev`) and manually inspect:
  - Sidebar opens/closes on mobile.
  - Dashboard stats load correctly (no "Failed to load Statics").
  - Lead detail page displays correctly on widths 320 px – 1920 px.
  - Forms validate and submit without UI glitches.
  - Overall colour palette matches the Sarvam‑inspired warm gold/saffron accents.

---
*Once the plan is approved, we will proceed to modify each component accordingly.*
