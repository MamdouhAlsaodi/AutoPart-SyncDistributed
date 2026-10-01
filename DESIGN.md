---
version: alpha
name: AutoPart
description: Graphite workshop, copper hardware and diagnostic teal for an academic auto-parts prototype.
colors:
  primary: "#172630"
  secondary: "#516876"
  tertiary: "#bb4f1a"
  neutral: "#eef2ef"
  surface: "#fffefa"
  copper-light: "#e6a35e"
  teal: "#4ac4d7"
typography:
  h1:
    fontFamily: system-ui
    fontSize: 3rem
    fontWeight: 800
    lineHeight: 1.05
  body-md:
    fontFamily: system-ui
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.45
rounded:
  sm: 3px
  md: 8px
  lg: 14px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: 12px
  sidebar:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: 16px
  page-canvas:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
  diagram-highlight:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.copper-light}"
  diagram-signal:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.teal}"
---

## Overview

AutoPart is an academic auto-parts catalogue and stock-management demonstration. The symbol is a copper gear and hexagonal part with an A cut into its centre; it works at favicon size and is repeated across the storefront, management sidebar, login and presentation. Avoid implying a commercial store or distributed infrastructure.

## Colors

- **Workshop graphite (#172630):** headers, sidebar, hero and the logo's base.
- **Copper (#bb4f1a):** primary actions on light surfaces; white type passes WCAG AA normal text.
- **Warm copper (#e6a35e):** logo lines and emphasis on dark graphite; do not use for small text on white.
- **Diagnostic teal (#4ac4d7):** secondary diagram and visual signals on dark backgrounds, not small text on white.
- **Neutral (#eef2ef) and surface (#fffefa):** spacious backgrounds and readable cards.

## Typography

Use system-ui for speed, offline reliability and Portuguese/Arabic script coverage. Establish hierarchy with weight and spacing, not arbitrary font changes.

## Layout

Storefront is a generous catalogue canvas; management is a persistent left navigation with compact operation tables. Keep touch targets at least 44px for primary actions and preserve horizontal table scrolling at narrow widths. The presentation uses the same graphite/copper/teal family with larger light text.

## Elevation & Depth

Use restrained shadows on cards and a stronger contrast between dark navigation and light content. Do not apply decorative shadows to data tables or small labels.

## Shapes

The brand gear has eight teeth, a copper ring, a hexagonal centre and an A. Small UI controls can be subtly rounded; do not soften operational tables into oversized pills.

## Components

Use copper primary actions with white text; hover deepens copper. Active navigation uses the same copper. On dark presentation backgrounds, use warm copper for accent text and teal to distinguish interface/data paths. Reserve red for destructive actions and green for successful stock operations.

## Do's and Don'ts

Do use the same mark on favicon, storefront, administration and slides. Do test contrast and mobile layouts. Do not recolour the logo blue, use an unrelated car photo or invent payment/production infrastructure.
