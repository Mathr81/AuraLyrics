# Spicy Lyrics — Spécification Visuelle Complète

> Référence pixel-perfect pour recréer l'extension dans l'app mobile AuraLyrics.
> Toutes les valeurs sont extraites directement du code source de l'extension.

---

## 1. Design Tokens — Couleurs

### Texte
```
Primaire   : hsla(0, 0%, 100%, 0.92)
Secondaire : hsla(0, 0%, 100%, 0.60)
Tertiaire  : hsla(0, 0%, 100%, 0.35)
Quaternaire: hsla(0, 0%, 100%, 0.18)   ← très faible, fond de jauge
Sur accent : #000
```

### Surfaces / overlays
```
Elevated  : rgba(28, 28, 32, 0.88)
Overlay   : rgba(0, 0, 0, 0.35)
Accent bg : rgba(255, 255, 255, 0.06)
Accent bg hover: rgba(255, 255, 255, 0.14)
Hairline  : rgba(255, 255, 255, 0.08)
Hairline strong: rgba(255, 255, 255, 0.14)
```

### Matériaux glass (Apple Liquid Glass)
```
ultraThin : background rgba(0,0,0,0.06)
            filter: blur(8px) saturate(1.5) brightness(1.04)

regular   : background rgba(0,0,0,0.10)
            filter: blur(12px) saturate(1.6) brightness(1.05)

thick     : background rgba(0,0,0,0.12)
            filter: blur(16px) saturate(1.7) brightness(1.06)
```

### Bords Liquid Glass (biseaux lumineux)
```
--liquid-edge:
  inset 0  1px 0 rgba(255,255,255, 0.38),   ← bord haut brillant
  inset 0  0  0 1px rgba(255,255,255, 0.12), ← contour
  inset 0 -1px 0 rgba(255,255,255, 0.20)    ← bord bas demi-brillant

--liquid-edge-strong:
  inset 0  1px 0 rgba(255,255,255, 0.55),
  inset 0  0  0 1px rgba(255,255,255, 0.18),
  inset 0 -1px 0 rgba(255,255,255, 0.30)
```

### Ombres portées
```
--liquid-cast:
  0 16px 40px -8px rgba(8,10,18, 0.55),
  0  4px 12px -2px rgba(8,10,18, 0.35)

--liquid-cast-soft:
  0 10px 24px -6px rgba(8,10,18, 0.42),
  0  2px  6px -1px rgba(8,10,18, 0.28)

--shadow-overlay:
  0 14px 36px -6px rgba(8,10,18, 0.55),
  0 0 0 1px rgba(255,255,255,0.08)

--shadow-modal:
  0 40px 88px -10px rgba(8,10,18, 0.70),
  0 12px 24px  -4px rgba(8,10,18, 0.40),
  0  0    0    1px rgba(255,255,255,0.08)
```

### Glow du texte de paroles
```
Repos (normal)   : rgba(255,255,255, 0.15) 0 0  6px   → --TextGlowDef
Actif (ligne)    : rgba(255,255,255, 0.40) 0 0 14px   → --ActiveTextGlowDef
Fort             : rgba(255,255,255, 0.68) 0 0 16.4px → --StrongTextGlowDef
Très fort        : rgba(255,255,255, 0.74) 0 0 16px   → --StrongerTextGlowDef
```

---

## 2. Typographie

- **Police** : SF Pro Display (iOS/macOS), puis System UI, puis sans-serif
- **Rendu** : `-webkit-text-fill-color: transparent` + `background-clip: text` → le dégradé passe à travers le texte

### Tailles de police paroles

| Mode | Valeur CSS |
|------|-----------|
| Fullscreen synced | `clamp(1.85rem, 7cqw, 3.5rem)` |
| Fullscreen static | `clamp(1.4rem, 6cqw, 3rem)` (approximé) |
| Sidebar synced | `clamp(2.1rem, 7cqw, 3.5rem)` |
| PiP synced | `clamp(1.7rem, 5.5cqw, 2.6rem)` |
| PiP static | `clamp(1.4rem, 6cqw, 2.3rem)` |

> Sur mobile (React Native) : `clamp(30, W*0.072, 56)` en px pour fullscreen synced ; `clamp(16, W*0.052, 40)` pour static.

### Hauteur de ligne paroles
```
line-height: 1.1818181818   (≈ 13/11)
```

### Graisse des paroles
```
font-weight: 700  (toujours bold)
```

### Espacement entre mots/syllabes
```
margin-right: 0.32ch   (unité basée sur la largeur du caractère "0")
```

### Tailles méta-données (titre / artiste)
```
Titre (fullscreen) : font-size * 2.25, font-weight: 900
Artiste (fullscreen): font-size * 1.5,  font-weight: 400
Titre (compact)    : 2.5rem,  line-height: 3rem
Artiste (compact)  : 1.5rem,  line-height: 2rem
Opacité titre      : 0.95
Opacité artiste    : 0.70
```

---

## 3. Espacement & Grille

```
grid : 4px

--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px

Rayons de bord:
--radius-sm  :  8px
--radius-md  : 12px
--radius-lg  : 16px
--radius-pill: 999px
```

### Marges des lignes de paroles
```
Normal synced  : margin: 1cqw 0
Line-synced    : margin: 2cqw 0
```

### Scroll container
```
margin-top    : 25cqh   (normal)   | 40cqh  (Minimal Lyrics Mode)
margin-bottom : 45cqh
```

---

## 4. États des Lignes de Paroles

### Opacités
```
NotSung (à venir) : opacity = 0.51   (simple mode: 0.45)
Active  (en cours): opacity = 1.00
Sung    (passée)  : opacity = 0.497  (simple mode: 0.35)
Hover             : opacity = 1.00
```

### Scale (agrandissement)
```
NotSung  : scale = 1.0   (sidebar: 0.95)
Active   : scale = 1.05  (sidebar: 1.0 — pas d'agrandissement)
Sung     : scale = 1.0   (sidebar: 0.95)
```

> Le scale de 1.05 s'applique UNIQUEMENT aux types Line et Syllable en mode fullscreen non-sidebar.

### Minimal Lyrics Mode (option cachée)
```
NotSung : scale 0.965, opacity 0.5
Active  : scale 1.0,   opacity 1.0
Sung    : scale 0.95,  opacity 0.0   ← disparaissent complètement !
```

### Transform origins
```
LTR standard   : left center  (ou center center selon contexte)
RTL            : right center
Duet normal    : right center (pour la ligne qui est à droite)
Duet opposé    : left center  (pour la ligne qui est à gauche)
```

---

## 5. Remplissage Dégradé du Texte

Le texte n'est pas une couleur unie : c'est un dégradé qui anime la progression syllabe par syllabe.

### Variables clés
```
--gradient-degrees  : 180deg  (vertical, haut → bas)
--gradient-position : variable (de -20% à 100%)
--gradient-alpha     : 0.85  (alpha de début du dégradé)
--gradient-alpha-end: 0.50  (alpha de fin du dégradé)
--gradient-offset   : 0%    (décalage supplémentaire)
```

### Valeurs par état
```
Active  : --gradient-position = -20%  (blanc visible en haut)
Sung    : --gradient-position = 100%  (gradient complètement décalé)
NotSung : opacity globale seulement, pas de gradient actif
Static  : --gradient-alpha = 1, --gradient-alpha-end = 1  (tout blanc opaque)
Bg Line : --gradient-alpha = 0.6, --gradient-alpha-end = 0.3
```

### Formule du dégradé
```css
background: linear-gradient(
  180deg,
  rgba(255,255,255, 0.85)  at --gradient-position,
  rgba(255,255,255, 0.50)  at calc(--gradient-position + 20% + --gradient-offset)
)
```

---

## 6. Animations des Paroles — Valeurs Exactes

### Syllabe / Mot entrant (actif)

Chaque syllabe s'anime indépendamment avec ces courbes :

**Scale du mot :**
```
t=0.0 → scale 0.95  (repos)
t=0.7 → scale 1.075 (overshoott)
t=1.0 → scale 1.0   (cible)
```

**Scale de la lettre :**
```
t=0.0 → scale 0.95
t=0.7 → scale 1.18   (overshoot plus marqué)
t=1.0 → scale 1.0
```

**Décalage vertical (fraction de font-size) :**
```
t=0.0 → y =  1/100   (0.01)   ← légèrement en bas
t=0.9 → y = -1/52.5  (-0.019) ← remonte légèrement
t=1.0 → y =  0
```

**Glow (intensité 0→1) :**
```
t=0.00 → glow 0
t=0.15 → glow 1  ← pic rapide
t=0.60 → glow 1  ← maintenu
t=1.00 → glow 0  ← fondu sortie
```

**Paramètres Spring pour les mots :**
```
YOffset : damping 0.4,  frequency 1.25
Scale   : damping 0.6,  frequency 0.70
Glow    : damping 0.5,  frequency 1.00
```

### Transitions CSS des états de ligne

```
scale   : 0.4s cubic-bezier(0.37, 0, 0.63, 1)
opacity : 0.4s linear
```

> `cubic-bezier(0.37, 0, 0.63, 1)` est une courbe en S douce (slow in, slow out).

### Courbes diverses
```
Standard Material : cubic-bezier(0.4, 0, 0.2, 1)
Bounce            : cubic-bezier(0.835, -0.008, 0.149, 0.866)
Menu apparition   : cubic-bezier(0.23, 1, 0.32, 1)
```

---

## 7. Interlude / Musical Line (Points Animés)

Quand il n'y a pas de paroles (interlude instrumental), l'extension affiche 3 points animés à la place d'une ligne.

### Structure
```
.musical-line
  └── .dotGroup
        ├── .dot (1)
        ├── .dot (2)
        └── .dot (3)
```

### Taille & espacement des points
```
font-size du dot : calc(DefaultLyricsSize * 1.3)   ← 30% plus grand que le texte
border-radius    : 50%   ← cercle parfait
gap entre dots   : clamp(0.005rem, 1.7cqw, 0.18rem)
gap (simple mode): clamp(0.0067rem, 1.76cqw, 0.32rem)
```

### États des points

**Repos (NotSung) :**
```
scale   : 0.75
opacity : 0.35   (simple mode: 0.27)
```

**Actif (Active) :**
```
scale   : 1.0  (avec animation spring)
opacity : 1.0
```

### Animation d'un point (spring)

**Scale du point :**
```
t=0.0 → scale 0.75 (repos)
t=0.7 → scale 1.05 (overshoot léger)
t=1.0 → scale 1.0  (cible)
```

**Opacité du point (mode normal) :**
```
t=0.0  → opacity 0.35
t=0.60 → opacity 1.0
t=1.0  → opacity 1.0
```

**Décalage vertical du point :**
```
t=0.0 → y 0
t=0.9 → y -0.12  (remonte légèrement)
t=1.0 → y 0
```

### Chaque point a un délai décalé
```
dot[0] : delay 0ms
dot[1] : delay ~200ms
dot[2] : delay ~400ms
```

### Collapse du groupe (musical line cachée)
Quand la ligne musical devient inactive, le groupe scale à 0 avec cette easing complexe :
```
linear(0, -0.006 9.4%, -0.029 18%, -0.157 43.3%, -0.185 51.4%,
-0.189 55.9%, -0.182 60%, -0.163 63.9%, -0.133 67.6%, -0.074 72.3%,
0.006 76.7%, 0.238 85%, 0.566 92.7%, 1)
duration: 0.4s
```

Cette courbe crée un effet "élastique inversé" : l'objet s'écrase d'abord puis se comprime brusquement.

### Visibilité du musical-line
```css
/* Caché par défaut */
.musical-line { opacity: 0; height: 0; line-height: 0; overflow: hidden; margin: 0; }

/* Visible quand actif */
.musical-line.Active { opacity: 1; overflow: visible; height: auto; line-height: 1.1818; }
```

La transition de hauteur (0 → auto) se fait avec une animation JS, pas CSS.

---

## 8. Fond Dynamique (Background)

### Paramètres du canvas/video
```
filter    : saturate(2.5) brightness(0.65)   ← couleurs très saturées, assombri
sidebar   : brightness(0.6) saturate(2.65)
transform-origin: center center
```

### Mode Low Quality (image statique)
```
background-size    : cover
background-position: center
filter             : brightness(0.5) saturate(1.25)
transition opacity : 0.3s
```

### Mode Couleur
```
background-color (min contraste) : rgba(var(--MinContrastColor))
transition                       : background-color 1.5s
Overlay ::before  : background rgba(var(--HighContrastColor))
                    mask: linear-gradient(to top, transparent, black 145%)
                    height: 90%
Overlay ::after   : gradient linear to top, black → transparent
                    opacity: 0.3
```

### Mode Canvas (vidéo animée — principal)
```
Vidéo sidebar : filter brightness(0.65), opacity 0.95
mask-image    : linear-gradient(
                  to bottom,
                  transparent -5%,
                  black 15%,
                  black var(--sl_videocanvas_mask-stop),
                  transparent 100%
                )
transition mask-stop: 1s cubic-bezier(0,0,0,1)
```

### Pour notre app mobile (approximation fidèle)
```
2 couches d'image album art, décalées de phase
BlurView intensity: 95, tint: dark
filter saturate sur l'image: 2.5×
brightness: 0.65
Overlay sombre: rgba(0,0,0, 0.38)
Gradient bas: rgba(0,0,0,0.15) → rgba(0,0,0,0.55)
```

---

## 9. Panneau NowBar (Artwork + Contrôles)

### Dimensions du NowBar
```
--NowBarWidth         : calc(min(30cqw, 52cqh) * 1.1)
--NowBarRightSpacing  : calc(NowBarWidth / 4)
--NowBarLeftSpacing   : calc(50cqw - NowBarWidth - NowBarRightSpacing)
transition left       : 0.4s
```

### Image de couverture
```
border-radius : 2cqh
box-shadow    : 0 9px 20px 0 rgba(0,0,0, 0.271)
opacity       : 0.95
```

### Barre de progression (timeline)
```
height         : 1.3cqh  (compact: 1cqh)
border-radius  : 100cqw  (pill)
background     : linear-gradient(90deg,
                   blanc calc(100% * progress),
                   rgba(255,255,255,0.18) calc(100% * progress)
                 )
```

**Handle (scrubber) :**
```
width/height   : cercle
background     : #fff
border-radius  : 100%
position left  : calc(100% * progress)
```

### Compact Mode (header)
```
height NowBar  : max(54px, 15cqh)
MediaBox       : 100cqh × 100cqh (carré)
gap MediaBox/méta: 8cqh
```

---

## 10. Contrôles de Lecture (Boutons)

### ViewControls (container des boutons)
```
position    : absolute, top: 7cqh
height      : 9cqh
background  : rgba(0,0,0, 0.10)
backdrop-filter: blur(12px) saturate(1.6) brightness(1.05)
box-shadow  :
  0 10px 24px -8px rgba(8,10,18, 0.42),
  inset 0  1px 0 rgba(255,255,255, 0.36),
  inset 0  0  0 1px rgba(255,255,255, 0.16),
  inset 0 -1px 0 rgba(255,255,255, 0.18)
```

**Hover sur un bouton ViewControl :**
```
background: rgba(255,255,255, 0.12)
box-shadow:
  0 14px 32px -8px rgba(8,10,18, 0.50),
  0 0 22px -4px rgba(255,255,255, 0.24),
  inset 0  1px 0 rgba(255,255,255, 0.48),
  inset 0  0  0 1px rgba(255,255,255, 0.22),
  inset 0 -1px 0 rgba(255,255,255, 0.24)
```

### Boutons individuels
```
fill          : #fff
transition    : opacity 0.175s cubic-bezier(0.37, 0, 0.63, 1),
                filter  0.175s ease-out
Shuffle/Loop  : width 7cqw  (PiP: 10cqw)
Play          : width 9.25cqw (PiP: 12cqw)
```

**Animation de pression (spring) :**
```
keyframes pressAnimation (0.6s):
  0%  → scale(1 - delta * 1)
  16% → scale(1 - delta * -0.32)
  28% → scale(1 - delta * 0.13)
  44% → scale(1 - delta * -0.05)
  59% → scale(1 - delta * 0.02)
  73% → scale(1 - delta * -0.01)
  88% → scale(1 - delta * 0)
  100%→ scale(1)
```

---

## 11. Masque de Dégradé sur le Scroll

Le container de paroles est masqué en haut et en bas pour un fondu en douceur :

```css
mask-image: linear-gradient(
  180deg,
  transparent  0,
  transparent  16px,
  black       calc(64px + --SL-LyricsContent_MaskTopPadding),
  black       calc(100% - 64px),
  transparent calc(100% - 16px),
  transparent
)
```

- `--SL-LyricsContent_MaskTopPadding` : 0px au repos, 32px quand les ViewControls sont visibles (transition 0.5s)
- Zone visible : de `~80px` en haut à `~64px` avant le bas

---

## 12. Hover Box sur les Lignes

Quand on survole une ligne (non-musical), un rectangle semi-transparent apparaît derrière :

```css
::before {
  content: "";
  position: absolute;
  top: 50%;
  transform: translate(calc(-0.25cqw * 2), -50%);
  width : calc(100% + 0.25cqw * 2);
  height: calc(100% + 0.85cqw * 2);
  background-color: rgba(255,255,255, 0.1);
  backdrop-filter : blur(2px);
  border-radius   : 16px;
  opacity : 0;   → 1 au hover
  scale   : 0.9; → 1.05 au hover
  transition:
    opacity 0.25s ease,
    scale   0.4s linear(...)  /* spring complexe */
}
```

Le blur de 2px et la légère mise à l'échelle (0.9 → 1.05) donnent un effet de "carte qui se soulève".

---

## 13. Scrollbar (Barre de Défilement)

```
Couleur          : rgba(255,255,255, 0.6)
Épaisseur        : thin (navigateur)
Background       : transparent (caché)
border-radius    : 7px
Fade-in          : 0s
Fade-out         : 0.5s avec délai 0.2s
```

---

## 14. Chargement — Skeleton Loader

```css
animation: skeleton 1s linear infinite
backdrop-filter: blur(10px)
background: linear-gradient(-45deg,
  hsla(0,0%,93%, 0.25) 40%,
  hsla(0,0%,98%, 0.45) 50%,
  hsla(0,0%,93%, 0.25) 60%
)
background-size    : 500%
background-position: 100% → 0%  (déplacement via keyframe)
border-radius      : selon l'élément
```

---

## 15. Chargement — Dot Loader (3 points)

```css
width/height: 15px
border-radius: 50%
animation l5: 1s infinite linear alternate
  0%  : box-shadow 20px 0 blanc,  -20px 0 quaternaire; bg blanc
  33% : box-shadow 20px 0 quaternaire, -20px 0 quaternaire; bg blanc
  66% : box-shadow 20px 0 quaternaire, -20px 0 blanc; bg quaternaire
  100%: box-shadow 20px 0 quaternaire, -20px 0 blanc; bg blanc
```

---

## 16. Variables CSS Dynamiques Importantes

| Variable | Rôle |
|----------|------|
| `--DefaultLyricsSize` | Taille de base des paroles (responsive) |
| `--lyrics-line-height` | Hauteur de ligne : `1.1818181818` |
| `--vertical-gap` | Espace vertical entre les lignes |
| `--gradient-position` | Position du dégradé de syllabe (anime) |
| `--gradient-alpha` | Alpha début du dégradé (0.85) |
| `--gradient-alpha-end` | Alpha fin du dégradé (0.50) |
| `--gradient-degrees` | Direction du dégradé (180deg) |
| `--BlurAmount` | Blur textuel sur lignes non-actives (0px par défaut) |
| `--Vocal-NotSung-opacity` | 0.51 |
| `--Vocal-Sung-opacity` | 0.497 |
| `--dot-gap` | Espacement entre les points d'interlude |
| `--opacity-size` | Opacité des points au repos (0.35) |
| `--SL-LyricsContent_MaskTopPadding` | Ajustement du masque supérieur |

---

## 17. Modes d'Affichage

### Mode Fullscreen (principal)
- Scale Active: 1.05
- Police: `clamp(1.85rem, 7cqw, 3.5rem)`
- Transform origin: `left center`

### Mode Sidebar
- Scale Active: 1.0 (pas de scale)
- NotSung/Sung: scale 0.95
- Police: `clamp(2.1rem, 7cqw, 3.5rem)` (identique mais viewport plus petit)
- Transform origin: `left center`

### Mode PiP (Picture-in-Picture)
- Police synced: `clamp(1.7rem, 5.5cqw, 2.6rem)`
- Police static: `clamp(1.4rem, 6cqw, 2.3rem)`
- MediaBox: `min(100cqh, 90cqw)` (s'adapte)

### Mode Simple Lyrics
- Moins d'animations (scale seulement sur les lettres, pas les mots)
- Opacités réduites: NotSung 0.45, Sung 0.35
- Dots opacity: 0.27

### Mode Minimal Lyrics (caché)
- Sung disparaissent complètement (opacity 0)
- Transform origin: `left center` / `right center` selon alignement

---

## 18. Duets (Paroles à Deux Voix)

Quand une ligne est `OppositeAligned` (voix B) :

**Fullscreen non-sidebar :**
```
Voix A (normale)   : padding-right 5cqw
Voix B (opposée)   : padding-left 15cqw   ← très décalée à droite
```

**Sidebar :**
```
Voix A : padding-right 2cqw
Voix B : padding-left 10cqw
```

**RTL (arabe, hébreu) :** inversé côté gauche/droit.

---

## 19. Transitions Globales

| Propriété | Durée | Easing |
|-----------|-------|--------|
| opacity ligne | 0.4s | linear |
| scale ligne | 0.4s | cubic-bezier(0.37, 0, 0.63, 1) |
| height musical-line | JS animé | — |
| scale dotGroup collapse | 0.4s | linear(...complexe...) |
| fade background | 0.3s | — |
| fond couleur | 1.5s | — |
| mask-top padding | 0.5s | — |
| NowBar left | 0.4s | — |
| artwork border-radius | 0.3s | — |
| compact NowBar height | variable | — |

---

## 20. Récapitulatif : Ce Qui Rend l'Extension Belle

1. **Texte en dégradé** : `-webkit-text-fill-color: transparent` + `background-clip: text` → le dégradé blanc "remplit" le texte de gauche à droite ou haut en bas selon la progression syllabique.

2. **Glow textuel** : `text-shadow: 0 0 14px rgba(255,255,255,0.4)` sur les lignes actives → effet lumineux subtil.

3. **Spring physics** : Les syllabes ne se téléportent pas. Elles rebondissent légèrement (overshoot à 1.18×) avant de revenir à 1.0.

4. **3 niveaux d'opacité** : 0.51 / 1.0 / 0.497 — les différences sont minimes mais créent une profondeur visuelle.

5. **Dots animés en cascade** : Les 3 points d'interlude s'animent avec un délai croissant et un léger bounce, comme une respiration.

6. **Fond ultra-saturé** : `saturate(2.5) brightness(0.65)` sur l'artwork → couleurs vibrantes même pour des albums aux couleurs ternes.

7. **Masque fondu** : Les paroles disparaissent en douceur en haut et bas du container, jamais de coupure nette.

8. **Scale 1.05 en active** : Subtil mais perceptible — la ligne active "sort" légèrement vers le spectateur.

9. **Glass morphism** : Les contrôles UI ont du `backdrop-filter: blur` avec des bords lumineux — style Apple Vision Pro.

10. **Container query units** : Tout est relatif à la taille du container, pas du viewport — parfaitement adaptatif.
