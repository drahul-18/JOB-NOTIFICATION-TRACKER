# KodNest Premium Build System

A premium SaaS design system for B2C product companies. Calm, intentional, coherent, confident.

---

## Design Philosophy

- **Calm** — No visual noise, no animation overload
- **Intentional** — Every element has purpose
- **Coherent** — One mind designed it; no visual drift
- **Confident** — Serif headlines, generous spacing, clear hierarchy

**Avoid:** Gradients, glassmorphism, neon colors, hackathon-style, playful, flashy, decorative fonts.

---

## Color System (Max 4)

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#F7F6F3` | Page, cards, inputs |
| Primary text | `#111111` | Headings, body |
| Accent | `#8B0000` | CTAs, links, focus |
| Success | `#4A6B4A` | Completed states |
| Warning | `#8B7355` | Errors, in-progress |

---

## Typography

| Element | Font | Size | Notes |
|---------|------|------|-------|
| Headings | Libre Baskerville (serif) | 2.5rem → 1.25rem | Large, confident |
| Body | DM Sans (sans) | 16–18px | Line-height 1.6–1.8 |
| Text blocks | — | max-width 720px | Never wider |

---

## Spacing Scale

Use only: **8px, 16px, 24px, 40px, 64px**

| Token | Value |
|-------|-------|
| `--kn-space-xs` | 8px |
| `--kn-space-sm` | 16px |
| `--kn-space-md` | 24px |
| `--kn-space-lg` | 40px |
| `--kn-space-xl` | 64px |

---

## Layout Structure

Every page follows this order:

1. **Top Bar** — Project name (left) | Step X / Y (center) | Status badge (right)
2. **Context Header** — Large serif headline + 1-line subtext
3. **Main** — Primary Workspace (70%) + Secondary Panel (30%)
4. **Proof Footer** — Checklist: UI Built, Logic Working, Test Passed, Deployed

---

## Components

### Buttons
- **Primary:** Solid deep red (`--kn-color-accent`)
- **Secondary:** Outlined, transparent fill
- **Hover:** 175ms ease-in-out, no bounce
- **Radius:** 6px everywhere

### Inputs
- Clean 1px border, no heavy shadows
- Focus: border color → accent
- Error: `kn-input--error` (warning border)

### Cards
- Subtle border, no drop shadows
- Padding: `--kn-space-md` (24px)

### Status Badges
- `kn-badge--not-started` — muted
- `kn-badge--in-progress` — amber
- `kn-badge--shipped` — green

---

## Interaction Rules

- **Transitions:** 150–200ms, ease-in-out
- **No:** Bounce, parallax, decorative animations

---

## Error & Empty States

**Errors:** Explain what went wrong + how to fix. Never blame the user.

**Empty states:** Provide next action. Never feel dead.

---

## File Structure

```
design-system/
├── tokens.css      # Colors, typography, spacing, layout vars
├── base.css        # Reset, typography, links, focus
├── layout.css      # App shell, topbar, header, workspace, panel, footer
├── components.css  # Buttons, inputs, cards, badges, prompt box, error, empty
├── index.css       # Entry point (imports all + fonts)
├── layout-template.html  # Reference HTML structure
└── DESIGN-SYSTEM.md      # This document
```

---

## Usage

```html
<link rel="stylesheet" href="design-system/index.css">
```

```html
<body class="kn-app">
  <header class="kn-topbar">...</header>
  <section class="kn-context-header">...</section>
  <main class="kn-main">
    <div class="kn-workspace">...</div>
    <aside class="kn-panel">...</aside>
  </main>
  <footer class="kn-proof-footer">...</footer>
</body>
```
