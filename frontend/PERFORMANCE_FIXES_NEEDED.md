# Critical Performance Fixes Needed

## URGENT: Compress Large Images (620KB total!)

### Images to compress in `public/doticons/`:

1. **world.jpg** - 376KB → Target: ~20KB
   ```bash
   # Using ImageMagick:
   convert world.jpg -quality 60 -resize 128x128 world.jpg

   # Or using online tool: https://squoosh.app/
   # Settings: Quality 60%, Resize to 128x128px
   ```

2. **pantomime.jpg** - 244KB → Target: ~20KB
   ```bash
   # Using ImageMagick:
   convert pantomime.jpg -quality 60 -resize 128x128 pantomime.jpg

   # Or using online tool: https://squoosh.app/
   # Settings: Quality 60%, Resize to 128x128px
   ```

### Why This Matters:
- These 2 images alone are **620KB** (15-20x larger than others!)
- They are loaded on the landing page via DotCloudImage
- Compressing them will save ~600KB of downloads
- **Expected Impact: LCP improvement from 25s → ~10-15s**

## Medium Priority: Code Splitting

### Large Bundles Found:
1. **SignUp.js** - 536KB (57KB gzipped)
   - Should NOT be loaded on landing page
   - Already lazy loaded, but might be pre-fetched

2. **login-form.js** - 184KB (61KB gzipped)
   - Should NOT be loaded on landing page

### Fix:
- Ensure these are truly lazy-loaded
- Consider dynamic imports only when auth dialog opens

## Completed:
- ✅ Fixed touch targets (48x48px minimum)
- ✅ Deferred Buhnenzauber loading (+1s delay)
- ✅ Removed Buhnenzauber import from Home.tsx

## Next Steps:
1. **COMPRESS IMAGES** (most critical!)
2. Add IntersectionObserver to DotCloudImage
3. Defer FloatingDisciplines rendering
4. Add loading="lazy" to all images
5. Consider reducing initial discipline animations
