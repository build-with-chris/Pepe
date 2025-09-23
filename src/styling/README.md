# Pepe Dark Elegance

Eine dunkle, elegante Bühne für Künstler - basierend auf der Premium Entertainment Booking Platform.

## 🎭 Design Philosophie

Das Design System folgt dem Konzept **"Entdecken – Erleben – Buchen"**:

**Die Idee**: Die Website ist selbst eine Bühne. Schwarz als Grundfläche = Vorhang.
Die Künstler (Fotos, Cards) treten ins warme, goldene Rampenlicht. Der Booking Assistant ist der „Direktkontakt zur Bühne".
So wird das Digitale zum Spiegel der Show-Atmosphäre.

### Design Prinzipien
- **Theatre Elegance**: Dunkle Bühne mit warmem, goldenem Licht
- **Künstlerischer Fokus**: Künstler stehen im Rampenlicht 
- **Warme Ausstrahlung**: Goldene und bronzene Akzente (#D4A574) statt hartes Rot
- **Immersive Experience**: Digitale Bühnenatmosphäre mit Partikel-Animation

## 📁 Dateistruktur

```
styling/
├── STYLING_IDEAS.md          # Vollständige Design System Dokumentation
├── tokens.css                # Design Tokens (Farben, Spacing, etc.)
├── typography.css             # Typografie System
├── components.css             # UI Komponenten
├── animations.css             # Animationen & Interaktionen
├── particles.css              # Partikel-System für Bühnenzauber
├── spacing-layout.md          # Detaillierte Spacing & Layout Prinzipien
├── demo.html                 # Live Demo mit Partikel-Animation
├── PepeSchrift.png           # Pepe Typography Sample
├── LogoPepe.png              # Pepe Logo (white on black)
├── Artist.jpg                # Sample artist image
└── README.md                 # Diese Datei
```

## 🚀 Quick Start

### 1. CSS Dateien einbinden

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <!-- In dieser Reihenfolge einbinden -->
    <link rel="stylesheet" href="styling/tokens.css">
    <link rel="stylesheet" href="styling/typography.css">
    <link rel="stylesheet" href="styling/components.css">
    <link rel="stylesheet" href="styling/animations.css">
</head>
<body>
    <!-- Ihr Content hier -->
</body>
</html>
```

### 2. Base Styles setzen

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    background: var(--pepe-black);
    color: var(--pepe-t80);
    font-family: var(--font-body);
    line-height: var(--leading-relaxed);
}
```

## 🎯 Hauptkomponenten

### Buttons
```html
<!-- Primary Button -->
<button class="btn btn-primary btn-lg hover-lift">
    Book Now
</button>

<!-- Secondary Button -->
<button class="btn btn-secondary btn-md">
    Learn More
</button>

<!-- Ghost Button -->
<button class="btn btn-ghost btn-sm">
    Cancel
</button>
```

### Cards
```html
<!-- Artist Card -->
<div class="artist-card hover-lift animate-fadeUp">
    <img src="artist.jpg" alt="Artist" class="artist-card-image">
    <div class="artist-card-overlay">
        <h3 class="artist-card-title">Artist Name</h3>
        <p class="artist-card-subtitle">Performance Type</p>
    </div>
    <span class="artist-card-badge">Featured</span>
</div>

<!-- Info Card -->
<div class="info-card hover-shadow">
    <div class="info-card-icon">★</div>
    <h3 class="info-card-title">Premium Service</h3>
    <p class="info-card-description">Description text here</p>
</div>
```

### Forms
```html
<div class="form-group">
    <label class="form-label form-label-required">Artist Name</label>
    <input type="text" class="input" placeholder="Enter artist name">
    <p class="form-helper">Your preferred artist name</p>
</div>

<div class="form-group">
    <label class="checkbox">
        <input type="checkbox" class="checkbox-input">
        <span class="checkbox-box"></span>
        <span>I agree to the terms</span>
    </label>
</div>
```

## 🌈 Color System

### Hauptfarben
- **--pepe-black**: `#000000` - Haupthintergrund
- **--pepe-dark**: `#111111` - Sekundärer Hintergrund  
- **--pepe-ink**: `#161616` - Komponentenhintergründe
- **--pepe-red**: `#E50914` - Primäre CTA, Fokus-Zustände

### Text Farben
- **--pepe-white**: `#FFFFFF` - Primärer Text/Überschriften
- **--pepe-t80**: `rgba(255,255,255,0.80)` - Sekundärer Text
- **--pepe-t64**: `rgba(255,255,255,0.64)` - Tertiärer Text/Labels
- **--pepe-t48**: `rgba(255,255,255,0.48)` - Deaktiviert/Placeholder

## ✨ Animationen

### Entrance Animationen
```html
<div class="animate-fadeUp">Fade Up Animation</div>
<div class="animate-scaleIn delay-200">Scale In mit Delay</div>
<div class="animate-slideRight">Slide Right Animation</div>
```

### Hover Effekte
```html
<div class="hover-lift">Hebt sich beim Hover</div>
<div class="hover-grow">Wächst beim Hover</div>
<div class="hover-glow">Leuchtet beim Hover</div>
```

### Staggered Animationen
```html
<div class="stagger-children">
    <div>Element 1 (0ms delay)</div>
    <div>Element 2 (50ms delay)</div>
    <div>Element 3 (100ms delay)</div>
</div>
```

## 📱 Responsive Design

Das System nutzt einen Mobile-First Ansatz mit folgenden Breakpoints:

```css
--screen-sm: 640px;   /* Small devices */
--screen-md: 768px;   /* Medium devices */
--screen-lg: 1024px;  /* Large devices */
--screen-xl: 1280px;  /* Extra large devices */
--screen-2xl: 1536px; /* 2X large devices */
```

### Responsive Utilities
```html
<!-- Verstecken/Zeigen bei Breakpoints -->
<div class="hidden sm:block">Nur auf Small+ sichtbar</div>
<div class="block md:hidden">Nur auf Mobile sichtbar</div>

<!-- Responsive Grids -->
<div class="grid grid-1 md:grid-2 lg:grid-3">
    <!-- Grid passt sich automatisch an -->
</div>
```

## ♿ Accessibility

Das Design System erfüllt WCAG AAA Standards:

- **Farbkontrast**: Minimum 7:1 für normalen Text
- **Fokus-Indikatoren**: Sichtbar für alle interaktiven Elemente
- **Keyboard Navigation**: Vollständig tastaturzugänglich
- **Screen Reader**: Semantisches HTML und ARIA-Labels
- **Motion Preferences**: Respektiert `prefers-reduced-motion`

### Fokus-Styles
```css
.focus-ring:focus-visible {
    outline: 2px solid var(--pepe-red);
    outline-offset: 2px;
}

.focus-shadow:focus-visible {
    box-shadow: 0 0 0 3px var(--pepe-red-glow);
}
```

## 🎨 Design Tokens

Alle Design-Werte sind als CSS Custom Properties definiert:

```css
:root {
    /* Colors */
    --pepe-red: #E50914;
    --pepe-black: #000000;
    
    /* Spacing */
    --space-4: 1rem;        /* 16px */
    --space-6: 1.5rem;      /* 24px */
    
    /* Typography */
    --font-display: 'Outfit', system-ui, sans-serif;
    --font-body: 'Inter', system-ui, sans-serif;
    
    /* Animations */
    --duration-normal: 300ms;
    --ease-spring: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

## 🛠 Verwendung mit Backend

### Flask Templates
```html
<!-- templates/base.html -->
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{% block title %}Pepe Shows{% endblock %}</title>
    
    <link rel="stylesheet" href="{{ url_for('static', filename='css/tokens.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/typography.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/components.css') }}">
    <link rel="stylesheet" href="{{ url_for('static', filename='css/animations.css') }}">
</head>
<body>
    <header class="header">
        <div class="header-container">
            <a href="{{ url_for('index') }}" class="header-logo">Pepe Shows</a>
            <nav class="nav">
                <a href="{{ url_for('artists') }}" class="nav-link">Artists</a>
                <a href="{{ url_for('booking') }}" class="nav-link">Book Now</a>
            </nav>
        </div>
    </header>
    
    <main>
        {% block content %}{% endblock %}
    </main>
</body>
</html>
```

### Artist Listing Template
```html
<!-- templates/artists.html -->
{% extends "base.html" %}

{% block content %}
<section class="section">
    <div class="container">
        <h1 class="display-2 display-gradient mb-8 animate-fadeUp">
            Unsere Artists
        </h1>
        
        <div class="grid grid-3 stagger-children">
            {% for artist in artists %}
            <div class="artist-card hover-lift">
                <img src="{{ artist.image_url }}" 
                     alt="{{ artist.name }}" 
                     class="artist-card-image">
                <div class="artist-card-overlay">
                    <h3 class="artist-card-title">{{ artist.name }}</h3>
                    <p class="artist-card-subtitle">{{ artist.discipline }}</p>
                </div>
                {% if artist.featured %}
                <span class="artist-card-badge">Featured</span>
                {% endif %}
            </div>
            {% endfor %}
        </div>
    </div>
</section>
{% endblock %}
```

## 📖 Weitere Dokumentation

- **[STYLING_IDEAS.md](./STYLING_IDEAS.md)** - Vollständige Design System Dokumentation
- **[implementation-guide.html](./implementation-guide.html)** - Live Demo aller Komponenten
- **Backend Integration** - Siehe Flask App Beispiele oben

## 🔄 Updates & Maintenance

### Version Updates
1. Aktualisieren Sie die Design Tokens in `tokens.css`
2. Erweitern Sie Komponenten in `components.css`
3. Testen Sie Änderungen mit `implementation-guide.html`
4. Dokumentieren Sie Änderungen in `STYLING_IDEAS.md`

### Performance Optimierung
- Nutzen Sie CSS Variables für konsistente Theming
- Minimieren Sie Specificity der Selektoren
- Bevorzugen Sie Transform/Opacity für Animationen
- Implementieren Sie Critical CSS für Above-the-Fold Content

## 🎯 Nächste Schritte

1. **Kopieren Sie die CSS Dateien** in Ihr `static/css/` Verzeichnis
2. **Inkludieren Sie sie in Ihren Templates** (siehe Flask Beispiele)
3. **Verwenden Sie die Komponenten** in Ihren HTML Templates
4. **Customizen Sie bei Bedarf** über CSS Variables
5. **Testen Sie Accessibility** mit Screen Readern und Keyboard Navigation

Das Design System ist vollständig einsatzbereit und kann sofort in Ihrem Flask Backend verwendet werden!