cyrwheel.jpg exisitiert, bitte demopage erstellen, 
mit ein paar bild text elementen, zum test der piktogramme 


⸻

🧾 PRD Prompt for Claude Code

Title:
DotCloudImage – Grayscale-based Particle Icon Renderer

⸻

🧠 Goal

Build a React component that renders a grayscale image (128 × 128 px JPG in /public/doticons) as a dynamic particle cloud.
Each particle’s density corresponds to the image’s brightness:
	•	dark areas → more concentrated points
	•	light areas → sparse or transparent regions

The animation creates a living, breathing icon effect:
	•	Base state: points drift slightly around their initial positions (soft noise), forming a blurred or “floating” shape.
	•	Hover state: points re-assemble and densify according to brightness → the icon becomes clearly visible.

The component replaces the previous SVG-based plan and must integrate seamlessly with the existing particle-style background and UI contexts (Disciplines accordion, Gallery view, etc.).

⸻

🧩 Context & Architecture

Stack context
	•	React 18 / Next.js 14 / TypeScript / Tailwind CSS
	•	Existing CSS particle system (color, blur, animation)
	•	DB table disciplines includes field icon_name (e.g. cyrwheel)
	•	Corresponding image path: /public/doticons/cyrwheel.jpg (grayscale, 128 × 128 px)
	•	Rendering size in UI ≈ 400 × 400 px (scalable via prop)

Component name:
<DotCloudImage />

Location:
/components/ui/DotCloudImage.tsx

⸻

⚙️ Functional Behavior

1. Image Sampling
	•	Load grayscale image dynamically using icon_name from DB.
	•	Read pixel data via <canvas> (hidden off-screen) using getImageData().
	•	Sample pixels in a fixed grid (e.g. every 2 px → ~4000 possible points).
	•	For each pixel:
	•	Compute brightness b = (r + g + b) / 3.
	•	Map to density weight w = 1 - b/255.
	•	With probability proportional to w, create a particle.

→ This creates higher dot density where the image is darker.

2. Particle Rendering
	•	Render particles as absolutely positioned <span> or <div> elements in a 400 × 400 px container.
	•	Use same CSS style as global particles: color, blur, shadow.
	•	Points can drift beyond the square (10–20 px) via small random offsets (float).

3. Base (Idle) Animation
	•	Each particle:
	•	Randomly moves around its origin ± 4 px with soft sinus motion (CSS keyframes or small JS loop).
	•	Opacity 0.6–0.8 to create subtle haze.
	•	Shape remains roughly visible, but softly blurred / shimmering.

4. Hover State
	•	On hover:
	•	All particles interpolate back to their exact brightness-weighted positions (centered shape).
	•	Slightly increase opacity to 1.0.
	•	Reduce drift amplitude to near zero.
	•	The icon becomes crisp and recognizable.
	•	On mouseleave:
	•	Gradually restore float behavior and lower opacity again.

⸻

💡 Props Interface

interface DotCloudImageProps {
  disciplineId: string;
  size?: number;        // default 400
  color?: string;       // default inherits from global particle color
  density?: number;     // multiplier for total dots, default 1.0
  className?: string;
}


⸻

🧮 Technical Implementation Details

Image Processing

const img = new Image();
img.src = `/doticons/${icon_name}.jpg`;
await img.decode();

const canvas = document.createElement('canvas');
canvas.width = 128;
canvas.height = 128;
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0);
const data = ctx.getImageData(0, 0, 128, 128).data;

const particles = [];
for (let y = 0; y < 128; y += 2) {
  for (let x = 0; x < 128; x += 2) {
    const i = (y * 128 + x) * 4;
    const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
    const density = 1 - brightness / 255;
    if (Math.random() < density) {
      particles.push({ x, y, targetX: x, targetY: y });
    }
  }
}

Animation Logic
	•	Use React state to store particle positions.
	•	Use requestAnimationFrame or Framer Motion to interpolate between idle ↔ hover.
	•	Use Tailwind + CSS variables for color, size, blur.

Styling Example

.dot {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--dot-color, #fff);
  opacity: 0.7;
  transition: transform 0.8s ease, opacity 0.8s ease;
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(var(--fx, 2px), var(--fy, -2px)); }
}

Hover Behavior

const [hovered, setHovered] = useState(false);

<div
  className="relative"
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
  {particles.map((p, i) => (
    <span
      key={i}
      className="dot"
      style={{
        transform: `translate(${hovered ? p.targetX : p.targetX + noise()}, ${hovered ? p.targetY : p.targetY + noise()})`,
      }}
    />
  ))}
</div>


⸻

🧱 Integration Tasks

Task	Description	Output
1	Create /components/ui/DotCloudImage.tsx	Base component
2	Create utility /lib/imageToDots.ts	Samples JPG → particle array
3	Extend DB schema/API	Each discipline has icon_name
4	Integrate in DisciplineAccordion	<DotCloudImage disciplineId={id} /> beside title
5	Integrate in GalleryGrid	Larger hover-interactive version
6	Ensure particle CSS tokens (--dot-color, blur) match global theme	Consistency across app


⸻

🧪 Testing Checklist
	•	✅ Loads correct JPG by discipline name.
	•	✅ Idle animation visible, icon shape softly readable.
	•	✅ Hover shows strong convergence (crisp icon).
	•	✅ Smooth transitions without frame drops.
	•	✅ Color and motion match background particle system.
	•	✅ Works responsively (scaling from 200 px to 600 px).

⸻

🧭 Stretch Goals
	•	Dynamic recoloring via CSS hue filters.
	•	Support for animated brightness maps (small GIF → dynamic dot waves).
	•	Combine multiple grayscale layers for 3D depth parallax.
	•	Export as short WebM or Lottie JSON snapshot.

⸻