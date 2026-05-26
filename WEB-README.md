# Experience 2026 — Version Web (desktop / mobile)

Worktree git de la branche `web-responsive`, dédié à l'adaptation desktop
et mobile (mode paysage). La version kiosque 4K reste sur la branche
`feat-portage-sur-ecran-classique` dans le repo principal.

## Démarrage

```bash
cd D:/Documents/GitHub/experience-2026-web
pnpm dev   # ou : node node_modules/vite/bin/vite.js
```

Le serveur démarre sur **http://localhost:5180/** (port différent du
kiosque pour pouvoir faire tourner les deux en parallèle).

## Différences avec la version kiosque

### Design tokens (`src/styles/_variables.scss`)
- Toutes les valeurs `$spacing-*` ont été divisées par ~3 pour s'adapter
  à un viewport desktop (~1280 px) au lieu du kiosque (3840 px).
- Les noms `$spacing-32`, `$spacing-96`, etc. sont conservés pour ne
  pas avoir à refactorer chaque composant, même si la valeur ne
  correspond plus au nom.
- Ajout de breakpoints responsives : `$bp-mobile`, `$bp-tablet`,
  `$bp-desktop`, `$bp-large`.

### Typographie (`src/styles/_typography.scss`)
- Utilisation de `clamp(min, fluid, max)` pour un dimensionnement fluide
  entre mobile et desktop.

### Boutons (`src/components/buttons/Button.vue`)
- Padding et font-size scalés pour le web.
- Bordures 2px (au lieu de 4px kiosque).
- Icônes SVG 18×18 (au lieu de 90×90 kiosque).

### Home (`src/components/HomeOverlay.vue`)
- Images décoratives positionnées en `vw`/`vh` pour rester
  proportionnelles à n'importe quel écran.
- Carte d'intro : `width: min(640px, 92vw)`.

### Mode portrait
- Composant `RotateDevice.vue` ajouté, affiché via media query
  `@media (orientation: portrait)`. Il téléporte vers `<body>` pour
  s'afficher en taille réelle sans être affecté par d'éventuels scales.

### Comportement général
- `main.js` : redirige vers `/` au rechargement de la page pour éviter
  les animations qui démarrent à mi-parcours.
- `Infos.vue` : `<SmartNavbar>` retiré (était dupliqué — `Map.vue` le
  rend déjà).
- `ArtworkDetails.vue` : pop-up zoom n'est plus dans un `<Teleport>`
  pour qu'elle reste dans le contexte scalé du parent.

## Ce qui reste à faire

C'est un premier passage : l'app rend correctement à l'écran desktop
classique (~1280-1920 px), mais il reste à :

- Affiner les composants un par un avec des media queries spécifiques
  pour le mobile paysage (~568-900 px de large).
- Adapter la carte 3D (WebGL) : actuellement la caméra est positionnée
  pour le kiosque, à revérifier sur écran plus petit.
- Vérifier les overlays plein écran (CreditsOverlay, ArtworkList,
  ViewAllArtworks, ClickImg).
- Tester sur de vrais appareils mobiles.

## Architecture worktree

```
D:/Documents/GitHub/experience-2026          → branche feat-portage-sur-ecran-classique (kiosque)
D:/Documents/GitHub/experience-2026-web      → branche web-responsive (web, ce dossier)
```

Les deux partagent le même `.git`. Les commits dans un worktree ne
s'appliquent qu'à sa branche.
