# UI Library Review

**Date:** 2026-03-17
**Reviewed by:** Frontend Developer (AI Agent)
**File:** `src/routes/ui-lib/+page.svelte`

---

## Executive Summary

**Overall Rating: 5/10** - Needs significant work

The UI Library page has a solid foundation but suffers from major architectural issues that impact maintainability, performance, and developer experience. The codebase would benefit greatly from component extraction and modern frontend patterns.

---

## Critical Issues (P0 - Must Fix)

### 1. Massive Code Duplication

**Location:** `src/routes/ui-lib/+page.svelte` (979 lines)

**Problem:** Each component section (alert, modal, empty-state, etc.) renders ALL three tabs (preview, code, props) with near-identical structure. The file contains ~700 lines of repetitive conditional rendering.

**Impact:**
- Unmaintainable - any change requires updating 10+ locations
- Slow builds - large file with repeated logic
- Poor DX - hard to navigate and understand
- Bug-prone - easy to miss updating one section

**Solution:**
```
src/routes/ui-lib/
├── +page.svelte           (~100 lines - layout only)
├── ComponentSection.svelte (~50 lines - section wrapper)
├── ComponentPreview.svelte (~30 lines - preview panel)
├── CodeBlock.svelte       (~40 lines - code display)
├── PropsTable.svelte      (~30 lines - props table)
└── TabPanel.svelte        (~25 lines - tab navigation)
```

### 2. All Components Rendered Simultaneously

**Problem:** The `{#each components}` loop renders ALL 10 component sections at once, even when only one is "active". This hurts performance.

**Solution:** Only render the active section:
```svelte
{#if activeSection === component.id}
    <ComponentSection {component} {activeTab} />
{/if}
```

### 3. Search Input Non-Functional

**Location:** Lines 173, 618-635

**Problem:** Search input has no functionality - it doesn't filter components.

**Solution:** Add reactive filtering:
```svelte
let searchQuery = $state('');

const filteredComponents = $derived(
    components.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
);
```

---

## Visual Design Issues

### Color Palette

| Issue | Current | Recommendation |
|-------|---------|----------------|
| Hardcoded colors | Some components use Tailwind color classes | Use only CSS variables |
| Limited neutral scale | Good base in app.css | Add more steps (50-950) |
| Dark mode | Implemented but inconsistent | Audit all components |

### Typography Hierarchy

| Level | Current | Issue |
|-------|---------|-------|
| Display | 2rem | Too small for hero impact |
| H1 | - | Missing |
| H2 | 0.9375rem (FeedCard) | Inconsistent across components |
| Body | 0.875rem-1rem | Good |
| Caption | 0.625rem | Good |

**Recommendation:** Define typography scale:
```css
--text-display: clamp(2.5rem, 5vw, 4rem);
--text-h1: 2rem;
--text-h2: 1.5rem;
--text-h3: 1.25rem;
--text-body: 1rem;
--text-sm: 0.875rem;
--text-xs: 0.75rem;
```

### Spacing Issues

- No consistent spacing scale defined
- Arbitrary values used throughout (1rem, 1.5rem, 2rem, 3rem, etc.)
- Section padding inconsistent (2rem vs 4rem)

**Recommendation:** Define spacing scale in CSS variables:
```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-6: 1.5rem;
--space-8: 2rem;
--space-12: 3rem;
--space-16: 4rem;
```

---

## Missing Modern Features

| Feature | Status | Priority |
|---------|--------|----------|
| Hero section | ❌ Missing | P2 |
| Component categories | ❌ Missing | P1 |
| Bento grid layout | ❌ Missing | P2 |
| Search functionality | ❌ Non-functional | P0 |
| Responsive sidebar | ❌ Collapses without toggle | P0 |
| Dark mode toggle | ✅ Works | - |
| Syntax highlighting | ❌ Missing | P1 |
| Copy feedback toast | ❌ Uses modal | P1 |
| Scroll animations | ❌ Missing | P3 |
| Keyboard shortcuts | ❌ Missing | P2 |
| Loading states | ❌ Missing | P2 |
| Empty state examples | ⚠️ Basic | P3 |

---

## Accessibility Issues

| Issue | Location | Impact |
|-------|----------|--------|
| Missing ARIA labels | Interactive elements | Screen readers |
| No keyboard navigation | Tabs, sidebar | Motor impairment |
| Missing focus states | Some buttons | Visual impairment |
| No skip links | Page structure | Screen readers |
| Color contrast | Some text | Visual impairment |

---

## Responsive Design Issues

### Mobile (< 768px)

| Issue | Description |
|-------|-------------|
| Sidebar | Collapses with no way to re-open |
| Horizontal overflow | Some content causes scroll |
| Touch targets | Some buttons < 44x44px |
| Code blocks | No horizontal scroll indicator |

**Solution:** Add mobile menu toggle:
```svelte
<button class="mobile-menu-btn" onclick={() => sidebarOpen = !sidebarOpen}>
    <MenuIcon />
</button>
```

---

## Code Quality Issues

| Issue | Impact |
|-------|--------|
| 979 lines in one file | Unmaintainable |
| Inline SVG icons (20+) | Bloats bundle, hard to update |
| No TypeScript interfaces | Runtime errors possible |
| No prop validation | Poor DX |
| No unit tests | Regression risk |
| No component documentation | Onboarding friction |

---

## Recommended Improvements

### Phase 1: Critical Fixes (1-2 days)

| Task | Effort | Impact |
|------|--------|--------|
| Extract ComponentSection component | 2h | High |
| Make search functional | 30m | High |
| Fix mobile sidebar toggle | 1h | High |
| Only render active section | 30m | Medium |

### Phase 2: Visual Polish (1 day)

| Task | Effort | Impact |
|------|--------|--------|
| Add syntax highlighting (Prism) | 2h | High |
| Replace inline SVGs with icon component | 2h | Medium |
| Add copy feedback toast | 1h | Medium |
| Add component categories | 1h | Medium |

### Phase 3: Modern Features (2 days)

| Task | Effort | Impact |
|------|--------|--------|
| Add hero section with branding | 3h | Medium |
| Implement Bento grid layout | 4h | High |
| Add keyboard shortcuts | 2h | Medium |
| Add scroll animations | 2h | Low |
| Add loading states | 2h | Medium |

---

## Design Checklist

Based on modern-frontend-design skill standards:

### Typography
- [ ] Strong type hierarchy (display > h1 > h2 > body)
- [ ] Negative letter-spacing on headings (-0.02em to -0.04em)
- [ ] Body text 16-18px with 1.5-1.7 line height
- [ ] Lines capped at 65-75 characters

### Spacing
- [ ] Consistent spacing scale
- [ ] Generous section padding (80-128px desktop)
- [ ] Intentional whitespace

### Color & Polish
- [ ] Primary color used sparingly
- [ ] 4.5:1 contrast for body text
- [ ] Subtle, purposeful gradients
- [ ] Hover/focus states on all interactive elements
- [ ] Tinted shadows (not pure black)

### Overall
- [ ] Premium, modern appearance
- [ ] Resembles high-end SaaS products
- [ ] Design serves specific niche
- [ ] Trustworthy and professional

---

## File Structure Recommendation

```
src/routes/ui-lib/
├── +page.svelte                    # Main layout (~100 lines)
├── +page.ts                        # Data loading
├── components/
│   ├── ComponentSection.svelte     # Section wrapper
│   ├── ComponentPreview.svelte     # Preview panel
│   ├── CodeBlock.svelte            # Code display with syntax highlighting
│   ├── PropsTable.svelte           # Props documentation
│   ├── TabPanel.svelte             # Tab navigation
│   └── Sidebar.svelte              # Navigation sidebar
├── data/
│   └── components.ts               # Component definitions
└── styles/
    └── ui-lib.css                  # Page-specific styles
```

---

## Component Data Structure

```typescript
interface ComponentDefinition {
    id: string;
    name: string;
    icon: string;
    category: 'feedback' | 'data-display' | 'forms' | 'layout' | 'overlays';
    description: string;
    props: PropDefinition[];
    code: string;
    preview: Snippet;
}

interface PropDefinition {
    name: string;
    type: string;
    default: string;
    required: boolean;
    description: string;
}
```

---

## Next Steps

1. **Immediate:** Create `ComponentSection.svelte` to eliminate duplication
2. **Short-term:** Fix search and mobile responsiveness
3. **Medium-term:** Add syntax highlighting and visual polish
4. **Long-term:** Consider design system documentation site

---

## References

- Design skill: `.opencode/skills/modern-frontend-design/SKILL.md`
- Reference HTML: `docs/design/ui-lib.html`
- App styles: `src/app.css`
- Components: `src/lib/components/`
