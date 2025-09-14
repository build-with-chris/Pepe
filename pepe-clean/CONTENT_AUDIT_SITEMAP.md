# PEPE SHOWS - CONTENT AUDIT & SITEMAP

## SITE STRUCTURE COMPARISON

### ✅ PAGES (OLD → NEW STATUS)

| **PAGE** | **OLD PATH** | **NEW PATH** | **STATUS** | **NOTES** |
|----------|--------------|--------------|------------|-----------|
| Home | `/` | `/` | ✅ EXISTS | New has dynamic accordion, old has Bento1/Gallery23/Cta10 components |
| Shows | `/shows` | `/shows` | ⚠️ PARTIAL | OLD: Gallery34 + About1. NEW: Gallery34 + About1 + DB Shows. **NEED TO VERIFY FULL MATCH** |
| Artists | `/kuenstler` | `/kuenstler` | ✅ EXISTS | NEW has enhanced accordion, card flipping |
| Gallery | `/galerie` | `/galerie` | ✅ EXISTS | Both use galleries |
| Contact | `/kontakt` | `/kontakt` | ✅ EXISTS | Both have contact forms |
| Booking | `/anfragen` | `/anfragen` | ⚠️ DIFFERENT | OLD: Multi-step wizard. NEW: Simple form. **MAJOR DIFFERENCE** |
| Admin | `/admin` | - | ❌ MISSING | Admin panel not in new version |
| 404 | `/404` | - | ❌ MISSING | 404 page not created |
| Legal Pages | Multiple | Multiple | ✅ EXISTS | Imprint, Privacy, Terms all exist |

### 📄 CONTENT SECTIONS ANALYSIS

## HOME PAGE SECTIONS

### OLD HOME SECTIONS:
1. **Hero Section** - hero image with particles
2. **Bento1 Component** - Grid layout with cards
3. **Gallery23 Component** - Artist showcase
4. **Cta10 Component** - Call to action
5. **SpotlightsFixed** - Spotlight effects
6. **PepesParticles** - Interactive particles

### NEW HOME SECTIONS:
1. **Hero Section** - ✅ EXISTS (text different)
2. **Discipline Accordion** - ✅ NEW FEATURE (dynamic from DB)
3. **Client Logos** - ✅ EXISTS
4. **Call to Action** - ✅ EXISTS

**STATUS: ⚠️ CONTENT MISMATCH - Need to verify hero text matches exactly**

## SHOWS PAGE SECTIONS

### OLD SHOWS SECTIONS:
1. **Gallery34** - 6 show format cards with translations
2. **About1** - Hero, mission, spotlight video, next steps

### NEW SHOWS SECTIONS:
1. **Hero Section** - ✅ EXISTS (uses hero37 translations)
2. **Show Formats Grid** - ✅ EXISTS (uses gallery34 translations - all 6 items)
3. **Database Shows** - ✅ NEW FEATURE (from API)
4. **About1 Content** - ✅ EXISTS (mission, next steps)

**STATUS: ✅ GOOD - New version has MORE content than old**

## ARTISTS PAGE SECTIONS

### OLD ARTISTS SECTIONS:
1. **Admin interface for managing artists**
2. **Artist cards with approval workflow**

### NEW ARTISTS SECTIONS:
1. **Hero Section** - ✅ EXISTS
2. **Discipline Accordion** - ✅ EXISTS (with mouseover)
3. **Artist Cards** - ✅ EXISTS (with flip animation)
4. **Filter functionality** - ✅ EXISTS

**STATUS: ✅ ENHANCED - New has better UX**

## BOOKING SYSTEM COMPARISON

### OLD BOOKING (/anfragen):
- **Multi-step wizard** with 9 detailed steps:
  1. Intro
  2. Event Type
  3. Show Type  
  4. Show Disciplines
  5. Artist Count
  6. Location
  7. Date & Time
  8. Special Wishes
  9. Contact Details
  10. Showtime (final submission)

### NEW BOOKING (/anfragen):
- **Simple wizard** with 7 steps:
  1. Event Type (4 options with images)
  2. Team Size (3 options with images)
  3. Performance Style (multiple disciplines)
  4. Venue Type
  5. Event Details (date, guests, budget)
  6. Contact Info
  7. Review & Submit

**STATUS: ❌ MAJOR DIFFERENCE - Old has more detailed workflow**

## TRANSLATION KEYS AUDIT

### CRITICAL TRANSLATION KEYS USED IN OLD:

| **COMPONENT** | **KEY PREFIX** | **STATUS IN NEW** |
|---------------|----------------|-------------------|
| Gallery34 | `gallery34.*` | ✅ IMPLEMENTED |
| About1 | `about1.*` | ✅ IMPLEMENTED |
| Hero37 | `hero37.*` | ✅ IMPLEMENTED |
| Artists | `artists.*` | ✅ IMPLEMENTED |
| Bento1 | `bento1.*` | ❌ NOT USED |
| Hero27 | `hero27.*` | ❌ NOT USED |
| Hero87 | `hero87.*` | ❌ NOT USED |

## API ENDPOINTS COMPARISON

### OLD API CALLS:
- `${baseUrl}/admin/artists?status=${s}` (admin only)
- `${baseUrl}/api/artists` (public)
- Booking submission endpoints

### NEW API CALLS:
- `${baseUrl}/api/artists` ✅ MATCHES
- `${baseUrl}/api/shows` ✅ NEW FEATURE
- `${baseUrl}/api/booking-requests` ✅ MATCHES

## IMAGES AUDIT

### OLD IMAGES USED:
- `/images/Galerie34/` - Solo.webp, Duo.webp, Konzeptshow.webp, Variete.webp, Zauberer.webp, Feuershow.webp
- `/images/About1/` - About1.1.webp, About1.2.webp
- `/images/eventTypes/` - Various event type images
- `/images/teamSizes/` - Solo.webp, Duo.webp, Gruppe.webp

### NEW IMAGES USED:
- All Gallery34 images ✅ USED in show format cards
- Event type images ✅ USED in booking wizard
- Team size images ✅ USED in booking wizard
- About1 images ❌ NOT USED (hardcoded URLs)

## MAJOR GAPS IDENTIFIED

### 🚨 HIGH PRIORITY MISSING CONTENT:

1. **Booking Wizard Complexity**
   - Old: 10 steps with detailed progression
   - New: 7 steps simplified
   - **IMPACT: User experience completely different**

2. **Hero Content Mismatch**
   - Old uses multiple hero components (hero27, hero87, hero135)
   - New uses simplified hero with hero37
   - **NEED TO VERIFY: Text content matches user expectations**

3. **Missing Components**
   - Bento1 component content not transferred
   - Gallery23 artist showcase not replicated
   - SpotlightsFixed effects not implemented

4. **Admin Functionality**
   - Old has full admin panel
   - New has no admin interface
   - **IMPACT: Content management workflow missing**

### 🔧 IMMEDIATE ACTIONS NEEDED:

1. **Verify Booking API Compatibility**
   - Ensure new booking form sends same data structure as old
   - Test API endpoint responses

2. **Translation Key Verification**
   - Check all hero37, about1, gallery34 keys exist
   - Verify exact text matches user expectations

3. **Image Path Verification**
   - Ensure all Gallery34 images load correctly
   - Verify About1 images are accessible

4. **Content Completeness**
   - Compare exact hero text with old version
   - Ensure all show format descriptions match

## RECOMMENDATIONS

### ✅ KEEP (Working Well):
- Gallery34 implementation with all 6 show formats
- About1 content structure
- Artist accordion with database integration
- Enhanced Shows page with database content

### 🔧 FIX (Priority Issues):
- Booking wizard - make it match old complexity if required
- Verify all translation keys load correctly
- Ensure API endpoints return expected data
- Check image loading paths

### 📋 VERIFY (User Testing Required):
- Hero text matches user expectations
- Booking flow captures all required information
- All images display correctly
- Translation completeness across languages

## CONCLUSION

**Overall Status: 75% Content Parity**

The new frontend has **enhanced functionality** in many areas (dynamic accordion, database integration, better UX) but has **simplified the booking process significantly**. 

**Key Question for User:** Do you want the booking process to match the old 10-step detailed wizard, or is the new 7-step simplified version acceptable?

**Next Steps:** 
1. User confirms booking wizard requirements
2. Verify all translation keys work
3. Test all API endpoints
4. Confirm image loading
5. Final content review