---
name: "CF-Server-Monitor"
description: "Warm, legible monitoring surfaces inspired by Claude."
colors:
  accent-light: "#a55035"
  accent-surface-light: "#f2e6dd"
  accent-ink-light: "#ffffff"
  bg-primary-light: "#f7f6f2"
  bg-secondary-light: "#efeee8"
  bg-card-light: "#fdfcf9"
  bg-hover-light: "#eceae2"
  border-color-light: "#dfddd4"
  border-active-light: "#b2aca0"
  text-primary-light: "#302e29"
  text-secondary-light: "#625e55"
  text-muted-light: "#706b61"
  input-bg-light: "#fdfcf9"
  input-border-light: "#b2aca0"
  accent-green-light: "#527456"
  accent-yellow-light: "#946315"
  accent-red-light: "#b3483e"
  accent-blue-light: "#526f8a"
  accent-purple-light: "#776483"
  accent-pink-light: "#945d6e"
  accent-cyan-light: "#4d7468"
  accent-dark: "#e0a086"
  accent-surface-dark: "#44342e"
  accent-ink-dark: "#252422"
  bg-primary-dark: "#252422"
  bg-secondary-dark: "#2e2d2a"
  bg-card-dark: "#302f2c"
  bg-hover-dark: "#393833"
  border-color-dark: "#494740"
  border-active-dark: "#716d64"
  text-primary-dark: "#eeece5"
  text-secondary-dark: "#c0bbb1"
  text-muted-dark: "#b0aa9f"
  input-bg-dark: "#292825"
  input-border-dark: "#615d55"
  accent-green-dark: "#9abc9e"
  accent-yellow-dark: "#d7b57b"
  accent-red-dark: "#e3a196"
  accent-blue-dark: "#a3b9cf"
  accent-purple-dark: "#beb0ce"
  accent-pink-dark: "#d2a3af"
  accent-cyan-dark: "#aac1b9"
typography:
  page-title:
    fontFamily: "'Source Serif 4', 'Songti SC', 'Noto Serif CJK SC', Georgia, serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-.03em"
  page-title-mobile:
    fontFamily: "'Source Serif 4', 'Songti SC', 'Noto Serif CJK SC', Georgia, serif"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-.03em"
  detail-title:
    fontFamily: "'Source Serif 4', 'Songti SC', 'Noto Serif CJK SC', Georgia, serif"
    fontSize: "28px"
    fontWeight: 500
  panel-title:
    fontFamily: "'Source Serif 4', 'Songti SC', 'Noto Serif CJK SC', Georgia, serif"
    fontSize: "24px"
    fontWeight: 500
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  server-title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "15px"
    fontWeight: 600
  control:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "13px"
    fontWeight: 500
    letterSpacing: "0"
  compact-control:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0"
  metric:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  chart-axis:
    fontFamily: "system-ui, sans-serif"
    fontSize: "9px"
  code:
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace"
rounded:
  badge: "4px"
  segment: "5px"
  view-segment: "6px"
  control: "7px"
  utility: "8px"
  control-group: "10px"
  surface: "12px"
  dialog: "16px"
spacing:
  tight: "8px"
  compact: "12px"
  small: "16px"
  card-gap: "18px"
  card-inset: "20px"
  section: "24px"
  wide: "28px"
  page-top: "36px"
  page-gutter: "40px"
components:
  button-primary:
    backgroundColor: "{colors.accent-light}"
    textColor: "{colors.accent-ink-light}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "7px 12px"
  button-secondary:
    backgroundColor: "{colors.bg-card-light}"
    textColor: "{colors.text-primary-light}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "7px 12px"
  input:
    backgroundColor: "{colors.input-bg-light}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.control}"
  view-control-active:
    backgroundColor: "{colors.bg-card-light}"
    textColor: "{colors.accent-light}"
    typography: "{typography.compact-control}"
    rounded: "{rounded.view-segment}"
    padding: "8px 12px"
  filter-active:
    backgroundColor: "{colors.accent-surface-light}"
    textColor: "{colors.accent-light}"
    typography: "{typography.compact-control}"
    rounded: "{rounded.control}"
    padding: "6px 10px"
  server-card:
    backgroundColor: "{colors.bg-card-light}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.surface}"
    padding: "{spacing.card-inset}"
  chart-card:
    backgroundColor: "{colors.bg-card-light}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.surface}"
    padding: "{spacing.card-inset}"
  navigation-tab-active:
    textColor: "{colors.accent-light}"
    typography: "{typography.compact-control}"
    padding: "12px 0"
---

# Design System: CF-Server-Monitor

## Overview

**Creative North Star: "A quiet, readable monitoring workspace"**

Claude-inspired warmth gives the existing monitoring interface a calm application character: warm paper in light mode, warm charcoal in dark mode, measured terracotta accents, and serif page headings. This is the project's own interface and identity; the reference does not imply Claude affiliation.

Data remains the visual center. Neutral surfaces and thin dividers organize dense readings, while tabular numerals keep live updates steady. The same palette and type vocabulary extend to server details, login, and administration. English and Chinese, including CJK heading fallbacks, share this system.

**Key Characteristics:**
- Warm neutral surfaces with a restrained terracotta action accent.
- Serif orientation headings paired with system sans controls and measurements.
- Flat bordered cards, clear operational labels, and stable numeric alignment.
- Responsive layouts and equivalent light, dark, and system-following themes.

This document records the implemented base interface, with the final palette override in `src/frontend/styles/claude.css` loaded after `main.css` and `light.css`. Component structure and data behavior remain in the existing Vue components. It describes design choices, not a claim of complete functional or accessibility certification. The dashboard composition and task-specific decisions are recorded in `.impeccable/surface-brief.md`.

## Colors

The palette pairs warm low-chroma neutrals with muted terracotta and distinguishable operational colors. Frontmatter contains the actual light and dark values. Each `*-light` / `*-dark` pair maps to the CSS variable with the same name before the suffix; dark is the root palette, and `body.light` overrides it. Auto mode follows the system through the existing theme controller. Component frontmatter uses light-mode references as its portable example; runtime components always resolve the current theme variables.

### Primary

**Muted terracotta** (`accent`) marks primary actions, selected views and filters, the identity icon, and chart current values. **Terracotta selection wash** (`accent-surface`) provides a soft selected or focus surface. **Accent button ink** (`accent-ink`) supplies theme-appropriate text on filled actions.

### Secondary

**Sage operational green**, **ochre caution**, and **clay alert** are the green, yellow, and red semantic accents. Slate blue, muted violet, dusty rose, and eucalyptus distinguish additional chart series and labeled technical values. Existing chart-series assignments and resource thresholds remain authoritative; color alone never establishes a new measurement meaning.

### Neutral

The page, inset, card, and hover surfaces form a shallow tonal stack. Primary ink leads, supporting ink explains, and muted ink handles small auxiliary content and chart axes. Quiet dividers separate groups; interactive borders strengthen hover and focus. Fields retain their own surface and border tokens.

**The Operational Meaning Rule.** Keep action selection separate from monitoring state: terracotta selects and acts; green, ochre, and red retain the existing operational thresholds and labels.

**The Reading Contrast Rule.** Use theme tokens for small chart-header text, axes, and status labels. Keep swap percentages at full opacity in supporting ink; reserve faded treatments for decorative tracks or explicitly disabled controls.

## Typography

**Display Font:** Source Serif 4 with Songti SC, Noto Serif CJK SC, and Georgia fallbacks.

**Body Font:** The system sans stack, including PingFang SC and Microsoft YaHei for Chinese UI text.

**Code Font:** SFMono-Regular, Consolas, and Liberation Mono fallbacks.

The serif supplies a warm, editorial heading character. Compact sans labels and tabular numerals support repeated comparison without ornamental emphasis. Titles use normal capitalization rather than terminal-style all caps.

### Hierarchy

- **Page title:** the regular-weight serif `page-title` token; switches to `page-title-mobile` on small screens.
- **Detail title:** medium-weight serif `detail-title`; reduces to (24px) on small screens.
- **Panel and dialog title:** the medium-weight serif `panel-title` token.
- **Identity:** medium serif (20px desktop, 17px mobile); login title uses regular serif (32px).
- **Body:** `body`; the dashboard description has a maximum measure of (65ch).
- **Server title:** semibold sans `server-title` with wrapping for long names.
- **Controls:** `control` and `compact-control`; compact status and auxiliary resource labels are (11px).
- **Readings:** `metric`; ring percentages use (22px), chart current values (17px), and chart axes the compact `chart-axis` token. Numeric metrics use tabular figures.

**The Two Voices Rule.** Use serif type for identity and orientation headings. Keep controls, table rows, resource labels, and numeric readings in sans; reserve monospace for code and commands.

### Font provenance

`public/fonts/source-serif-4-latin.woff2` is the self-hosted Source Serif 4 Latin variable font, declared for weights (400–600), normal style, with `font-display: swap`. It was obtained from [Google Fonts' font asset](https://fonts.gstatic.com/s/sourceserif4/v14/vEFF2_tTDB4M7-auWDN0ahZJW3IX2ih5nk3AucvUHf6kDXr4Y3qwzQ.woff2). The font's authorship is the [Source Serif project](https://github.com/adobe-fonts/source-serif). The SIL Open Font License 1.1 is shipped at `public/fonts/OFL-SourceSerif4.txt`, copied from [Google Fonts' license source](https://github.com/google/fonts/blob/main/ofl/sourceserif4/OFL.txt). This file covers Latin; CJK headings use the declared local fallbacks. No new raster artwork was generated for this redesign; existing upstream image assets remain unchanged.

## Layout

The centered content container has a maximum width of (1360px). Wide screens use (40px) horizontal gutters, medium screens (28px), and screens at or below (640px) use (18px). Spacing tokens record recurring observed values rather than imposing a new universal base grid.

The server-card grid uses three columns, two at or below (1120px), and one at or below (640px). Its gap is (18px), reducing to (16px) on small screens. Summary metrics use four columns, becoming two at (1120px) and staying two on mobile. The optional financial summary still follows its existing visibility setting. Dividers and aligned baselines organize the summary without separate floating tiles.

At the mobile breakpoint, the utility header wraps, language and theme controls occupy a full row, and the four view choices use an equal-width grid. Detail system information and chart cards become single-column. Administration tabs retain horizontal scrolling where necessary. Text wraps within the content width; data tables retain their own overflow container.

Historical chart timestamp density depends on the actual canvas width and selected range. The implementation reserves (48px) for the value axis and approximately (72px) per label, clamps the result to at least two ticks, and caps it at eight ticks for ranges of up to three hours or twelve for longer ranges. The limit refreshes during tick construction and range changes; labels remain horizontal. Keep this responsive behavior when adding charts.

## Elevation & Depth

Surfaces separate through warm tonal changes and thin strokes. Server cards remain shadow-free at rest and on hover. The selected view uses a small settling shadow, while floating menus, metadata tooltips, and dialogs use the overlay shadow. Login stays flat. Exact shadows live in the sidecar because frontmatter component tokens cannot express them.

**The Flat Surface Rule.** Ordinary cards stay flat, including on hover. Use tonal separation and border changes for interaction; reserve the large shadow for floating menus, tooltips, and dialogs.

## Shapes

The recurring panel shape is a gently rounded `surface` radius. Controls use `control`, utility groups use `utility`, and larger dialogs use `dialog`. Small badges use `badge`; nested segmented controls use the smaller segment radii inside their enclosing control group. Thin (1px) borders define cards, fields, and grouped controls. Status dots and metric rings retain circles for operational reading.

## Components

### Buttons

Primary actions are solid terracotta with accent ink; secondary buttons are neutral card surfaces with a quiet border. Both use the control radius and compact padding from frontmatter, with a minimum height of (36px). Hover strengthens neutral borders or gently darkens filled primary actions. Disabled controls reduce opacity to (0.5). Keyboard focus uses a (2px) terracotta outline with (4px) offset. Login actions have a larger minimum height of (46px).

### View controls and navigation

View choices live in a bordered inset group. Selection settles onto the card surface with terracotta text and a small shadow; inactive choices are supporting ink. Background and color transitions last (160ms) with ease-out. Mobile choices stack icon above label. Detail time choices repeat the inset-group vocabulary. Administration tabs use a thin terracotta underline instead of a filled block.

### Filters and badges

Region filters combine a label and count; their selected state uses terracotta text and border over the selection wash. Overflow opens a floating menu. Counts use muted ink and tabular figures. Address badges are compact neutral labels; monitoring status remains explicit wording with a small color-matched dot.

### Server cards

A server card is a single navigable surface with identity and status above measurements. Resource rings or bars, network values, and latency history retain their existing content. The card border strengthens on hover without movement. Desktop cards use the card inset token; mobile cards use (18px). Memory swap percentages retain full opacity and supporting ink. Ring tracks can be visually subdued without dimming their readings.

### Inputs and login

Fields use dedicated field surface and stroke tokens, the control radius, and a minimum height of (38px). Focus changes the border to terracotta with a soft selection outline and no glow. Placeholders use muted ink at full opacity. Login uses the same vocabulary in a centered panel capped at (430px), larger (46px) fields, and the larger dialog radius.

### Charts and data tables

Chart cards use the shared surface, border, and inset. Titles are semibold sans; current readings and labeled series remain distinct. Dataset colors resolve the theme's semantic accent variables and refresh when theme changes. Axis labels use muted ink, grids use quiet dividers, and tooltips use page background with primary body ink. Filled series use a subtle (0.05) alpha, lines use (1.5px), and point markers appear on hover. The width-aware x-axis density described in Layout is part of this pattern.

Tables use inset header surfaces, supporting header ink, tabular values, and a neutral row-hover fill. Do not impose chart or table colors independently of the active theme.

### Motion and loading

Interface state transitions favor short background and border changes. Status dots do not pulse or glow. The overview skeleton uses neutral lines and cards with the same grid vocabulary. Reduced-motion CSS disables transitions and reduces CSS animations to a single minimal iteration; Chart.js retains its existing separately configured (300ms) data animation. Do not claim that the CSS preference alone disables canvas animation.

## Do's and Don'ts

### Do:
- Do use the shared theme variables for new interface surfaces and chart series.
- Do preserve explicit status wording, units, and existing data thresholds alongside color.
- Do allow long server names and translated labels to wrap without pushing the page sideways.
- Do use tabular numerals for metrics and keep small supporting measurements fully legible.
- Do retain visible keyboard focus and respect the existing reduced-motion CSS.
- Do keep the configured site title, attribution, monitoring controls, and real measurements intact.

### Don't:
- Don't introduce terminal scanlines, glowing text, or lifting card hover effects into this visual system.
- Don't use terracotta as a substitute for healthy, warning, or offline state.
- Don't use the serif heading face for dense tables or operational values.
- Don't add Claude logos, affiliation claims, invented servers, or illustrative monitoring data.
- Don't assume a larger viewport when placing chart timestamps; use the implemented width-aware tick limit.
