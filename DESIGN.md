# Recoup Chat — Sky

Chat adopts the Recoup Sky identity approved September 10, 2026. The originating
reference and assets are in Mono's `marketing/brand-studio/DESIGN.md` and
`marketing/public/`. This is Chat's implementation reference; the older Mono
design guide's achromatic/Geist description no longer describes this app.

## Identity

- Name: **Recoup**. Keep existing service URLs and API identifiers.
- Use the original symbol in `components/Logo/LogoIcon.tsx`; do not redraw it.
- DM Sans for interface text and headings; IBM Plex Mono for code and short
  labels. Font files and their licenses are self-hosted in `app/fonts/`.
- Keep headings light (450–500), with close tracking. Ordinary working text
  stays readable; chat input uses 16px on mobile as well as desktop.

## Color and surfaces

`app/globals.css` is the source of truth for both light and `.dark` tokens.

- White working surfaces and navigation, dark green text/actions.
- Blue introduces the empty workspace; keep message reading surfaces clean.
- Lime marks primary chat actions. Use `brand-on-lime` for text on lime.
- Use `brand-link` for inline links and `ring` for focus, not lime on white.
- Preserve semantic success, warning, and error colors and text labels.
- The main panel sits flush beside the sidebar, without an outer inset,
  rounded frame, or shadow. Individual cards retain rounded corners and subtle
  shadow outlines.
- Honor the existing system/light/dark preference. Dark mode uses green
  surfaces with light text and a quieter blue-to-green welcome panel.

- Desktop navigation uses a full-width top bar: small Recoup symbol, workspace,
  then artist. A 56px icon rail sits below it and expands over the content on
  hover or keyboard focus. Mobile keeps its tap-operated navigation.

## Behavior

This visual refresh retains the existing authentication, onboarding,
artist selection, catalog valuation, task modules, and message send paths.
Measured catalog values still take precedence over the generic welcome panel.
Use the shared components and tokens when extending the app. Keep the mobile
drawer usable and chat input reachable on short screens. Avoid entrance motion
on the composer; respect reduced motion for optional transitions.

## Assets

- Welcome background: approved `marketing/public/images/sky/hero-sky.webp`.
- Sign-in lockup: `marketing/public/brand/recoup-wordmark-black.svg`.
- App icons: `marketing/public/icons/` exports, copied to `public/brand/` and
  `app/favicon.ico`. The web manifest uses Recoup and the Sky colors.
- Fonts: the same Fontsource DM Sans and IBM Plex Mono files used by Marketing,
  with their original OFL licenses alongside the copied files.
