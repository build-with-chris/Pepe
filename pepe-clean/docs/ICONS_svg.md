Product Requirement Document

Title:
DotIconHoverAnimation – Interactive SVG Particle Icons

⸻

🧠 Goal

Integrate dynamic, hover-reactive SVG icons that use the same CSS particle system already running in the site’s background.
Each icon (e.g. Cyr Wheel) should be generated from an SVG file stored in /public/doticons and represented as a field of animated dots (particles).
When a user hovers over an icon, the particles gently move into their precise shape positions, revealing the pictogram.
When the hover ends, the dots slowly dissolve and float back into random positions.

This feature must be implemented as a React component that can be reused across multiple UI contexts (e.g. Disciplines accordion, Gallery, etc.), with dynamic data from the database (not hardcoded lists).

⸻

🧩 Architecture Overview

Stack Context
	•	Existing CSS particle system already rendering dots in the background.
	•	Next.js / React 18 + TypeScript + Tailwind CSS.
	•	Disciplin data fetched from DB (e.g. Supabase or Prisma).
	•	SVG assets in /public/doticons/*.svg.
	•	Each discipline record in the DB has a field icon_name matching the SVG filename.

Component Name:
<DotIcon />

Location:
/components/ui/DotIcon.tsx

⸻

⚙️ Functional Behavior

1. Rendering
	•	Load the SVG dynamically from /public/doticons/${icon_name}.svg.
	•	Parse the SVG paths into arrays of coordinate points (x, y).
	•	Initialize 10-50  points per icon (depending on SVG complexity, lets set this via variable).
	•	Use the same CSS class or Tailwind utility as existing background particles (color, size, blur).
	•	Points are absolutely positioned inside an SVG or relative <div> container.

2. Idle State
	•	All points gently drift around their base positions (use small CSS animation or transform via keyframes).
	•	If the component is offscreen or hidden (e.g. accordion collapsed), pause the animation.

3. Hover / Focus State
	•	When hovered:
	•	All points smoothly transition to their exact SVG target coordinates.
	•	The full pictogram becomes visible.
	•	Optionally fade in a subtle outer glow or stroke (via CSS variable --dot-accent).
	•	When hover ends:
	•	Points drift back into the free particle cloud (original idle pattern).

4. Data Flow
	•	<DotIcon disciplineId={id} />
→ fetch icon_name from DB.
→ load matching /public/doticons/${icon_name}.svg.
→ generate dot positions.
	•	No hardcoded icons or coordinates.

5. Reusability
	•	Must support placement inside:
	•	Accordion Item (Disciplines Page) → small icon next to discipline title.
	•	Gallery Grid → larger hover area, same effect.
	•	Component props:

interface DotIconProps {
  disciplineId: string;
  size?: number; // default 200px
  color?: string; // optional override of particle color
  hoverIntensity?: number; // e.g. 0.2 = mild, 1.0 = strong
  className?: string;
}



⸻

🧮 Technical Implementation Details
	1.	SVG Parsing
	•	Use svg-path-properties or svg-points to sample path coordinates.
	•	Normalize to the component’s viewBox.
	•	Store target positions in state.
	2.	Animation
	•	Use CSS transitions or Framer Motion for smooth interpolation between idle and hover.
	•	Keep animation frame-rate lightweight (no heavy canvas).
	•	Each point is a <span> or <div> with class dot.
	3.	Styling

.dot {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--dot-color, white);
  transition: transform 0.8s ease, opacity 0.8s ease;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(var(--float-x, 2px), var(--float-y, 2px)); }
}


	4.	Hover Logic
	•	On mouseenter: set hovered = true; apply CSS variable updates to position dots at targetX/Y.
	•	On mouseleave: return to random offsets.
	•	Use React state or Framer Motion’s useAnimationControls.
	5.	Performance
	•	Cap to ~500 dots per icon for smooth interaction.
	•	Use requestAnimationFrame batching for updates if needed.
	•	Memoize SVG coordinate arrays.

⸻

🧱 Integration Tasks

Task	Description	Output
1	Create /components/ui/DotIcon.tsx	New component
2	Add utility /lib/svgToPoints.ts	Converts SVG → points array
3	Extend DB schema or API response	Field icon_name for each discipline
4	Update DisciplineAccordion.tsx	Render <DotIcon disciplineId={d.id} /> beside titles
5	Update GalleryItem.tsx	Replace static SVG with interactive <DotIcon />
6	Ensure shared CSS variables (--dot-color, etc.) sync with global particle system	Thematic consistency


⸻

🧪 Testing Checklist
	•	✅ Each icon loads dynamically by discipline name.
	•	✅ Hover effect triggers smooth morph into recognizable icon.
	•	✅ Works in both Accordion and Gallery contexts.
	•	✅ Animation pauses when icon is offscreen.
	•	✅ Color and motion match existing CSS particle system.

⸻

🧭 Stretch Goals (optional)
	•	Add “reveal” animation when scrolling into view (IntersectionObserver).
	•	Add motion-reduce support for accessibility.
	•	Cache parsed SVG points in localStorage or JSON for performance.
	•	Optionally export Lottie JSON snapshot for marketing use.

⸻

Soll ich dir dazu noch das Grundgerüst für
/components/ui/DotIcon.tsx und /lib/svgToPoints.ts
direkt erstellen, damit du Claude sofort weitergeben kannst (TypeScript + Tailwind kompatibel)?