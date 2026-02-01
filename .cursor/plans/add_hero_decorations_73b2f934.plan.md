---
name: Add hero decorations
overview: Add decorative frond SVGs and palm tree background image to the landing page HeroSection based on the Figma design.
todos:
  - id: save-frond
    content: Download/save frond SVG to public/landing/frond.svg
    status: pending
  - id: add-fronds
    content: Add left and right frond images to HeroSection.tsx
    status: pending
  - id: add-bg
    content: Add palm tree background image to HeroSection.tsx (after user provides asset)
    status: pending
isProject: false
---

# Add Fronds and Background to Landing Page Hero

## Assets Required

From the Figma design (node 2096:817), the hero section needs:

1. **Frond SVG** - White tribal/leaf decorative icon (I captured the asset URL earlier)
2. **Palm tree background** - Dark silhouette palm trees behind the hero content

**User action needed:** Export the palm tree background image from Figma (it appears to be a separate layer in the Hero section) and save it to `frontend/public/landing/` as `hero-palms.png` or similar.

## Frond Positioning (from Figma)

Based on the design context retrieved:

- **Left frond**: Rotated 54.7deg, positioned in upper-left area (`top: ~196px`, `left: ~150px` from container origin)
- **Right frond**: Rotated -36.84deg, positioned in right area (`left: 89.44%`, `top: calc(50% - 125px)`)

Both use the same SVG asset, just rotated differently.

## Implementation

### 1. Download and save the frond SVG

Save the frond SVG to [frontend/public/landing/frond.svg](frontend/public/landing/frond.svg)

The SVG was available at the Figma localhost server during the session. If not accessible, export from Figma node `2096:822`.

### 2. Update HeroSection.tsx

In [frontend/src/components/landing/HeroSection.tsx](frontend/src/components/landing/HeroSection.tsx):

Add two frond `Image` components with absolute positioning:

```tsx
{/* Left Frond */}
<Image
  src="/landing/frond.svg"
  alt=""
  position="absolute"
  left={{ base: '-20px', lg: '40px' }}
  top={{ base: '150px', lg: '196px' }}
  w={{ base: '120px', lg: '180px' }}
  h="auto"
  transform="rotate(54.7deg)"
  pointerEvents="none"
  zIndex={2}
/>

{/* Right Frond */}
<Image
  src="/landing/frond.svg"
  alt=""
  position="absolute"
  right={{ base: '-20px', lg: '40px' }}
  top="50%"
  transform="translateY(-50%) rotate(-36.84deg) scaleX(-1)"
  w={{ base: '120px', lg: '180px' }}
  h="auto"
  pointerEvents="none"
  zIndex={2}
/>
```

### 3. Add palm tree background (after user exports)

Add a background image layer between the gradient and the ambient glow effects:

```tsx
{/* Palm tree silhouettes background */}
<Image
  src="/landing/hero-palms.png"
  alt=""
  position="absolute"
  inset={0}
  w="full"
  h="full"
  objectFit="cover"
  opacity={0.3}
  pointerEvents="none"
  zIndex={0}
/>
```

## File Changes

- [frontend/public/landing/frond.svg](frontend/public/landing/frond.svg) - new file (frond decoration)
- [frontend/public/landing/hero-palms.png](frontend/public/landing/hero-palms.png) - new file (palm background, user exports)
- [frontend/src/components/landing/HeroSection.tsx](frontend/src/components/landing/HeroSection.tsx) - add fronds and background image
