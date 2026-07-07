# Add Top Navbar and Mobile Optimizations

## Goal Description

Create a persistent top navigation bar that displays the company name inside a sleek rectangular box. Reposition the hamburger menu to the right side of the navbar for better mobile ergonomics. Refine the colour palette and texture for a premium mobile experience (gradient background, subtle glass‑morphism, enhanced contrast). All changes must be fully responsive and maintain existing functionality.

## User Review Required

> [!IMPORTANT]
> The new `Navbar` component will replace the current sidebar toggle placement. Ensure that any existing routes or state that depend on the sidebar’s open/close logic are updated accordingly. The design introduces a gradient background (`--primary-gradient`) that overrides the current dark theme for the header; confirm that this aligns with the brand guidelines.

## Open Questions

> [!CAUTION]
> - Do you have a preferred brand colour (hex) for the company name box, or should we reuse the existing accent color (`--accent-primary`)?
> - Should the navbar be fixed (sticky) at the top on scroll, or should it scroll away with the page content?

## Proposed Changes

---
### Component

#### [NEW] [Navbar.jsx](file:///c:/Users/Devesh%20Jangid/Documents/Repo/Mini_CRM/frontend/src/components/Navbar.jsx)
```javascript
import React from 'react';
import { HiOutlineMenu } from 'react-icons/hi';
import { useSidebar } from '../hooks/useSidebar'; // custom hook to control sidebar state

export default function Navbar() {
  const { isOpen, toggle } = useSidebar();

  return (
    <header className="top-navbar">
      <div className="company-box">Mini CRM</div>
      <button
        className="hamburger-btn"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <HiOutlineMenu size={24} />
      </button>
    </header>
  );
}
```

---
### Layout Integration

#### [MODIFY] [App.jsx](file:///c:/Users/Devesh%20Jangid/Documents/Repo/Mini_CRM/frontend/src/App.jsx)
```diff
@@
-import Sidebar from './components/Sidebar';
+import Sidebar from './components/Sidebar';
+import Navbar from './components/Navbar';
@@
-<div className="app-wrapper">
-  <Sidebar />
-  <main className="main-content">
+<div className="app-wrapper">
+  <Navbar />
+  <Sidebar />
+  <main className="main-content">
``` 

---
### Styles

#### [MODIFY] [index.css](file:///c:/Users/Devesh%20Jangid/Documents/Repo/Mini_CRM/frontend/src/index.css)
```diff
@@
-/* Existing header styles */
+/* New top navbar */
+.top-navbar {
+  display: flex;
+  align-items: center;
+  justify-content: space-between;
+  padding: 0.5rem 1rem;
+  background: var(--primary-gradient, linear-gradient(135deg, #1e3c72, #2a5298));
+  color: var(--text-primary);
+  position: sticky;
+  top: 0;
+  z-index: 1000;
+  backdrop-filter: blur(8px);
+}
+
+.company-box {
+  padding: 0.4rem 0.8rem;
+  background: rgba(255, 255, 255, 0.15);
+  border-radius: 0.5rem;
+  font-weight: 600;
+  font-size: 1rem;
+  color: var(--text-primary);
+  backdrop-filter: blur(4px);
+}
+
+.hamburger-btn {
+  background: none;
+  border: none;
+  color: var(--text-primary);
+  cursor: pointer;
+}
+
+/* Mobile colour texture tweaks */
+@media (max-width: 480px) {
+  body {
+    background: var(--primary-gradient);
+    background-attachment: fixed;
+  }
+  .lead-card, .data-table {
+    border-radius: 0.8rem;
+    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
+  }
+}
``` 

---
### Sidebar Adjustments

#### [MODIFY] [Sidebar.jsx](file:///c:/Users/Devesh%20Jangid/Documents/Repo/Mini_CRM/frontend/src/components/Sidebar.jsx)
```diff
@@
-<button className="sidebar-toggle" onClick={toggle}>...</button>
+/* Sidebar toggle removed – now controlled via Navbar */
``` 

---
### Verification Plan

#### Automated Tests
- Run `npm run dev` and open the app in a mobile emulator (width < 600px).
- Verify that the top navbar appears, the company name is visible, and the hamburger icon is on the right.
- Click the hamburger to open/close the sidebar; ensure the aria‑expanded attribute updates.
- Ensure lead cards still render correctly and pagination adapts.

#### Manual Verification
- Test on actual devices (Android/iOS) for touch target size.
- Confirm colour contrast meets WCAG AA for text on the new gradient header.
```
