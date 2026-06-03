# AI Smart Career Navigator v2.0 — Design System
### Dark-First · Violet Dominant · Monochrome Production-Grade Android UI
**Senior Frontend / Android Design Authority Document**

---

## Table of Contents

1. [Design Philosophy & Aesthetic Direction](#1-design-philosophy--aesthetic-direction)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Spacing, Grid & Layout](#4-spacing-grid--layout)
5. [Elevation & Shadow System](#5-elevation--shadow-system)
6. [Iconography & Illustration](#6-iconography--illustration)
7. [Animation & Motion System](#7-animation--motion-system)
8. [Toolbar & AppBar Design](#8-toolbar--appbar-design)
9. [Bottom Navigation Bar](#9-bottom-navigation-bar)
10. [Scroll Behaviors](#10-scroll-behaviors)
11. [Horizontal Scroll Components](#11-horizontal-scroll-components)
12. [Vertical List & Feed Components](#12-vertical-list--feed-components)
13. [Badges & Status Indicators](#13-badges--status-indicators)
14. [Button System](#14-button-system)
15. [Input & Form Components](#15-input--form-components)
16. [Card Components](#16-card-components)
17. [Chip System](#17-chip-system)
18. [Progress & Gauge Components](#18-progress--gauge-components)
19. [Chart & Data Visualization](#19-chart--data-visualization)
20. [Shimmer & Loading States](#20-shimmer--loading-states)
21. [Empty States & Illustrations](#21-empty-states--illustrations)
22. [Toast, Snackbar & Alerts](#22-toast-snackbar--alerts)
23. [Dialog & Bottom Sheet](#23-dialog--bottom-sheet)
24. [Screen-by-Screen Design Spec](#24-screen-by-screen-design-spec)
    - 24.1 Splash Screen
    - 24.2 Onboarding (ViewPager2)
    - 24.3 Login & Register
    - 24.4 OTP Screen
    - 24.5 Home / Dashboard
    - 24.6 Career List & Detail
    - 24.7 RAG AI Chat
    - 24.8 Assessment & Quiz
    - 24.9 Roadmap
    - 24.10 Jobs Hub
    - 24.11 Resume Upload & Preview
    - 24.12 Profile & Settings
    - 24.13 Mentor Discovery
    - 24.14 Analytics
    - 24.15 Notifications
25. [Custom View Design Specs](#25-custom-view-design-specs)
26. [Dark / Light Mode Toggle Strategy](#26-dark--light-mode-toggle-strategy)
27. [Accessibility Standards](#27-accessibility-standards)
28. [Gradle & Resource Setup](#28-gradle--resource-setup)
29. [Design Tokens — XML Implementation](#29-design-tokens--xml-implementation)

---

## 1. Design Philosophy & Aesthetic Direction

### Core Concept: "Deep Space Intelligence"

The app lives in the intersection of **ambition and intelligence**. Every screen must feel like a premium career command center — not a generic job board. The aesthetic draws from:

- **District App**: Content-forward, bold category labels, crisp card hierarchy, confident whitespace usage on dark backgrounds.
- **Vercel / Linear**: Dark-native, precision typography, micro-animations on every interactive element.
- **Raycast**: Glass-morphism depth, keyboard-shortcut feel of speed, immediate feedback.

### Design Pillars

| Pillar | Implementation |
|--------|---------------|
| **Dark-First** | `#060608` near-black base. All components designed dark, light is an inversion, not an afterthought. |
| **Violet Dominance** | `#6D28D9` → `#A78BFA` gradient as the brand heartbeat. Used on CTAs, active states, AI features. |
| **Slate Depth** | `#0F0F1C` → `#1E1B2E` → `#2D2A42` — three distinct blacks that create layered depth without color noise. |
| **Monochrome Accent** | Cyan `#22D3EE` is the **only** permitted non-violet accent. Used exclusively for AI streaming and live indicators. Everything else stays in the violet–slate–white axis. |
| **Motion as Language** | Animations are not decoration — they communicate state changes, hierarchy, and feedback. |
| **Typographic Confidence** | Large, bold, decisive type. No timid small text. Hierarchy through size, weight, and color — not borders. |
| **Glass Depth** | Cards use `rgba` + `backdrop-filter: blur` to create layered depth on the dark canvas. |

### Palette Philosophy: Strict Monochrome

This system uses a **violet + black + slate + white** axis only. There is no yellow, no amber, no gold anywhere in the UI.

- **Ratings & salary** that previously used gold now use `color_text_primary` (near-white) with `Mono` font weight — legibility over decoration.
- **Premium/PRO indicators** use a `color_violet_bright` tinted glass treatment instead of a gold badge.
- **Warning states** use `color_violet_muted` instead of amber.
- **Success** remains `color_emerald` as a singular green accent (not warm-toned).

### What We NEVER Do

- Generic white cards on dark background (flat, lifeless)
- Full-opacity solid purple everywhere (garish, unprofessional)
- **Any yellow, amber, or gold anywhere in the UI**
- Rounded everything uniformly (inconsistent intention)
- Animations that delay interaction (motion must feel responsive, not sluggish)
- Purple gradient on white (#1 cliché of AI apps)

---

## 2. Color System

### Primary Palette — Dark Theme (Default)

```xml
<!-- colors.xml — Dark Theme -->

<!-- === BASE SURFACES (Four distinct blacks — never the same shade twice) === -->
<color name="color_background">#060608</color>          <!-- True near-black: deepest base -->
<color name="color_surface_1">#0F0F1C</color>           <!-- Ink black: toolbar, bottom nav -->
<color name="color_surface_2">#161525</color>           <!-- Slate black: default card surface -->
<color name="color_surface_3">#1E1B2E</color>           <!-- Deep slate: elevated card, sheet -->
<color name="color_surface_4">#2D2A42</color>           <!-- Lifted slate: highest elevation -->
<color name="color_surface_glass">#FFFFFF08</color>     <!-- 3% white glass overlay -->
<color name="color_surface_glass_strong">#FFFFFF14</color> <!-- 8% white glass -->

<!-- === VIOLET BRAND === -->
<color name="color_primary">#6D28D9</color>             <!-- Core violet -->
<color name="color_primary_bright">#8B5CF6</color>      <!-- Active / hover violet -->
<color name="color_primary_glow">#A78BFA</color>        <!-- Neon violet for glow/emphasis -->
<color name="color_primary_muted">#4C1D95</color>       <!-- Deep violet for pressed state -->
<color name="color_primary_dim">#6D28D926</color>       <!-- 15% violet, tinted background -->
<color name="color_primary_dim_strong">#8B5CF633</color><!-- 20% violet, stronger tint -->
<color name="color_primary_container">#2E1065</color>   <!-- Very dark violet container -->
<color name="color_on_primary">#FFFFFF</color>

<!-- === GRADIENT STOPS (reference for code, not XML attr) === -->
<!-- gradient_violet_start:  #6D28D9 -->
<!-- gradient_violet_mid:    #8B5CF6 -->
<!-- gradient_violet_end:    #A78BFA -->
<!-- gradient_glow:          #8B5CF640 → transparent -->
<!-- gradient_deep:          #060608 → #1A0A2E (near-black to deep violet) -->
<!-- gradient_slate:         #0F0F1C → #2D2A42 (surface depth gradient) -->

<!-- === CYAN (AI / LIVE ONLY — use nowhere else) === -->
<color name="color_cyan">#22D3EE</color>                <!-- AI streaming, live status only -->
<color name="color_cyan_dim">#22D3EE1A</color>          <!-- 10% cyan, AI bubble background -->
<color name="color_cyan_border">#22D3EE33</color>       <!-- Cyan border on AI cards -->

<!-- === SEMANTIC STATUS (minimal, no warm tones) === -->
<color name="color_emerald">#10B981</color>             <!-- Success, verified, completed -->
<color name="color_emerald_dim">#10B98120</color>
<color name="color_rose">#F43F5E</color>                <!-- Error, danger, rejected -->
<color name="color_rose_dim">#F43F5E20</color>
<color name="color_violet_warning">#7C3AED</color>      <!-- Warning: uses mid-violet, NOT amber -->
<color name="color_violet_warning_dim">#7C3AED26</color>

<!-- NOTE: No amber (#F59E0B), no gold (#F59E0B), no yellow anywhere in this system. -->
<!-- Salary, ratings, and premium indicators use color_text_primary + Mono font weight. -->

<!-- === TEXT (violet-tinted greyscale axis) === -->
<color name="color_text_primary">#EEEAF8</color>        <!-- Near-white with violet warmth -->
<color name="color_text_secondary">#9D99B8</color>      <!-- Muted violet-grey -->
<color name="color_text_tertiary">#5C5A78</color>       <!-- Placeholder, disabled -->
<color name="color_text_inverse">#060608</color>        <!-- Text on light surfaces -->
<color name="color_text_violet">#C4B5FD</color>         <!-- Soft violet for callouts, links -->

<!-- === BORDER / DIVIDER (all neutral — no tinted borders as defaults) === -->
<color name="color_border">#FFFFFF10</color>            <!-- 6% white border — default -->
<color name="color_border_medium">#FFFFFF1A</color>     <!-- 10% white border — medium emphasis -->
<color name="color_border_strong">#FFFFFF26</color>     <!-- 15% white — high emphasis -->
<color name="color_border_violet">#8B5CF630</color>     <!-- Violet-tinted border — focused/active -->
<color name="color_divider">#FFFFFF08</color>           <!-- Ultra-subtle section divider -->

<!-- === SPECIAL === -->
<color name="color_overlay_scrim">#000000CC</color>     <!-- Dialog scrim, 80% black -->
<color name="color_shadow_violet">#6D28D966</color>     <!-- Violet glow shadow -->
<color name="color_ripple_primary">#8B5CF628</color>
<color name="color_ripple_white">#FFFFFF14</color>
```

### Light Theme Overrides

```xml
<!-- colors.xml — Light Theme (res/values/ with night override in res/values-night/) -->
<color name="color_background">#F3F0FF</color>          <!-- Soft violet-white base -->
<color name="color_surface_1">#FFFFFF</color>
<color name="color_surface_2">#FAF8FF</color>
<color name="color_surface_3">#F0EBFF</color>
<color name="color_surface_4">#E5DEFF</color>
<color name="color_text_primary">#0D0B1A</color>
<color name="color_text_secondary">#4A4768</color>
<color name="color_text_tertiary">#8A87A8</color>
<color name="color_border">#0000000F</color>
<color name="color_divider">#00000008</color>
```

### Usage Rules

| Element | Token |
|---------|-------|
| Screen background | `color_background` (#060608 near-black) |
| Cards (default resting) | `color_surface_2` (#161525 slate black) |
| Cards (elevated, focused) | `color_surface_3` (#1E1B2E deep slate) |
| Bottom sheet, dialogs | `color_surface_3` / `color_surface_4` |
| Toolbar background | `color_surface_1` (#0F0F1C ink black) |
| Bottom nav background | `color_surface_1` |
| CTA primary button | `color_primary` → `color_primary_bright` gradient |
| Active tab/icon | `color_primary_bright` |
| AI streaming feature | `color_cyan` (only here) |
| Salary / Rating display | `color_text_primary` + `Mono` font weight |
| PRO / Premium | `color_primary_bright` glass chip |
| Success states | `color_emerald` |
| Warning states | `color_violet_warning` |
| Danger / Error | `color_rose` |

---

## 3. Typography System

### Font Families

**Display / Heading**: `Space Grotesk` — Bold, geometric, technical confidence. Perfect for career/AI app.
**Body / UI**: `DM Sans` — Clean, readable, modern warmth. Excellent legibility at small sizes.
**Monospace / Code / Score**: `JetBrains Mono` — For percentages, scores, code, terminal feel in chat.

```xml
<!-- res/font/ — download from Google Fonts -->
<!-- space_grotesk_bold.ttf, space_grotesk_semibold.ttf, space_grotesk_medium.ttf -->
<!-- dm_sans_regular.ttf, dm_sans_medium.ttf, dm_sans_semibold.ttf -->
<!-- jetbrains_mono_regular.ttf, jetbrains_mono_medium.ttf -->
```

```xml
<!-- res/values/fonts.xml -->
<font-family xmlns:app="http://schemas.android.com/apk/res-auto">
    <font app:fontStyle="normal" app:fontWeight="500" app:font="@font/space_grotesk_medium"/>
    <font app:fontStyle="normal" app:fontWeight="600" app:font="@font/space_grotesk_semibold"/>
    <font app:fontStyle="normal" app:fontWeight="700" app:font="@font/space_grotesk_bold"/>
    <font app:fontStyle="normal" app:fontWeight="400" app:font="@font/dm_sans_regular"/>
    <font app:fontStyle="normal" app:fontWeight="500" app:font="@font/dm_sans_medium"/>
    <font app:fontStyle="normal" app:fontWeight="600" app:font="@font/dm_sans_semibold"/>
</font-family>
```

### Type Scale

```xml
<!-- res/values/styles_text.xml -->

<!-- DISPLAY -->
<style name="TextAppearance.AiCareer.Display.Large">
    <item name="fontFamily">@font/space_grotesk_bold</item>
    <item name="android:textSize">40sp</item>
    <item name="android:lineSpacingMultiplier">1.1</item>
    <item name="android:letterSpacing">-0.02</item>
    <item name="android:textColor">@color/color_text_primary</item>
</style>

<style name="TextAppearance.AiCareer.Display.Medium">
    <item name="fontFamily">@font/space_grotesk_bold</item>
    <item name="android:textSize">32sp</item>
    <item name="android:letterSpacing">-0.01</item>
</style>

<!-- HEADLINE -->
<style name="TextAppearance.AiCareer.Headline.Large">
    <item name="fontFamily">@font/space_grotesk_semibold</item>
    <item name="android:textSize">24sp</item>
    <item name="android:letterSpacing">-0.005</item>
</style>

<style name="TextAppearance.AiCareer.Headline.Medium">
    <item name="fontFamily">@font/space_grotesk_semibold</item>
    <item name="android:textSize">20sp</item>
</style>

<style name="TextAppearance.AiCareer.Headline.Small">
    <item name="fontFamily">@font/space_grotesk_medium</item>
    <item name="android:textSize">16sp</item>
</style>

<!-- TITLE -->
<style name="TextAppearance.AiCareer.Title.Large">
    <item name="fontFamily">@font/dm_sans_semibold</item>
    <item name="android:textSize">18sp</item>
</style>

<style name="TextAppearance.AiCareer.Title.Medium">
    <item name="fontFamily">@font/dm_sans_semibold</item>
    <item name="android:textSize">15sp</item>
</style>

<style name="TextAppearance.AiCareer.Title.Small">
    <item name="fontFamily">@font/dm_sans_medium</item>
    <item name="android:textSize">13sp</item>
</style>

<!-- BODY -->
<style name="TextAppearance.AiCareer.Body.Large">
    <item name="fontFamily">@font/dm_sans_regular</item>
    <item name="android:textSize">16sp</item>
    <item name="android:lineSpacingMultiplier">1.5</item>
</style>

<style name="TextAppearance.AiCareer.Body.Medium">
    <item name="fontFamily">@font/dm_sans_regular</item>
    <item name="android:textSize">14sp</item>
    <item name="android:lineSpacingMultiplier">1.5</item>
</style>

<style name="TextAppearance.AiCareer.Body.Small">
    <item name="fontFamily">@font/dm_sans_regular</item>
    <item name="android:textSize">12sp</item>
    <item name="android:lineSpacingMultiplier">1.4</item>
</style>

<!-- LABEL -->
<style name="TextAppearance.AiCareer.Label.Large">
    <item name="fontFamily">@font/dm_sans_medium</item>
    <item name="android:textSize">13sp</item>
    <item name="android:letterSpacing">0.01</item>
</style>

<style name="TextAppearance.AiCareer.Label.Medium">
    <item name="fontFamily">@font/dm_sans_medium</item>
    <item name="android:textSize">11sp</item>
    <item name="android:letterSpacing">0.02</item>
</style>

<style name="TextAppearance.AiCareer.Label.Small">
    <item name="fontFamily">@font/dm_sans_medium</item>
    <item name="android:textSize">10sp</item>
    <item name="android:letterSpacing">0.04</item>
    <item name="android:textAllCaps">true</item>
</style>

<!-- MONO — Scores, percentages, salary figures, stats, code -->
<style name="TextAppearance.AiCareer.Mono.Large">
    <item name="fontFamily">@font/jetbrains_mono_medium</item>
    <item name="android:textSize">28sp</item>
    <item name="android:textColor">@color/color_text_primary</item>
</style>

<style name="TextAppearance.AiCareer.Mono.Medium">
    <item name="fontFamily">@font/jetbrains_mono_regular</item>
    <item name="android:textSize">16sp</item>
    <item name="android:textColor">@color/color_text_primary</item>
</style>

<style name="TextAppearance.AiCareer.Mono.Small">
    <item name="fontFamily">@font/jetbrains_mono_regular</item>
    <item name="android:textSize">12sp</item>
    <item name="android:textColor">@color/color_text_secondary</item>
</style>
```

---

## 4. Spacing, Grid & Layout

### Base Unit: 4dp

All spacing is a multiple of 4dp. No arbitrary values.

```xml
<!-- res/values/dimens.xml -->

<!-- SPACING SCALE -->
<dimen name="space_0">0dp</dimen>
<dimen name="space_1">4dp</dimen>
<dimen name="space_2">8dp</dimen>
<dimen name="space_3">12dp</dimen>
<dimen name="space_4">16dp</dimen>
<dimen name="space_5">20dp</dimen>
<dimen name="space_6">24dp</dimen>
<dimen name="space_8">32dp</dimen>
<dimen name="space_10">40dp</dimen>
<dimen name="space_12">48dp</dimen>
<dimen name="space_16">64dp</dimen>
<dimen name="space_20">80dp</dimen>

<!-- SCREEN MARGINS -->
<dimen name="screen_margin_horizontal">20dp</dimen>
<dimen name="screen_margin_vertical">16dp</dimen>

<!-- COMPONENT SIZES -->
<dimen name="toolbar_height">60dp</dimen>
<dimen name="bottom_nav_height">72dp</dimen>
<dimen name="bottom_nav_indicator_height">3dp</dimen>

<!-- CARD SPECS -->
<dimen name="card_corner_radius_small">10dp</dimen>
<dimen name="card_corner_radius_medium">16dp</dimen>
<dimen name="card_corner_radius_large">24dp</dimen>
<dimen name="card_corner_radius_xlarge">32dp</dimen>
<dimen name="card_corner_radius_pill">100dp</dimen>
<dimen name="card_elevation_resting">0dp</dimen>
<dimen name="card_elevation_raised">8dp</dimen>

<!-- AVATAR SIZES -->
<dimen name="avatar_xs">24dp</dimen>
<dimen name="avatar_sm">32dp</dimen>
<dimen name="avatar_md">48dp</dimen>
<dimen name="avatar_lg">72dp</dimen>
<dimen name="avatar_xl">96dp</dimen>
<dimen name="avatar_xxl">120dp</dimen>

<!-- ICON SIZES -->
<dimen name="icon_sm">16dp</dimen>
<dimen name="icon_md">20dp</dimen>
<dimen name="icon_lg">24dp</dimen>
<dimen name="icon_xl">32dp</dimen>

<!-- TOUCH TARGET MINIMUM -->
<dimen name="touch_target_min">48dp</dimen>

<!-- BADGES -->
<dimen name="badge_dot_size">8dp</dimen>
<dimen name="badge_pill_height">20dp</dimen>
<dimen name="badge_pill_min_width">20dp</dimen>

<!-- CHARTS -->
<dimen name="chart_height_mini">80dp</dimen>
<dimen name="chart_height_small">140dp</dimen>
<dimen name="chart_height_medium">220dp</dimen>
<dimen name="chart_height_large">300dp</dimen>

<!-- HORIZONTAL SCROLL ITEM WIDTHS -->
<dimen name="hscroll_card_width_sm">160dp</dimen>
<dimen name="hscroll_card_width_md">240dp</dimen>
<dimen name="hscroll_card_width_lg">300dp</dimen>
<dimen name="hscroll_peek_amount">24dp</dimen>

<!-- BOTTOM SHEET -->
<dimen name="bottom_sheet_corner_radius">28dp</dimen>
<dimen name="bottom_sheet_drag_handle_width">36dp</dimen>
<dimen name="bottom_sheet_drag_handle_height">4dp</dimen>

<!-- FIT SCORE RING -->
<dimen name="fit_score_ring_size_sm">48dp</dimen>
<dimen name="fit_score_ring_size_md">72dp</dimen>
<dimen name="fit_score_ring_size_lg">120dp</dimen>
<dimen name="fit_score_ring_stroke_width">6dp</dimen>

<!-- PROGRESS BAR -->
<dimen name="progress_height_thin">3dp</dimen>
<dimen name="progress_height_medium">6dp</dimen>
<dimen name="progress_height_thick">10dp</dimen>
```

### Grid System

```
Full width:           match_parent (minus 20dp each side = 20dp margins)
Half grid (2-col):    (screen - 3 × 8dp) / 2
Two-thirds:           2/3 of usable width
Card peek layout:     card = 240dp fixed, gap = 12dp, peek = 24dp right
```

---

## 5. Elevation & Shadow System

In dark theme, elevation is communicated through **surface tinting** (lighter slate = higher), not drop shadows. Drop shadows use violet glow for branded feel.

```xml
<!-- res/values/styles_elevation.xml -->

<!-- Resting card — no shadow, subtle border only -->
<style name="Elevation.Card.Resting">
    <item name="cardBackgroundColor">@color/color_surface_2</item>
    <item name="strokeColor">@color/color_border</item>
    <item name="strokeWidth">1dp</item>
    <item name="cardElevation">0dp</item>
</style>

<!-- Raised card — lifted slate surface + violet shadow -->
<style name="Elevation.Card.Raised">
    <item name="cardBackgroundColor">@color/color_surface_3</item>
    <item name="strokeColor">@color/color_border_violet</item>
    <item name="strokeWidth">1dp</item>
    <item name="cardElevation">12dp</item>
</style>

<!-- Glow card — glass + violet border glow (AI features, CTAs) -->
<style name="Elevation.Card.Glow">
    <item name="cardBackgroundColor">@color/color_primary_dim</item>
    <item name="strokeColor">@color/color_primary_bright</item>
    <item name="strokeWidth">1dp</item>
    <item name="cardElevation">16dp</item>
</style>
```

**Programmatic Violet Shadow** (Kotlin):
```kotlin
fun View.applyVioletShadow(radius: Float = 24f, color: Int = 0x406D28D9) {
    outlineAmbientShadowColor = color
    outlineSpotShadowColor = color
    elevation = radius / 2
}
```

---

## 6. Iconography & Illustration

### Icon Library: Phosphor Icons (Android port)
- Fills — for selected/active states
- Regular — for inactive/default states
- All icons: 24dp base, scale up to 32dp for hero moments

### Icon Color Rules

| State | Color |
|-------|-------|
| Active / Selected | `color_primary_bright` (#8B5CF6) |
| Inactive / Default | `color_text_tertiary` (#5C5A78) |
| On-primary surface | `color_on_primary` |
| AI-feature icon | `color_cyan` (#22D3EE) |
| Success indicator | `color_emerald` (#10B981) |
| Error/Danger | `color_rose` (#F43F5E) |
| Salary / Rating icon | `color_text_secondary` (#9D99B8) with `Mono` text |

> **Removed:** No more gold/yellow icons. Salary and rating icons use `color_text_secondary` paired with Mono-weight numeric values.

### Illustration Style
- **Lottie animations**: Use for onboarding slides, AI thinking state, upload success, quiz pass celebration.
- **Lottie color override**: All Lottie animations tinted programmatically to violet/cyan palette via `LottieAnimationView.addValueCallback()`.
- **Empty states**: Custom SVG vector illustrations — geometric, space-themed, minimal line art with violet/cyan accents only.
- **No PNG illustrations** — all vector or Lottie.

---

## 7. Animation & Motion System

### Core Principles

| Principle | Rule |
|-----------|------|
| Duration | Fast: 150ms, Normal: 280ms, Slow: 450ms, Very Slow: 600ms |
| Easing | Enter: `FastOutSlowIn`. Exit: `LinearOutSlowIn`. Shared element: `FastOutSlowIn`. |
| Stagger | List items: 40ms delay between each item entrance |
| Interruption | Any animation can be interrupted immediately — no locks |
| Reduced Motion | Respect `ANIMATOR_DURATION_SCALE = 0` system setting |

### Animation Catalog

#### Screen Transitions
```xml
<!-- res/anim/slide_in_right.xml -->
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate android:fromXDelta="100%" android:toXDelta="0"
               android:duration="300" android:interpolator="@interpolator/fast_out_slow_in"/>
    <alpha android:fromAlpha="0.0" android:toAlpha="1.0" android:duration="200"/>
</set>

<!-- res/anim/slide_out_left.xml -->
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <translate android:fromXDelta="0" android:toXDelta="-30%"
               android:duration="300" android:interpolator="@interpolator/fast_out_linear_in"/>
    <alpha android:fromAlpha="1.0" android:toAlpha="0.0" android:duration="300"/>
</set>

<!-- res/anim/fade_scale_in.xml -->
<set xmlns:android="http://schemas.android.com/apk/res/android">
    <scale android:fromXScale="0.92" android:toXScale="1.0"
           android:fromYScale="0.92" android:toYScale="1.0"
           android:pivotX="50%" android:pivotY="50%"
           android:duration="280" android:interpolator="@interpolator/fast_out_slow_in"/>
    <alpha android:fromAlpha="0.0" android:toAlpha="1.0" android:duration="220"/>
</set>
```

#### Micro-Interactions

**Button press effect:**
```kotlin
fun View.applyPressAnimation() {
    setOnTouchListener { _, event ->
        when (event.action) {
            MotionEvent.ACTION_DOWN -> animate().scaleX(0.96f).scaleY(0.96f).setDuration(100).start()
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL ->
                animate().scaleX(1f).scaleY(1f).setDuration(150)
                    .setInterpolator(OvershootInterpolator(1.5f)).start()
        }
        false
    }
}
```

**Score counter animation:**
```kotlin
fun TextView.animateToValue(target: Int, duration: Long = 1000L) {
    val animator = ValueAnimator.ofInt(0, target).apply {
        this.duration = duration
        interpolator = DecelerateInterpolator()
        addUpdateListener { text = "${it.animatedValue}%" }
    }
    animator.start()
}
```

**Staggered list entrance:**
```kotlin
fun RecyclerView.animateItemsEntrance() {
    val adapter = adapter ?: return
    for (i in 0 until adapter.itemCount) {
        findViewHolderForAdapterPosition(i)?.itemView?.apply {
            alpha = 0f
            translationY = 40f
            animate().alpha(1f).translationY(0f)
                .setStartDelay(i * 40L).setDuration(350)
                .setInterpolator(FastOutSlowInInterpolator()).start()
        }
    }
}
```

**Bottom sheet entrance:**
```kotlin
val behavior = BottomSheetBehavior.from(sheet)
behavior.addBottomSheetCallback(object : BottomSheetBehavior.BottomSheetCallback() {
    override fun onSlide(bottomSheet: View, slideOffset: Float) {
        scrimView.alpha = slideOffset * 0.85f
        (bottomSheet as? MaterialCardView)?.radius =
            28f * (1f - maxOf(0f, (slideOffset - 0.8f) / 0.2f))
    }
})
```

**Violet glow pulse (for AI loading):**
```kotlin
fun View.pulseGlow() {
    val animator = ObjectAnimator.ofFloat(this, "alpha", 0.4f, 1.0f).apply {
        duration = 900
        repeatMode = ValueAnimator.REVERSE
        repeatCount = ValueAnimator.INFINITE
        interpolator = AccelerateDecelerateInterpolator()
    }
    animator.start()
}
```

**Shimmer wave animation:**
```xml
<com.facebook.shimmer.ShimmerFrameLayout
    app:shimmer_base_color="@color/color_surface_3"
    app:shimmer_highlight_color="@color/color_surface_4"
    app:shimmer_angle="10"
    app:shimmer_duration="1200"
    app:shimmer_tilt="20"/>
```

---

## 8. Toolbar & AppBar Design

### Design Spec

**Type A — Transparent + Blur (Home, Career, Jobs)**
```xml
<com.google.android.material.appbar.AppBarLayout
    android:background="@android:color/transparent"
    android:elevation="0dp">
    <com.google.android.material.appbar.MaterialToolbar
        android:id="@+id/toolbar"
        android:layout_height="@dimen/toolbar_height"
        android:paddingHorizontal="@dimen/screen_margin_horizontal"
        android:background="@android:color/transparent"
        app:contentInsetStart="0dp"/>
</com.google.android.material.appbar.AppBarLayout>
```

**Toolbar Content Layout:**
```xml
<ConstraintLayout>
    <!-- Left: AI Status dot + App wordmark -->
    <View android:id="@+id/ai_status_dot"
          android:layout_width="8dp" android:layout_height="8dp"
          android:background="@drawable/bg_pulse_dot_cyan"/>
    <TextView android:id="@+id/app_wordmark"
              android:text="NAVIGATOR"
              style="@style/TextAppearance.AiCareer.Label.Small"
              android:textColor="@color/color_primary_bright"
              android:letterSpacing="0.15"/>
    <!-- Center: scroll-aware title -->
    <TextView android:id="@+id/toolbar_title"
              android:alpha="0"
              style="@style/TextAppearance.AiCareer.Headline.Small"/>
    <!-- Right: Notification bell + avatar -->
    <ImageButton android:id="@+id/btn_notifications"
                 android:src="@drawable/ic_bell"
                 android:background="@drawable/bg_icon_button_glass"/>
    <com.google.android.material.imageview.ShapeableImageView
              android:id="@+id/iv_avatar"
              android:layout_width="@dimen/avatar_sm"
              android:layout_height="@dimen/avatar_sm"
              app:shapeAppearanceOverlay="@style/ShapeAppearance.Circle"/>
</ConstraintLayout>
```

**Toolbar blur effect (API 31+):**
```kotlin
if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    toolbar.setRenderEffect(
        RenderEffect.createBlurEffect(20f, 20f, Shader.TileMode.CLAMP))
}
// API < 31: translucent #0F0F1CCC
```

**Toolbar scroll behavior:**
```kotlin
appBarLayout.addOnOffsetChangedListener { _, verticalOffset ->
    val scrollRatio = abs(verticalOffset).toFloat() / appBarLayout.totalScrollRange
    toolbar.setBackgroundColor(
        ColorUtils.blendARGB(Color.TRANSPARENT,
            ContextCompat.getColor(ctx, R.color.color_surface_1), scrollRatio.coerceIn(0f, 1f)))
    toolbarTitle.alpha = ((scrollRatio - 0.6f) / 0.4f).coerceIn(0f, 1f)
    toolbarDivider.alpha = scrollRatio
}
```

**Type B — Solid Surface (Detail, Settings, Chat)**
```xml
<com.google.android.material.appbar.MaterialToolbar
    android:background="@color/color_surface_1"
    app:navigationIcon="@drawable/ic_arrow_left"
    app:navigationIconTint="@color/color_text_primary"/>
<!-- Bottom border: 1dp, color_border_violet -->
```

**Type C — Collapsing Large Title (Profile, Analytics)**
```xml
<CollapsingToolbarLayout
    app:contentScrim="@color/color_surface_1"
    app:expandedTitleTextAppearance="@style/TextAppearance.AiCareer.Display.Medium"
    app:collapsedTitleTextAppearance="@style/TextAppearance.AiCareer.Headline.Small"
    app:expandedTitleMarginStart="@dimen/screen_margin_horizontal"
    app:expandedTitleMarginBottom="24dp">
    <ImageView app:layout_collapseMode="parallax"
               app:layout_collapseParallaxMultiplier="0.5"/>
    <!-- Gradient scrim: transparent top → color_background bottom -->
</CollapsingToolbarLayout>
```

**Notification Bell Badge:**
- Pill shape, `color_rose` background, white text, `TextAppearance.AiCareer.Label.Small`
- Unread count > 9 shows "9+"
- Bell shake on new notification: `ObjectAnimator.ofFloat(view, "rotation", 0, -15, 15, -10, 10, -5, 5, 0).setDuration(600)`

---

## 9. Bottom Navigation Bar

### Design Spec

Taller (72dp), `color_surface_1` surface, violet active indicator pill, icon-only (no labels).

```xml
<com.google.android.material.bottomnavigation.BottomNavigationView
    android:id="@+id/bottom_nav"
    android:layout_height="@dimen/bottom_nav_height"
    android:paddingBottom="12dp"
    android:background="@color/color_surface_1"
    app:labelVisibilityMode="unlabeled"
    app:itemIconSize="24dp"
    app:itemActiveIndicatorStyle="@style/Widget.AiCareer.BottomNav.Indicator"
    app:menu="@menu/bottom_nav_menu"/>
```

```xml
<style name="Widget.AiCareer.BottomNav.Indicator">
    <item name="android:color">@color/color_primary_dim</item>
    <item name="shapeAppearance">@style/ShapeAppearance.BottomNav.Indicator</item>
</style>
<style name="ShapeAppearance.BottomNav.Indicator">
    <item name="cornerFamily">rounded</item>
    <item name="cornerSize">50%</item>
</style>
```

```xml
<menu xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:id="@+id/nav_home"     android:icon="@drawable/ic_home_selector"    android:title="Home"/>
    <item android:id="@+id/nav_career"   android:icon="@drawable/ic_career_selector"  android:title="Career"/>
    <item android:id="@+id/nav_chat"     android:icon="@drawable/ic_ai_chat_selector" android:title="AI Chat"/>
    <item android:id="@+id/nav_jobs"     android:icon="@drawable/ic_jobs_selector"    android:title="Jobs"/>
    <item android:id="@+id/nav_profile"  android:icon="@drawable/ic_profile_selector" android:title="Profile"/>
</menu>
```

**Icon selectors:**
- State selected: filled phosphor icon, `color_primary_bright`
- State default: outline phosphor icon, `color_text_tertiary`

**Active state animation:**
```kotlin
bottomNav.setOnItemSelectedListener { item ->
    // Trigger AVD path drawing stroke animation
    val icon = item.icon
    if (icon is AnimatedVectorDrawable) {
        icon.start()
    }
    
    // Smooth micro-interaction translation lift
    val itemView = bottomNav.findViewById<View>(item.itemId)
    itemView?.animate()?.translationY(-5f)?.setDuration(120)?.withEndAction {
        itemView.animate()?.translationY(0f)?.setDuration(180)
            ?.setInterpolator(OvershootInterpolator(2f))?.start()
    }?.start()

    NavigationUI.onNavDestinationSelected(item, navController)
    true
}
```

**AI Chat Center Tab (Special):**
- Center icon (index 2), 28dp
- Lottie cyan spark animation on idle, 1.5s loop
- Active indicator uses `color_cyan_dim` instead of `color_primary_dim`

**Hide on scroll:**
```kotlin
recyclerView.addOnScrollListener(object : RecyclerView.OnScrollListener() {
    override fun onScrolled(rv: RecyclerView, dx: Int, dy: Int) {
        if (dy > 8) bottomNav.hide() else if (dy < -8) bottomNav.show()
    }
})
```

---

## 10. Scroll Behaviors

### Scroll Strategy Matrix

| Screen | Scroll Type | AppBar Behavior | Special |
|--------|------------|-----------------|---------|
| Home | NestedScrollView | Fade transparent → solid | Shimmer sections |
| Career List | RecyclerView | Collapsing + search stick | Filter chips stick below toolbar |
| Career Detail | NestedScroll + CoordLayout | Parallax banner | Shared element return |
| AI Chat | RecyclerView inverted | Static toolbar | Scroll to bottom on new message |
| Assessment | Single view (no scroll) | Static | N/A |
| Roadmap | NestedScrollView | Large title collapse | Phase sticky headers |
| Jobs | ViewPager2 → RecyclerView | Collapsing | Tab sticky below toolbar |
| Profile | CoordLayout + NestedScroll | Large title + avatar | Avatar parallax |
| Analytics | ViewPager2 → ScrollView | Static | Chart sticky |

### Over-scroll Glow
```kotlin
recyclerView.edgeEffectFactory = object : RecyclerView.EdgeEffectFactory() {
    override fun createEdgeEffect(view: RecyclerView, direction: Int): EdgeEffect {
        return EdgeEffect(view.context).apply {
            color = ContextCompat.getColor(view.context, R.color.color_primary)
        }
    }
}
```

---

## 11. Horizontal Scroll Components

### HScroll Design Rules
- First item: `marginStart = 20dp`
- Last item: `marginEnd = 20dp`
- Gap between items: `12dp`
- Next item peeks `24dp` to indicate scrollability
- Snap behavior: `PagerSnapHelper` or smooth fling

### Career Match Cards (Home HScroll — 240dp wide)
```xml
<com.google.android.material.card.MaterialCardView
    android:layout_width="240dp"
    android:layout_height="wrap_content"
    android:layout_marginEnd="12dp"
    app:cardCornerRadius="20dp"
    app:cardBackgroundColor="@color/color_surface_2"
    app:strokeColor="@color/color_border"
    app:strokeWidth="1dp">

    <!-- Top: Dark violet gradient banner 80dp tall -->
    <View android:id="@+id/banner"
          android:layout_height="80dp"
          android:background="@drawable/bg_career_banner_gradient"/>

    <!-- Fit score ring: 48dp, overlapping banner -->
    <!-- Career title: Headline.Small, color_text_primary -->
    <!-- Category chip: violet -->
    <!-- Salary: Mono.Small, color_text_primary (not gold) -->
    <!-- Bottom: "Explore" text button with arrow icon -->
</com.google.android.material.card.MaterialCardView>
```

### Category Filter Pills (HScroll)
```xml
<HorizontalScrollView android:scrollbars="none">
    <LinearLayout android:orientation="horizontal" android:paddingHorizontal="20dp">
        <Chip app:chipCornerRadius="100dp" app:chipStrokeWidth="1dp"
              style="@style/Widget.AiCareer.Chip.Filter"/>
    </LinearLayout>
</HorizontalScrollView>
```

---

## 12. Vertical List & Feed Components

### RecyclerView Configuration
```kotlin
recyclerView.apply {
    layoutManager = LinearLayoutManager(context)
    addItemDecoration(SpaceItemDecoration(vertical = 12))
    setHasFixedSize(true)
    itemAnimator = DefaultItemAnimator().apply { moveDuration = 200 }
    edgeEffectFactory = VioletEdgeEffectFactory()
}
```

### List Item Anatomy (Career, Job, Notification)

Every list item has:
1. **Leading**: Icon container or avatar (40–48dp)
2. **Content**: Title (`Title.Medium`) + subtitle (`Body.Small`, `color_text_secondary`) + meta chips
3. **Trailing**: Badge / score / chevron or action button

### Swipe-to-Action
```kotlin
ItemTouchHelper(object : ItemTouchHelper.SimpleCallback(0, LEFT or RIGHT) {
    override fun onChildDraw(canvas, rv, viewHolder, dX, dY, actionState, active) {
        val paint = Paint().apply { color = Color.parseColor("#1AF43F5E") }
        canvas.drawRoundRect(revealRect, 16f, 16f, paint)
        icon.draw(canvas)
        super.onChildDraw(...)
    }
}).attachToRecyclerView(recyclerView)
```

### Section Headers
```xml
<TextView style="@style/TextAppearance.AiCareer.Label.Small"
          android:textColor="@color/color_text_tertiary"
          android:paddingVertical="12dp"
          android:paddingHorizontal="@dimen/screen_margin_horizontal"
          android:background="@color/color_background"/>
```

---

## 13. Badges & Status Indicators

### Badge Types

**1. Dot Badge** (Unread, Live status)
```xml
<View android:layout_width="8dp" android:layout_height="8dp"
      android:background="@drawable/bg_badge_dot_rose"/>
<!-- bg_badge_dot_cyan for AI/live/streaming only -->
<!-- bg_badge_dot_emerald for online/verified -->
```

**2. Pill Badge** (Count)
```xml
<TextView android:minWidth="20dp" android:layout_height="20dp"
          android:paddingHorizontal="6dp"
          android:background="@drawable/bg_badge_pill_rose"
          style="@style/TextAppearance.AiCareer.Label.Small"
          android:textColor="@color/color_on_primary"
          android:gravity="center"/>
```

**3. Status Chip** (Application state, roadmap state)
```xml
<!-- Applied: violet | Interview: violet_bright | Offered: emerald | Rejected: rose | Locked: surface_4 -->
<Chip style="@style/Widget.AiCareer.Chip.Status.Applied"/>
```

**4. Score Badge** (Match %, fit score)
```xml
<!-- Color by value — JetBrains Mono, bold:
     90-100: emerald | 70-89: color_primary_bright | 50-69: color_text_secondary | <50: rose -->
<TextView style="@style/TextAppearance.AiCareer.Mono.Small"
          android:background="@drawable/bg_score_badge"/>
```

**5. Verified Badge**
```xml
<ImageView android:src="@drawable/ic_verified_shield"
           android:colorFilter="@color/color_emerald"/>
```

**6. PRO Badge** (Premium tier — violet glass, NOT gold)
```xml
<!-- Violet glass pill: color_primary_dim background, color_primary_bright border -->
<!-- "PRO" text in color_primary_glow, Label.Small -->
<LinearLayout android:background="@drawable/bg_badge_pro_violet">
    <TextView android:text="PRO" style="@style/TextAppearance.AiCareer.Label.Small"
              android:textColor="@color/color_primary_glow"/>
</LinearLayout>
```

> **Removed:** Gold crown badge. PRO badge is now a violet glass pill.

**7. Demand Score Badge** (Career cards)
```xml
<!-- "HIGH DEMAND" / "GROWING" / "STABLE" — pill:
     HIGH: emerald gradient | GROWING: cyan gradient | STABLE: violet gradient
     NO yellow/amber anywhere -->
```

**8. NEW / LIVE Badge** (Pulsing)
```kotlin
fun Badge.animatePulse() {
    ObjectAnimator.ofPropertyValuesHolder(this,
        PropertyValuesHolder.ofFloat("scaleX", 1f, 1.15f, 1f),
        PropertyValuesHolder.ofFloat("scaleY", 1f, 1.15f, 1f),
        PropertyValuesHolder.ofFloat("alpha", 1f, 0.6f, 1f)
    ).apply { duration = 1500; repeatCount = INFINITE }.start()
}
```

---

## 14. Button System

### Button Hierarchy

**Primary CTA — Gradient Violet Pill**
```xml
<com.google.android.material.button.MaterialButton
    android:layout_height="52dp"
    android:paddingHorizontal="24dp"
    android:background="@drawable/bg_button_primary_gradient"
    android:textAppearance="@style/TextAppearance.AiCareer.Title.Medium"
    android:textColor="@color/color_on_primary"
    app:rippleColor="@color/color_ripple_white"
    app:cornerRadius="26dp"
    app:elevation="0dp"/>
<!-- bg_button_primary_gradient: #6D28D9 → #A78BFA, 135° -->
```

**Secondary — Glass Outline**
```xml
<com.google.android.material.button.MaterialButton
    style="@style/Widget.Material3.Button.OutlinedButton"
    android:layout_height="52dp"
    app:strokeColor="@color/color_border_violet"
    app:strokeWidth="1dp"
    android:textColor="@color/color_primary_bright"
    android:background="@drawable/bg_button_glass"
    app:cornerRadius="26dp"/>
<!-- bg_button_glass: color_primary_dim -->
```

**Tertiary — Text only with arrow**
```xml
<com.google.android.material.button.MaterialButton
    style="@style/Widget.Material3.Button.TextButton"
    android:textColor="@color/color_primary_bright"
    app:icon="@drawable/ic_arrow_right"
    app:iconGravity="end"/>
```

**Danger Button**
```xml
<!-- Gradient: #9B1C1C → #F43F5E, same pill shape as primary -->
```

**Icon Button (Circular)**
```xml
<com.google.android.material.button.MaterialButton
    style="@style/Widget.Material3.Button.IconButton"
    android:layout_width="48dp" android:layout_height="48dp"
    app:cornerRadius="24dp"
    android:background="@drawable/bg_icon_button_glass"/>
```

**Button States Matrix**

| State | Transform | Color |
|-------|-----------|-------|
| Default | scale 1.0 | gradient fill |
| Hover | scale 1.02 | slightly brighter violet |
| Pressed | scale 0.96 | `color_primary_muted`, ripple |
| Loading | scale 1.0 | shimmer + circular progress |
| Disabled | scale 1.0 | 30% opacity |

**Button Loading State:**
```kotlin
fun MaterialButton.showLoading(loading: Boolean) {
    isEnabled = !loading
    if (loading) {
        tag = text
        text = ""
        icon = CircularProgressDrawable(context).apply {
            setColorSchemeColors(Color.WHITE)
            start()
        }
    } else {
        text = tag as? CharSequence ?: ""
        icon = null
    }
}
```

---

## 15. Input & Form Components

### TextInputLayout — Outlined Dark Style
```xml
<com.google.android.material.textfield.TextInputLayout
    style="@style/Widget.AiCareer.TextInputLayout"
    android:hint="Email address">
    <com.google.android.material.textfield.TextInputEditText
        android:background="@android:color/transparent"
        android:textColor="@color/color_text_primary"
        android:textColorHint="@color/color_text_tertiary"/>
</com.google.android.material.textfield.TextInputLayout>
```

```xml
<style name="Widget.AiCareer.TextInputLayout"
       parent="Widget.Material3.TextInputLayout.OutlinedBox">
    <item name="boxBackgroundColor">@color/color_surface_2</item>
    <item name="boxStrokeColor">@color/color_border</item>
    <item name="boxStrokeColorStateList">@color/text_input_stroke_color</item>
    <item name="boxCornerRadiusTopStart">14dp</item>
    <item name="boxCornerRadiusTopEnd">14dp</item>
    <item name="boxCornerRadiusBottomStart">14dp</item>
    <item name="boxCornerRadiusBottomEnd">14dp</item>
    <item name="hintTextColor">@color/color_primary_bright</item>
    <item name="errorTextColor">@color/color_rose</item>
    <item name="errorIconDrawable">@drawable/ic_error_circle</item>
    <item name="android:textColorHint">@color/color_text_tertiary</item>
</style>
```

```xml
<!-- text_input_stroke_color.xml -->
<selector>
    <item android:state_focused="true" android:color="@color/color_primary_bright"/>
    <item android:state_hovered="true" android:color="@color/color_border_strong"/>
    <item android:state_enabled="false" android:color="@color/color_border"/>
    <item android:color="@color/color_border"/>
</selector>
```

**OTP Input Design:**
```xml
<!-- 6 individual boxes, 48dp × 56dp each, rounded 12dp -->
<!-- Default: surface_2 bg, border 1dp color_border -->
<!-- Focused: border 2dp color_primary_bright, subtle violet glow shadow -->
<!-- Filled: surface_3 bg, border color_border_violet -->
<!-- Error: border color_rose, shake animation -->
```

**Search Bar:**
```xml
<!-- Full-width, 48dp height, surface_2 bg, rounded 24dp pill -->
<!-- Leading: search icon, color_text_tertiary -->
<!-- Trailing: clear icon (fades in on input), mic icon -->
<!-- Focus: border 1dp color_primary_bright -->
```

**Rating Display (Mentor — replaced star input):**
```xml
<!-- Stars rendered in color_primary_glow (violet) NOT gold -->
<!-- Empty star: color_border outline -->
<!-- Numeric value shown in Mono.Small, color_text_secondary alongside stars -->
```

---

## 16. Card Components

### Card Hierarchy

**Level 0 — Flush Section Card**
```xml
<!-- color_surface_2 bg, no border, 20dp corner radius, full width minus screen margins -->
```

**Level 1 — Content Card** (Career cards, job cards — default)
```xml
<com.google.android.material.card.MaterialCardView
    app:cardCornerRadius="16dp"
    app:cardBackgroundColor="@color/color_surface_2"
    app:strokeColor="@color/color_border"
    app:strokeWidth="1dp"
    app:cardElevation="0dp">
```

**Level 2 — Featured/Highlighted Card** (AI recommendation, top match)
```xml
<!-- color_surface_3 bg, border: color_border_violet 1dp -->
<!-- Left accent strip: 3dp wide, color_primary gradient (full height) -->
```

**Level 3 — Glass Card** (Home fit score, premium info)
```xml
<!-- Background: color_surface_glass (3% white) -->
<!-- Border: color_border_strong -->
<!-- backdrop blur (API 31+ only) -->
<!-- Inner gradient: subtle diagonal from color_primary_dim to transparent -->
```

**Level 4 — Glow Card** (Active AI feature, streaming response)
```xml
<!-- color_surface_2 bg -->
<!-- Border: color_primary_bright 1dp -->
<!-- Shadow: violet glow -->
<!-- Top accent bar: full-width 2dp gradient strip (violet→cyan) -->
```

### Anatomy of a Career Card (full spec)
```
┌─────────────────────────────────────────────┐  ← 16dp corner
│ [BANNER: 72dp, dark violet gradient]        │
│  ┌──────────────────────────────────────┐   │
│  │ [FitScore ring: 48dp, violet arc]    │   │
│  └──────────────────────────────────────┘   │
│  [CATEGORY Chip] [DEMAND Badge]         16dp│
│  Career Title (Title.Large, text_primary)   │
│  Company / Industry (Body.Small, grey)  12dp│
│  ──────────────────────────────────────     │ ← divider 1dp
│  ₹ Salary Range (Mono.Small, text_primary)  │ ← NOT gold, white Mono weight
│  [Skill chip] [Skill chip] +2 more      12dp│
│  [View Details →] (text button, right)  12dp│
└─────────────────────────────────────────────┘
```

### Job Card Anatomy
```
┌─────────────────────────────────────────────┐
│ [Logo 40dp] Company Name   [SAVE ♡ toggle] │
│             Job Title (Title.Medium)         │
│             📍 City  🏠 Remote              │
│ ──────────────────────────────────────────  │
│ [MATCH: 87%] [₹ Range (Mono)] [2d ago]     │
│ [skill] [skill] [+3]   [Apply →] CTA btn   │
└─────────────────────────────────────────────┘
```

---

## 17. Chip System

### Chip Styles

```xml
<!-- Filter chip (Career category, Job type) -->
<style name="Widget.AiCareer.Chip.Filter">
    <item name="chipCornerRadius">100dp</item>
    <item name="chipBackgroundColor">@color/chip_filter_bg</item>
    <item name="chipStrokeColor">@color/chip_filter_stroke</item>
    <item name="chipStrokeWidth">1dp</item>
    <item name="android:textColor">@color/chip_filter_text</item>
    <item name="android:textAppearance">@style/TextAppearance.AiCareer.Label.Medium</item>
    <item name="chipMinHeight">32dp</item>
    <item name="chipStartPadding">12dp</item>
    <item name="chipEndPadding">12dp</item>
</style>
<!-- chip_filter_bg: selected=color_primary_dim_strong, default=transparent -->
<!-- chip_filter_stroke: selected=color_primary_bright, default=color_border_medium -->
<!-- chip_filter_text: selected=color_primary_glow, default=color_text_secondary -->

<!-- Status chip -->
<style name="Widget.AiCareer.Chip.Status">
    <item name="chipCornerRadius">100dp</item>
    <item name="chipMinHeight">24dp</item>
    <item name="chipStartPadding">8dp</item>
    <item name="chipEndPadding">8dp</item>
</style>

<!-- Skill chip -->
<style name="Widget.AiCareer.Chip.Skill">
    <item name="chipCornerRadius">6dp</item>
    <item name="chipBackgroundColor">@color/color_surface_3</item>
    <item name="chipStrokeColor">@color/color_border</item>
    <item name="chipStrokeWidth">1dp</item>
    <item name="android:textColor">@color/color_text_secondary</item>
    <item name="android:textAppearance">@style/TextAppearance.AiCareer.Label.Medium</item>
    <!-- Match: chipBackgroundColor=color_emerald_dim, stroke=color_emerald -->
    <!-- Gap: chipBackgroundColor=color_rose_dim, stroke=color_rose -->
</style>
```

---

## 18. Progress & Gauge Components

### Circular Progress — Fit Score Ring

```kotlin
class CareerFitScoreView(context: Context, attrs: AttributeSet?) : View(context, attrs) {
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 6.dp
        strokeCap = Paint.Cap.ROUND
    }
    private val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 6.dp
        color = Color.parseColor("#FFFFFF10") // track
    }

    // Color by score — monochrome axis, no yellow:
    // 90+: emerald | 70-89: color_primary_bright | 50-69: color_text_secondary | <50: rose
    fun scoreToColor(score: Int): Int = when {
        score >= 90 -> Color.parseColor("#10B981")
        score >= 70 -> Color.parseColor("#8B5CF6")
        score >= 50 -> Color.parseColor("#9D99B8")
        else        -> Color.parseColor("#F43F5E")
    }

    override fun onDraw(canvas: Canvas) {
        val rect = RectF(strokeWidth/2, strokeWidth/2, width - strokeWidth/2, height - strokeWidth/2)
        canvas.drawArc(rect, -90f, 360f, false, trackPaint)
        paint.color = scoreToColor(currentScore)
        canvas.drawArc(rect, -90f, 360f * currentProgress, false, paint)
    }
}
```

### Linear Progress Bar
```xml
<ProgressBar
    android:progressDrawable="@drawable/progress_skill_bar"
    android:layout_height="6dp"
    android:max="100"/>
<!-- progress_skill_bar: violet gradient fill, rounded caps, track color_surface_3 -->
```

### Assessment Timer Bar
```xml
<!-- Full-width, 4dp height, top of quiz screen -->
<!-- Plenty of time: color_primary → color_cyan gradient -->
<!-- Under 30% time: color_violet_warning → color_rose (violet-to-rose, no amber) -->
```

### Roadmap Phase Progress
```xml
<!-- Foundation bar: violet gradient (#6D28D9 → #8B5CF6) -->
<!-- Intermediate bar: slate-to-violet (#2D2A42 → #6D28D9) -->
<!-- Advanced bar: bright violet (#8B5CF6 → #A78BFA) -->
<!-- All bars: 6dp height, rounded, 16dp corner radius — NO gold/amber bars -->
```

### Upload Progress Bar
```xml
<!-- 10dp height, rounded pill, animated striped pattern while uploading -->
<!-- Complete: solid emerald fill + checkmark pop -->
```

---

## 19. Chart & Data Visualization

All charts via **MPAndroidChart**. Custom dark theme applied programmatically.

### Global Chart Theme Setup
```kotlin
fun Chart<*>.applyDarkTheme() {
    setBackgroundColor(Color.TRANSPARENT)
    description.isEnabled = false
    legend.apply {
        textColor = Color.parseColor("#9D99B8") // color_text_secondary
        textSize = 11f
        typeface = Typeface.createFromAsset(context.assets, "fonts/dm_sans_medium.ttf")
    }
    setNoDataTextColor(Color.parseColor("#5C5A78"))
    (this as? LineChart)?.apply {
        xAxis.apply {
            textColor = Color.parseColor("#5C5A78")
            gridColor = Color.parseColor("#FFFFFF08")
            axisLineColor = Color.TRANSPARENT
            position = XAxis.XAxisPosition.BOTTOM
        }
        axisLeft.apply {
            textColor = Color.parseColor("#5C5A78")
            gridColor = Color.parseColor("#FFFFFF08")
            axisLineColor = Color.TRANSPARENT
        }
        axisRight.isEnabled = false
    }
}
```

### Skill Trend LineChart
```kotlin
val dataset = LineDataSet(entries, "Skill Score").apply {
    color = Color.parseColor("#8B5CF6")             // color_primary_bright
    lineWidth = 2f
    setDrawCircles(true)
    circleRadius = 4f
    circleHoleRadius = 2f
    setCircleColor(Color.parseColor("#22D3EE"))     // cyan for data points
    setDrawFilled(true)
    fillDrawable = GradientDrawable(GradientDrawable.Orientation.TOP_BOTTOM,
        intArrayOf(Color.parseColor("#6D28D940"), Color.TRANSPARENT))
    mode = LineDataSet.Mode.CUBIC_BEZIER
}
```

### Career Demand BarChart
```kotlin
// Bars colored on violet–slate axis only:
// high: color_primary_bright | medium: color_surface_4 tinted | low: color_text_tertiary
dataset.apply {
    colors = entries.map { entry ->
        when {
            entry.y >= 80 -> Color.parseColor("#8B5CF6")
            entry.y >= 60 -> Color.parseColor("#6D28D9")
            else          -> Color.parseColor("#2D2A42")
        }
    }
}
```

### Assessment RadarChart
```kotlin
radarDataSet.apply {
    color = Color.parseColor("#A78BFA")
    fillColor = Color.parseColor("#6D28D940")
    setDrawFilled(true)
    lineWidth = 2f
}
radarChart.webColor = Color.parseColor("#FFFFFF10")
radarChart.webColorInner = Color.parseColor("#FFFFFF08")
```

### Home Donut Chart (Career fit)
```kotlin
pieChart.apply {
    isDrawHoleEnabled = true
    holeRadius = 72f
    transparentCircleRadius = 74f
    holeColor = Color.TRANSPARENT
    setDrawCenterText(true)
    centerText = "$fitScore%\nFit Score"
    setCenterTextTypeface(monoTypeFace)
    setCenterTextColor(Color.parseColor("#EEEAF8"))  // color_text_primary
    setCenterTextSize(18f)
}
```

---

## 20. Shimmer & Loading States

### Shimmer Configuration
```kotlin
ShimmerFrameLayout.builder()
    .setBaseColor(ContextCompat.getColor(ctx, R.color.color_surface_2))
    .setHighlightColor(ContextCompat.getColor(ctx, R.color.color_surface_3))
    .setBaseAlpha(1f)
    .setHighlightAlpha(1f)
    .setWidthRatio(1.5f)
    .setAngle(15)
    .setDirection(Shimmer.Direction.LEFT_TO_RIGHT)
    .setDuration(1200)
    .build()
```

### Progressive Disclosure
- Never show blank screen — shimmer immediately
- After API response: crossfade shimmer out, content in (300ms)
- If cache hit: show cached content instantly, refresh silently

---

## 21. Empty States & Illustrations

### Empty State Anatomy
```
[Illustration SVG — 160dp × 160dp, violet/cyan only]
        ↓ 24dp
[Headline — Headline.Medium, center, color_text_primary]
        ↓ 8dp
[Description — Body.Medium, center, color_text_secondary, max 2 lines]
        ↓ 24dp
[CTA Button — primary gradient, 200dp wide]
```

### Empty State Designs Per Screen

| Screen | Illustration | Headline | CTA |
|--------|-------------|----------|-----|
| Career (no results) | Space telescope SVG, cyan accents | "No careers match your search" | Clear Filters |
| Jobs (no matches) | Rocket launch SVG, violet | "Your perfect job is loading…" | Update Skills |
| Chat (first open) | AI orb SVG, pulsing | "Ask me anything about your career" | — (suggested chips) |
| Roadmap (no roadmap) | Map/compass SVG, violet | "Your roadmap hasn't been created yet" | Generate Roadmap |
| Notifications (empty) | Bell with stars SVG, slate | "You're all caught up!" | — |
| Saved Jobs (empty) | Bookmark SVG, slate | "No saved jobs yet" | Browse Jobs |

---

## 22. Toast, Snackbar & Alerts

### Snackbar Design
```kotlin
Snackbar.make(view, message, Snackbar.LENGTH_LONG).apply {
    view.setBackgroundResource(R.drawable.bg_snackbar)
    view.findViewById<TextView>(com.google.android.material.R.id.snackbar_text).apply {
        textAppearance = R.style.TextAppearance_AiCareer_Body_Medium
        setTextColor(ContextCompat.getColor(ctx, R.color.color_text_primary))
    }
    setActionTextColor(ContextCompat.getColor(ctx, R.color.color_primary_bright))
    animationMode = Snackbar.ANIMATION_MODE_SLIDE
}.show()
```

**Snackbar Types:**

| Type | Icon | Strip Color |
|------|------|------------|
| Success | ✓ circle | `color_emerald` |
| Error | ✗ circle | `color_rose` |
| Info | ℹ circle | `color_cyan` |
| Warning | ⚠ triangle | `color_violet_warning` (NOT amber) |

---

## 23. Dialog & Bottom Sheet

### Dialog Design
```xml
<style name="Widget.AiCareer.Dialog" parent="ThemeOverlay.Material3.MaterialAlertDialog">
    <item name="android:backgroundDimAmount">0.7</item>
    <item name="shapeAppearance">@style/ShapeAppearance.AiCareer.Dialog</item>
    <item name="colorSurface">@color/color_surface_3</item>
    <item name="android:colorBackground">@color/color_surface_3</item>
</style>
<style name="ShapeAppearance.AiCareer.Dialog">
    <item name="cornerFamily">rounded</item>
    <item name="cornerSize">24dp</item>
</style>
```

**Dialog Anatomy:**
- Background: `color_surface_3` (#1E1B2E deep slate)
- Top border: `color_border_violet` 1dp
- Title: `Headline.Medium`, `color_text_primary`
- Body: `Body.Medium`, `color_text_secondary`
- Buttons: right-aligned, secondary + primary gradient pair
- Scrim: 70% black with blur (API 31+)

### Bottom Sheet
```xml
<style name="Widget.AiCareer.BottomSheet" parent="Widget.Material3.BottomSheet">
    <item name="backgroundTint">@color/color_surface_3</item>
    <item name="shapeAppearance">@style/ShapeAppearance.AiCareer.BottomSheet</item>
    <item name="android:elevation">24dp</item>
</style>
<style name="ShapeAppearance.AiCareer.BottomSheet">
    <item name="cornerFamily">rounded</item>
    <item name="cornerSizeTopLeft">28dp</item>
    <item name="cornerSizeTopRight">28dp</item>
    <item name="cornerSizeBottomLeft">0dp</item>
    <item name="cornerSizeBottomRight">0dp</item>
</style>
```

**Drag Handle:**
```xml
<View android:layout_width="36dp" android:layout_height="4dp"
      android:layout_gravity="center_horizontal"
      android:layout_marginTop="12dp" android:layout_marginBottom="8dp"
      android:background="@drawable/bg_drag_handle"/>
<!-- bg_drag_handle: rounded pill, color_border_strong -->
```

**Filter Bottom Sheet (Jobs/Career):**
- RangeSlider: `color_primary_bright` track, `color_surface_4` thumb with white dot
- Section headers: `Label.Small`, `color_text_tertiary`
- Reset + Apply buttons: full-width, stacked

---

## 24. Screen-by-Screen Design Spec

### 24.1 Splash Screen

**Layout:** Full `color_background` (#060608). Center: app logo (animated Lottie, 160dp — orbiting particles in violet/cyan only). Below: "NAVIGATOR" wordmark in `Label.Small`, `letterSpacing=0.20`. Bottom: "AI Career Intelligence" in `Body.Small`, `color_text_tertiary`.

**Animation sequence (1800ms total):**
1. 0ms: Background fades from black → `color_background`
2. 200ms: Logo Lottie plays (800ms — particles spiral inward, violet/cyan)
3. 1000ms: Wordmark slides up from `translationY=20dp` + fade in
4. 1200ms: Subtitle fades in
5. 1600ms: Whole view scales 1.0 → 1.08 + fade out (200ms), navigate

---

### 24.2 Onboarding (ViewPager2)

**4 slides**, full-screen, `color_background`. `ZoomOutPageTransformer` (0.85 → 1.0).

**Slide themes (violet/cyan palette only, no warm tones):**
1. Deep violet: "AI-Powered Career Guidance"
2. Cyan: "Real-Time Job Matching"
3. Violet-to-slate: "Personalized Roadmaps"
4. Violet/cyan: "Let's Build Your Future"

**Dot indicators:** 8dp, active=`color_primary`, inactive=`color_border_medium`.

---

### 24.3 Login & Register

**Layout:** `color_background`. Radial gradient glow top-left: `color_primary` at 12% opacity.

**Login:**
- App logo 48dp, top center, 80dp margin-top
- "Welcome back" — `Display.Medium`
- Email + Password `TextInputLayout` (outlined dark style)
- "Forgot Password?" — `color_text_violet`, right-aligned
- Primary CTA: "Sign In" gradient pill button
- Divider: "— or continue with —" (`color_text_tertiary`)
- Google OAuth: outlined glass button
- "Don't have an account? **Register**" — register in `color_primary_bright`

**Register:**
- 2-step with dot indicators at top
- Fields: staggered 60ms entrance animation

---

### 24.4 OTP Screen

**6 OTP boxes:** 44dp × 52dp, `card_corner_radius_medium`. Filled box: `color_surface_3` bg, `color_primary_bright` border, digit in `Mono.Large`.

**Countdown timer:** `color_rose` text when < 60s.

**Animations:**
- Correct OTP: boxes flash violet sequentially (50ms stagger) + haptic
- Wrong OTP: boxes shake + turn rose

---

### 24.5 Home / Dashboard

**Toolbar Type A** (transparent by default, fades to solid `@color/color_surface_1` and reveals "Dashboard" title when scrolled).

```
┌────────────────────────────────────────────────────────┐
│  [avatar] Welcome Back, Eswar                   [🔔]   │ ← GREETING HEADER
├────────────────────────────────────────────────────────┤
│  AI CAREER FIT COMPATIBILITY                           │
│  ┌──────────┐  [trends icon]                           │
│  │ ( 95% )  │  Data Analyst                            │ ← HERO CARD (Level 3 Glass)
│  │  donut   │  Highly compatible fit.                  │   with bg_fit_card_gradient
│  └──────────┘  95% INDEX SCORE                         │
├────────────────────────────────────────────────────────┤
│  TOP CAREER MATCHES                         View All › │
│  [Card1] [Card2] [Card3 peeking...]                    │ ← H-SCROLL Rec Cards
│  ● ○ ○ (Dots Indicator)                                │
├────────────────────────────────────────────────────────┤
│  ACTIVE LEARNING ROADMAP                               │
│  Become a Data Analyst in 3M      [Mountain Graphic]   │ ← ROADMAP CARD (Level 1)
│  ██░░░░░░░░ 10%                                        │
│  [icon] Open Roadmap Planner [chevron] (Purple button) │
├────────────────────────────────────────────────────────┤
│  NAVIGATION & QUICK ACCESS                             │
│  [Explore Careers]   [AI Navigator]                    │ ← 2x2 NEON BORDER GRID
│  [Assessments]       [Jobs Portal]                     │
├────────────────────────────────────────────────────────┘
```

**Quick Action Grid Layout:**
- Cards are styled with neon tinted outlines matching feature colors (Explore=`color_cyan`, Navigator=`color_emerald`, Assessments=`color_rose`, Jobs=`color_primary_bright`).
- Enclosed with custom card icons (22dp) inside HSL-tailored tinted container backgrounds (`color_primary_dim` style).
- Text labels in `Title.Small` with `@color/color_text_primary`.

---

### 24.6 Career List & Detail

**Career List:**
- Toolbar Type A, sticky search bar on scroll
- ChipGroup HScroll: All, Tech, Finance, Design, Marketing, Healthcare…
- RecyclerView: Career cards (Level 1), 12dp gap
- FAB: "✨ AI Recommend" — violet gradient, hides on scroll down
- Filter BottomSheet trigger: toolbar icon button

**Career Detail:**
- `CollapsingToolbarLayout`: violet-to-black gradient overlay on banner
- Sections: Salary chart (BarChart 140dp), Skills grid (match/gap chips), Growth LineChart (200dp)
- Shared element transition: title text + card bounds morph

---

### 24.7 RAG AI Chat

**Full-screen, static toolbar** with cyan pulse dot.

**Message bubbles:**

*User bubble (right):*
- `color_primary_dim` background, 18dp corner radius, bottom-right 4dp, white text

*AI bubble (left):*
- `color_surface_2` background, `color_border_violet` border 1dp
- 18dp corner radius, bottom-left 4dp
- 28dp AI avatar: violet circle with ✦ symbol
- Streaming: cursor blink `|`, 500ms
- Citations: `color_cyan` text, Book icon

**Streaming animation:** Character-by-character fade-in, 30ms per char.

**AI thinking state:** 3 dots pulsing in `color_cyan` sequence.

**Input bar:**
- `color_surface_2` background, `color_border` top border
- Rounded 24dp TextInput (multiline, 1–4 lines)
- Send button: circular 40dp, `color_primary` when text present

---

### 24.8 Assessment & Quiz

**Quiz Screen:**
- Full screen, `color_background`, no bottom nav
- Top: `LinearProgressIndicator` full-width, 4dp, violet→cyan gradient
- Countdown: `Mono.Large`, transitions `color_primary_bright` → `color_text_secondary` → `color_rose` at 50% and 25% (no amber)
- 4 answer options: pill shape, `color_surface_2`, 14dp corner
  - Selected: `color_primary_dim` bg, `color_primary_bright` border
  - Correct: `color_emerald_dim` bg, `color_emerald` border
  - Wrong: `color_rose_dim` bg, `color_rose` border

**Result Screen:**
- Score gauge: 160dp, 1200ms animation, violet arc
- Score value: `Mono.Large`, 48sp
- Grade badge: colored pill (A=emerald, B=primary_bright, C=text_secondary, F=rose)
- Lottie confetti on pass (75%+)

---

### 24.9 Roadmap

**Phase accordion:**
```
[FOUNDATION]  ████████░░ 80%  [▼]  ← surface_2, violet left border
  Week 1: HTML/CSS Basics     [✓ Done]    ← emerald check
  Week 2: JavaScript          [→ Current] ← violet glow border
  Week 3: React Basics        [🔒 Locked] ← 60% opacity, slate

[INTERMEDIATE] ░░░░░░░░░░  0%  [▶ collapsed]  ← slate–violet gradient bar
[ADVANCED]     ░░░░░░░░░░  0%  [▶ collapsed]  ← bright violet bar
```

**Milestone states:**
- Done: `color_emerald` check, `color_surface_2` bg
- Current: `color_primary_bright` border glow, elevated
- Locked: `color_text_tertiary`, lock icon, 60% opacity

---

### 24.10 Jobs Hub

**TabLayout:**
- Active: `color_primary_bright` text, 2dp `color_primary` underline indicator
- Inactive: `color_text_tertiary`

**Filter BottomSheet — RangeSlider:**
- Track: `color_primary_bright`
- Thumb: `color_surface_4` with white dot
- Labels: `Mono.Small`, `color_text_secondary`

---

### 24.11 Resume Upload & Preview

**Resume Preview parsed tab:**
- ATS score gauge: 80dp donut, violet arc
- Improvement cards: priority border (rose/`color_violet_warning`/emerald) — NO amber
- Skill chips: match/gap states (emerald/rose)

---

### 24.12 Profile & Settings

**Profile:**
- Banner: violet gradient or user-chosen background
- Avatar: 96dp, circular, camera edit overlay
- Name: `Display.Medium`
- Info chips: Education • City • PRO/FREE (PRO uses violet glass chip)

**Settings:**
- Toggles: `MaterialSwitch`, `color_primary_bright` thumbTint, `color_primary_dim` trackTint
- Danger zone: `color_rose` text
- Logout: full-width outlined `color_rose` button

---

### 24.13 Mentor Discovery

**Mentor card (list mode):**
```
[Avatar 64dp] Name (Title.Large)
              Designation (Body.Small, color_text_secondary)
              ★★★★½ 4.8  (128 sessions)  ← stars in color_primary_glow (violet)
              ₹ 499/hr (Mono.Small, color_text_primary) ← NOT gold, plain Mono weight
              [Book Session →] right-aligned
```

**Booking calendar:**
- Slot states: `color_surface_3` default, `color_primary_dim` hover, `color_primary` selected, `color_text_tertiary` unavailable

---

### 24.14 Analytics

**Charts — monochrome axis:**
- Career Fit Trend LineChart: violet line, violet-to-transparent gradient fill
- Score BarChart: violet bars, darker slate for lower values
- Date range chips: selected=violet filled, default=outlined

---

### 24.15 Notifications

**Section headers:** Sticky — "TODAY", "YESTERDAY", "EARLIER" in `Label.Small`, `color_text_tertiary`.

**Notification item:**
```
[Category icon 40dp, violet tinted bg] Title (Title.Medium, bold if unread)
                                       Message preview (Body.Small, 1 line)
                                       [time ago] right-aligned
```
- Unread: `color_surface_2` bg, left border 2dp `color_primary`
- Read: `color_surface_1` bg
- Swipe left: rose delete reveal
- Swipe right: emerald mark-read reveal

---

## 25. Custom View Design Specs

### CareerFitScoreView
- Sizes: 48dp / 72dp / 120dp
- Score color axis (monochrome — no yellow):
  - 90+: `#10B981` emerald
  - 70–89: `#8B5CF6` violet
  - 50–69: `#9D99B8` muted violet-grey
  - <50: `#F43F5E` rose
- Center text: `Mono.Medium`, `color_text_primary`
- Animation: `ValueAnimator` 0→score, 1000ms, `DecelerateInterpolator`

### SkillProgressBar
- Height: 6dp, track: `color_surface_3`, rounded pill
- Fill colors (violet axis):
  - Beginner: `color_rose` → `color_primary_muted`
  - Intermediate: `color_primary` → `color_primary_bright`
  - Advanced: `color_primary_bright` → `color_primary_glow`

### OtpInputView
- 6 boxes, 48dp × 56dp, `color_surface_2` bg, 12dp corner
- Active: violet glow shadow, `color_primary_bright` border 2dp

### StreamingTextView
- Character-by-character fade-in, 30ms per char
- Blinking `|` cursor during stream, `color_cyan`
- Border on AI card: `color_border_violet` → `color_border` on stream end (300ms)

---

## 26. Dark / Light Mode Toggle Strategy

### System-Aware (Default)
```kotlin
AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_FOLLOW_SYSTEM)
```

### User Toggle
```kotlin
fun applyTheme(isDark: Boolean) {
    val mode = if (isDark) AppCompatDelegate.MODE_NIGHT_YES else AppCompatDelegate.MODE_NIGHT_NO
    AppCompatDelegate.setDefaultNightMode(mode)
}
```

### Animated Theme Switch
```kotlin
fun Activity.switchThemeWithAnimation(isDark: Boolean) {
    val bitmap = window.decorView.drawToBitmap()
    val overlay = ImageView(this).apply { setImageBitmap(bitmap) }
    (window.decorView as ViewGroup).addView(overlay)
    AppCompatDelegate.setDefaultNightMode(if (isDark) MODE_NIGHT_YES else MODE_NIGHT_NO)
    val anim = ViewAnimationUtils.createCircularReveal(overlay, toggleX, toggleY,
        overlay.width.toFloat(), 0f)
    anim.duration = 400
    anim.doOnEnd { (window.decorView as ViewGroup).removeView(overlay) }
    anim.start()
}
```

---

## 27. Accessibility Standards

| Standard | Implementation |
|----------|---------------|
| **Color contrast** | All text: minimum 4.5:1 ratio (WCAG AA). Primary text on dark bg: 12:1. |
| **Touch targets** | Minimum 48dp × 48dp for all interactive elements |
| **Content descriptions** | All icon-only views have `contentDescription` |
| **Text scaling** | All sizes in `sp`. Tested at 200% font scale. |
| **Reduced motion** | Check `ANIMATOR_DURATION_SCALE`. If 0 → skip all transitions |
| **Color-blind** | Never convey meaning by color alone. Always pair with icon or text. |
| **Keyboard nav** | All form fields: `nextFocusDown` chain. OTP hardware keyboard support. |

---

## 28. Gradle & Resource Setup

### build.gradle (app)
```groovy
android {
    buildFeatures { viewBinding true; buildConfig true }
    defaultConfig { vectorDrawables.useSupportLibrary = true }
}

dependencies {
    implementation "androidx.core:core-ktx:1.13.1"
    implementation "com.airbnb.android:lottie:6.4.0"
    implementation "com.facebook.shimmer:shimmer:0.5.0"
    implementation "com.github.PhilJay:MPAndroidChart:v3.1.0"
    implementation "com.github.bumptech.glide:glide:4.16.0"
    kapt "com.github.bumptech.glide:compiler:4.16.0"
    implementation "com.github.barteksc:android-pdf-viewer:3.2.0-beta.1"
    implementation "io.noties.markwon:markwon:4.6.2"
    implementation "io.noties.markwon:ext-strikethrough:4.6.2"
}
```

### res/drawable/ Key Drawables
```
bg_button_primary_gradient.xml    → GradientDrawable #6D28D9 → #A78BFA, 135°
bg_button_glass.xml               → ColorDrawable #6D28D926
bg_icon_button_glass.xml          → Shape, color_surface_glass, border color_border
bg_badge_dot_rose.xml             → OvalShape, color_rose
bg_badge_dot_cyan.xml             → OvalShape, color_cyan (pulsing via animation)
bg_badge_pill_rose.xml            → RoundRect, color_rose
bg_badge_pro_violet.xml           → RoundRect, color_primary_dim, stroke color_primary_bright
bg_drag_handle.xml                → RoundRect 2dp height, color_border_strong
bg_snackbar.xml                   → RoundRect 12dp, color_surface_3, stroke color_border
progress_skill_bar.xml            → LayerList: track + violet gradient progress
bg_career_banner_gradient.xml     → GradientDrawable, dark violet category gradient
ic_arrow_left.xml                 → VectorDrawable, custom back arrow
ic_verified_shield.xml            → VectorDrawable, shield + check, color_emerald
bg_message_user.xml               → RoundRect, color_primary_dim, asymmetric corners
bg_message_ai.xml                 → RoundRect, color_surface_2, stroke color_border_violet
selector_radio_option.xml         → StateList for quiz options (violet/emerald/rose states)
```

---

## 29. Design Tokens — XML Implementation

### styles.xml
```xml
<style name="Theme.AiCareer" parent="Theme.Material3.DayNight">
    <!-- Primary -->
    <item name="colorPrimary">@color/color_primary</item>
    <item name="colorPrimaryVariant">@color/color_primary_bright</item>
    <item name="colorOnPrimary">@color/color_on_primary</item>
    <item name="colorPrimaryContainer">@color/color_primary_container</item>
    <!-- Secondary — Cyan for AI only -->
    <item name="colorSecondary">@color/color_cyan</item>
    <item name="colorOnSecondary">@color/color_on_primary</item>
    <!-- Surface — four distinct dark slates -->
    <item name="colorSurface">@color/color_surface_2</item>
    <item name="colorOnSurface">@color/color_text_primary</item>
    <item name="colorBackground">@color/color_background</item>
    <item name="colorOnBackground">@color/color_text_primary</item>
    <!-- Error -->
    <item name="colorError">@color/color_rose</item>
    <item name="colorOnError">@color/color_on_primary</item>
    <!-- Typography -->
    <item name="fontFamily">@font/dm_sans</item>
    <!-- Shape -->
    <item name="shapeAppearanceSmallComponent">@style/ShapeAppearance.AiCareer.Small</item>
    <item name="shapeAppearanceMediumComponent">@style/ShapeAppearance.AiCareer.Medium</item>
    <item name="shapeAppearanceLargeComponent">@style/ShapeAppearance.AiCareer.Large</item>
    <!-- System bars -->
    <item name="android:windowBackground">@color/color_background</item>
    <item name="android:statusBarColor">@android:color/transparent</item>
    <item name="android:navigationBarColor">@color/color_surface_1</item>
    <item name="android:windowLightStatusBar">false</item>
    <item name="android:windowLightNavigationBar">false</item>
    <item name="windowActionBar">false</item>
    <item name="windowNoTitle">true</item>
    <!-- Ripple -->
    <item name="android:colorControlHighlight">@color/color_ripple_primary</item>
    <!-- Motion -->
    <item name="motionDurationShort1">150</item>
    <item name="motionDurationMedium1">280</item>
    <item name="motionDurationLong1">450</item>
</style>

<!-- Shape Appearances -->
<style name="ShapeAppearance.AiCareer.Small">
    <item name="cornerFamily">rounded</item>
    <item name="cornerSize">10dp</item>
</style>
<style name="ShapeAppearance.AiCareer.Medium">
    <item name="cornerFamily">rounded</item>
    <item name="cornerSize">16dp</item>
</style>
<style name="ShapeAppearance.AiCareer.Large">
    <item name="cornerFamily">rounded</item>
    <item name="cornerSize">24dp</item>
</style>
<style name="ShapeAppearance.Circle">
    <item name="cornerFamily">rounded</item>
    <item name="cornerSize">50%</item>
</style>
```

---

## Quick Reference: Color Replacements from v1 → v2 (Monochrome Migration)

| Old (v1 — yellow/gold) | New (v2 — monochrome) | Usage |
|------------------------|----------------------|-------|
| `#F59E0B` color_gold | `color_text_primary` + Mono font | Salary figures |
| `#F59E0B` star rating | `color_primary_glow` (#A78BFA) | Rating stars |
| `#F59E0B` gold badge | `color_primary_dim` glass pill | PRO/Premium badge |
| `#F59E0B` roadmap bar | `color_primary_bright` gradient | Intermediate phase bar |
| `#D97706` premium dark | `color_primary_muted` (#4C1D95) | Pressed premium state |
| `color_amber` warning | `color_violet_warning` (#7C3AED) | Warning snackbar strip |
| `#F59E0B` timer mid | `color_text_secondary` (#9D99B8) | Timer mid-state text |
| Gold chart bars | `color_primary` violet bars | BarChart data |

---

## Appendix: Design Checklist Before Each Screen Delivery

- [ ] All text uses defined type style (no raw size/font attributes)
- [ ] All colors reference `@color/` tokens — **zero hardcoded hex in XML**
- [ ] **No yellow, amber, or gold hex values anywhere** (`#F59E0B`, `#D97706`, `#FCD34D` are banned)
- [ ] Salary and rating displays use `Mono` font weight on `color_text_primary` — NOT colored text
- [ ] PRO badge uses violet glass pill — NOT gold badge
- [ ] Warning states use `color_violet_warning` — NOT `color_amber`
- [ ] Roadmap phase bars use violet gradient variants — NOT gold bar
- [ ] Rating stars use `color_primary_glow` — NOT star icon tinted gold
- [ ] Every interactive element ≥ 48dp touch target
- [ ] Shimmer placeholder matches content layout exactly
- [ ] Empty, error, and loading states all designed
- [ ] Dark theme tested on physical device
- [ ] Scroll behaviors implemented (edge glow, sticky headers, toolbar transition)
- [ ] Animations respect `ANIMATOR_DURATION_SCALE = 0` reduced-motion setting
- [ ] `contentDescription` set on all icon-only views
- [ ] Lottie animations tinted to violet/cyan palette only
- [ ] Shared element transitions wired between list → detail
- [ ] Bottom nav hides/shows on scroll (where applicable)
- [ ] ProGuard rules verified for all third-party libs

---

*Design System v2.0 — AI Smart Career Navigator Android*
*Dark-First · Violet Dominant · Monochrome Production Grade*
*Authored as Senior Frontend Design Authority Document · 2025*