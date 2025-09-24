# Pepe Dark Elegance - Spacing & Layout Principles
## Die Bühne als digitaler Raum

---

## 🎭 Spatial Design Philosophy

### Theatre Space Metaphor
Die Website ist eine **digitale Bühne** - jeder Bereich hat seine dramaturgische Funktion:

- **Vorhang (Background)**: Tiefschwarzer Grundraum (#000000)
- **Bühne (Content Areas)**: Definierte Spielflächen mit gezielter Beleuchtung
- **Rampenlicht (Focus Areas)**: Goldenes Licht lenkt die Aufmerksamkeit
- **Zwischenräume (White Space)**: Dramatische Pausen und Atemräume

---

## 📐 Spacing Scale & Rhythm

### Base Unit: 8px System
Alle Abstände basieren auf 8px für perfekte Pixel-Ausrichtung und visuelle Harmonie:

```css
/* Micro Spacing (0-16px) - Details und Feinabstimmung */
--space-0: 0;          /* 0px - Kein Abstand */
--space-1: 0.25rem;    /* 4px - Minimaler Abstand */
--space-2: 0.5rem;     /* 8px - BASE UNIT */
--space-3: 0.75rem;    /* 12px - Kleine Elemente */
--space-4: 1rem;       /* 16px - Standard Element-Padding */

/* Component Spacing (16-48px) - Komponenten-Innere */
--space-5: 1.25rem;    /* 20px - Medium Padding */
--space-6: 1.5rem;     /* 24px - Standard Card Padding */
--space-8: 2rem;       /* 32px - Large Padding */
--space-12: 3rem;      /* 48px - XL Padding */

/* Layout Spacing (48-192px) - Sektionen und Layout */
--space-16: 4rem;      /* 64px - Section Spacing */
--space-20: 5rem;      /* 80px - Large Section Gaps */
--space-24: 6rem;      /* 96px - XL Section Gaps */
--space-32: 8rem;      /* 128px - Hero Spacing */
--space-48: 12rem;     /* 192px - Dramatic Spacing */
```

### Spacing Hierarchy

#### 1. **Micro Level** (0-16px)
```css
/* Text und kleine UI Elemente */
.micro-spacing {
    /* Badge padding */
    padding: var(--space-1) var(--space-2);
    
    /* Button icon gaps */
    gap: var(--space-2);
    
    /* Form label margins */
    margin-bottom: var(--space-2);
}
```

#### 2. **Component Level** (16-48px)
```css
/* Komponenten-interne Abstände */
.component-spacing {
    /* Card padding */
    padding: var(--space-6);
    
    /* Button padding */
    padding: var(--space-3) var(--space-5);
    
    /* Form group margins */
    margin-bottom: var(--space-6);
}
```

#### 3. **Layout Level** (48-192px)
```css
/* Sektionen und große Layout-Bereiche */
.layout-spacing {
    /* Section padding */
    padding: var(--space-16) 0;
    
    /* Hero section */
    padding: var(--space-32) 0;
    
    /* Dramatic spacing for effect */
    margin: var(--space-48) 0;
}
```

---

## 🏛️ Layout Grid System

### Container Hierarchy

#### 1. **Stage Container** - Die Hauptbühne
```css
.stage-container {
    max-width: 1280px;           /* Optimale Viewing Distance */
    margin: 0 auto;
    padding: 0 var(--space-6);   /* Side curtains */
    position: relative;
}

/* Responsive Breakpoints */
@media (min-width: 768px) {
    .stage-container {
        padding: 0 var(--space-8);  /* Wider side curtains */
    }
}

@media (min-width: 1024px) {
    .stage-container {
        padding: 0 var(--space-12); /* Full theatre view */
    }
}
```

#### 2. **Performance Areas** - Spezifische Bühnenabschnitte
```css
/* Hero Stage - Hauptaufführung */
.hero-stage {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-32) 0;
}

/* Artist Showcase - Künstler-Galerie */
.artist-showcase {
    padding: var(--space-24) 0;
}

/* Booking Stage - Interaktiver Bereich */
.booking-stage {
    background: var(--pepe-ink);
    padding: var(--space-20) 0;
    border-radius: var(--radius-3xl);
    margin: var(--space-16) 0;
}
```

### Grid Systems

#### 1. **Artist Grid** - Künstler-Präsentation
```css
.artist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-8);
    padding: var(--space-12) 0;
}

/* Responsive adjustments */
@media (min-width: 768px) {
    .artist-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-12);
    }
}

@media (min-width: 1024px) {
    .artist-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (min-width: 1280px) {
    .artist-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

#### 2. **Information Grid** - Content Layout
```css
.info-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6);
}

@media (min-width: 768px) {
    .info-grid {
        grid-template-columns: 1fr 1fr;
        gap: var(--space-8);
    }
}

@media (min-width: 1024px) {
    .info-grid {
        grid-template-columns: 2fr 1fr;
        gap: var(--space-12);
    }
}
```

---

## 🎨 White Space Philosophy

### "Dramatic Pauses" - White Space als Gestaltungselement

#### 1. **Breathing Room** - Lesbarkeit und Fokus
```css
/* Text spacing for readability */
.content-text {
    line-height: var(--leading-relaxed);    /* 1.6 */
    margin-bottom: var(--space-4);
}

.content-text + .content-text {
    margin-top: var(--space-6);             /* Paragraph spacing */
}

/* Heading hierarchy spacing */
.h1 { margin: var(--space-12) 0 var(--space-6) 0; }
.h2 { margin: var(--space-8) 0 var(--space-4) 0; }
.h3 { margin: var(--space-6) 0 var(--space-3) 0; }
```

#### 2. **Spotlight Effects** - Fokus durch Raum
```css
/* Hero text with dramatic spacing */
.hero-content {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-16) var(--space-6);
}

.hero-title {
    margin-bottom: var(--space-8);
    letter-spacing: var(--tracking-tight);
}

.hero-description {
    margin-bottom: var(--space-12);
    font-size: var(--text-xl);
    opacity: 0.8;
}
```

#### 3. **Artist Card Spacing** - Rampenlicht-Effekt
```css
.artist-card {
    /* Internal spacing */
    position: relative;
    aspect-ratio: 4/5;
    
    /* Hover expansion space */
    margin: var(--space-2);
    transition: margin var(--duration-normal) var(--ease-spring);
}

.artist-card:hover {
    /* Expands into surrounding space */
    margin: 0;
    transform: scale(1.02);
}

.artist-card-overlay {
    padding: var(--space-6);
    /* Gradient creates visual "breathing room" */
    background: linear-gradient(
        to top, 
        rgba(0,0,0,0.9) 0%, 
        rgba(0,0,0,0.5) 50%,
        transparent 100%
    );
}
```

---

## 📱 Responsive Spacing Strategy

### Mobile-First Approach

#### 1. **Condensed Spacing** (320px - 768px)
```css
/* Mobile: Minimal but comfortable */
@media (max-width: 767px) {
    .section-spacing {
        padding: var(--space-12) 0;  /* Reduced from var(--space-16) */
    }
    
    .container-spacing {
        padding: 0 var(--space-4);   /* Tighter side margins */
    }
    
    .card-spacing {
        gap: var(--space-4);         /* Closer cards */
        margin: var(--space-2) 0;
    }
}
```

#### 2. **Comfortable Spacing** (768px - 1024px)
```css
/* Tablet: Standard spacing */
@media (min-width: 768px) and (max-width: 1023px) {
    .section-spacing {
        padding: var(--space-16) 0;
    }
    
    .container-spacing {
        padding: 0 var(--space-6);
    }
    
    .card-spacing {
        gap: var(--space-6);
    }
}
```

#### 3. **Generous Spacing** (1024px+)
```css
/* Desktop: Full dramatic spacing */
@media (min-width: 1024px) {
    .section-spacing {
        padding: var(--space-24) 0;  /* Expanded for drama */
    }
    
    .hero-spacing {
        padding: var(--space-32) 0;  /* Maximum impact */
    }
    
    .container-spacing {
        padding: 0 var(--space-12);  /* Wide curtains */
    }
}
```

---

## 🎯 Practical Implementation

### 1. **Utility Classes**
```css
/* Spacing utilities */
.p-stage { padding: var(--space-6); }           /* Standard stage padding */
.p-spotlight { padding: var(--space-8); }       /* Spotlight padding */
.p-hero { padding: var(--space-16); }           /* Hero padding */

.m-breath { margin: var(--space-4) 0; }         /* Breathing room */
.m-pause { margin: var(--space-8) 0; }          /* Dramatic pause */
.m-curtain { margin: var(--space-16) 0; }       /* Act separation */

.gap-tight { gap: var(--space-2); }             /* Tight grouping */
.gap-standard { gap: var(--space-4); }          /* Standard grouping */
.gap-loose { gap: var(--space-8); }             /* Loose grouping */
```

### 2. **Component Spacing Standards**
```css
/* Button spacing */
.btn { padding: var(--space-3) var(--space-5); }
.btn-lg { padding: var(--space-4) var(--space-8); }

/* Card spacing */
.card { padding: var(--space-6); }
.card-lg { padding: var(--space-8); }

/* Form spacing */
.form-group { margin-bottom: var(--space-6); }
.form-section { margin-bottom: var(--space-12); }
```

### 3. **Layout Patterns**
```css
/* Section rhythm */
.section {
    padding: var(--space-16) 0;
    border-bottom: 1px solid var(--pepe-line);
}

.section:last-child {
    border-bottom: none;
    padding-bottom: var(--space-24); /* Final curtain call */
}

/* Container patterns */
.stage-content {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 clamp(var(--space-4), 5vw, var(--space-12));
}
```

---

## 💡 Design Decision Framework

### When to Use Each Spacing Level:

#### **Micro Spacing** (0-16px)
- Form input padding
- Button text gaps
- Icon alignments
- Badge padding

#### **Component Spacing** (16-48px)
- Card internal padding
- Button padding
- Form group margins
- List item spacing

#### **Layout Spacing** (48-192px)
- Section separation
- Hero areas
- Navigation spacing
- Dramatic visual breaks

### **Golden Rules:**
1. **Consistency**: Use the same spacing values across similar components
2. **Hierarchy**: Larger spacing = higher importance
3. **Breathing Room**: Never let elements feel cramped
4. **Drama**: Use generous spacing for emotional impact
5. **Responsive**: Adjust spacing appropriately for screen size

---

## 🎭 The Theatre Experience

Das Spacing System schafft eine **immersive Bühnenerfahrung**:
- **Curtain Rise**: Großzügige Hero-Bereiche schaffen Erwartung
- **Spotlight Moments**: Fokussierte Bereiche mit gezieltem Raum
- **Rhythmic Pacing**: Gleichmäßige Abstände schaffen Ruhe
- **Dramatic Pauses**: White Space als emotionales Gestaltungsmittel
- **Final Bow**: Abschluss-Bereiche mit besonderer räumlicher Behandlung