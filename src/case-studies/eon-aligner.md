---
title: "Eon Aligner"
date: 2025-01-01
project-link: "https://eon-aligner-v2.webflow.io/find-your-doctor"
description: "Eon Aligner is a dental brand specializing in clear-aligner treatment. I engineered a bilingual (EN/AR) Find a Doctor locator—map-first UI with country/city filters, lazy-rendered results, cached reverse-geocoding, and CMS-driven content so marketing can update it without code."
logo: "/images/eon-aligner-logo.svg"
logo-dark: "/images/eon-aligner-logo-dark.svg"
customLogoClass: "mb-8 dark:mb-8"
header-img: "/images/eon-aligner-2.png"
header-overview: "Patients needed a fast way to discover nearby clinics. I designed and built a map-first locator with country/city filters, a lazy-rendered results list, cached reverse-geocoding, and robust boot logic to handle late-loading CMS content. The experience is fully bilingual (English/Arabic, RTL) with Arabic-aware sorting and localized UI strings. Marketing can update clinics from the CMS without developer involvement."
order: 2
---

## My Role

- **UX Engineering:** flows, interaction patterns (map → tooltip → popup), empty/loaded states.
- **Front-end Architecture & Implementation:** vanilla JS, Google Maps API, data pipeline from CMS to UI.
- **Internationalization:** Arabic (RTL) layout support, Arabic-aware sorting, localized strings.
- **Performance & Reliability:** lazy list rendering, IntersectionObserver geocoding, mutation-based readiness gates, late hydration.
- **Handover:** documentation for editors; CMS field conventions.

## Challenges

1. **Staggered content & third-party timing:**
   CMS items and filter scripts don’t arrive at the same time; starting too early produces incomplete UIs.
2. **Heavy first paint:**
   Rendering the entire list up front ballooned DOM size and slowed initial interaction.
3. **N+1 reverse-geocoding:**
   Naively resolving every address triggers a burst of network calls and jank during scroll.
4. **Bilingual/RTL behavior:**
   Names should sort naturally in Arabic; prefixes like “Dr.” / “د.” shouldn’t affect ordering. UI copy and address text must be localized.
5. **Late-arriving CMS items:**
   Additional doctors can appear seconds after load; the UI must absorb them without a hard refresh.
6. **Image & content integrity:**
   Photo src/srcset/sizes/alt need to stay in sync between CMS cards, list rows, and popups.

## Solution

### Robust readiness gates (race-condition proof)

I layered window load, Finsweet CMS events (cmsfilter, cmsload), a simple stable-count poll, and a deep MutationObserver signature. We only boot once data and attribute bindings are stable.

```js
// Wait until doctor items + their key dataset bindings stop changing.
const waitForCMSStableDeep = async ({ quietMs = 900, maxWait = 15000 } = {}) => {
  let lastSig = "", lastChange = Date.now();
  const computeSig = () => {
    const els = [...document.querySelectorAll(".doctor-item")];
    const parts = els.map(el => `${el.dataset.name||""}|${el.dataset.country||""}|${el.dataset.city||""}`);
    return `${els.length}::${parts.join("||")}`;
  };
  const changed = () => { const s = computeSig(); if (s !== lastSig) { lastSig = s; lastChange = Date.now(); } };

  const obs = new MutationObserver(changed);
  obs.observe(document.body, { childList: true, subtree: true });
  return await new Promise(res => {
    const iv = setInterval(() => (Date.now() - lastChange >= quietMs) && done(), 200);
    const to = setTimeout(done, maxWait);
    function done(){ clearInterval(iv); clearTimeout(to); obs.disconnect(); res(true); }
  });
};
```

### Lazy list rendering (fast first paint)

The list is built only after a country is selected. Before selection, we show a lightweight empty state and markers only. This keeps the initial DOM tiny and interaction responsive.

```js
countrySelect.addEventListener("change", () => {
  const selected = countrySelect.value;
  if (!selected) { showEmptyList(); showListOverlay(); return; }
  hideListOverlay();
  buildDoctorList(filterByCountry(selected));
});
```

### On-view geocoding + caching (no jank)

Addresses resolve only when list rows near the viewport intersect, and results are cached by lat/lng to avoid repeat lookups.

```js
const geocodeCache = new Map();
const geocodeOnce = (lat, lng) => {
  const key = `${lat},${lng}`;
  if (geocodeCache.has(key)) return geocodeCache.get(key);
  const p = new Promise(r => geocoder.geocode({ location:{lat,lng} },
    (res, status) => r(status==="OK" && res?.[0] ? res[0].formatted_address : null)));
  geocodeCache.set(key, p);
  return p;
};

const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  io.unobserve(e.target);
  geocodeOnce(+e.target.dataset.lat, +e.target.dataset.lng)
    .then(addr => e.target.textContent = addr || "Address not found");
}), { rootMargin: "200px 0px" });
```

### Arabic-first sorting & localized UI

Arabic pages prefer Arabic display names and use Intl.Collator for natural sorting. We strip “Dr./Doctor/د./دكتور” prefixes so the alphabetical order reflects the actual name.

```js
const IS_AR = /^ar\b/i.test(document.documentElement.lang) || document.documentElement.dir==="rtl";
const collator = new Intl.Collator(IS_AR ? ["ar","en"] : ["en","ar"], { sensitivity:"base", numeric:true });
const stripPrefix = s => s.trim().replace(/^\s*(?:dr\.?|doctor|د\.?|دكتور)\s*/i, "");
const sortKey = n => stripPrefix(n).toLocaleLowerCase();
// ...
const sorted = doctors.toSorted((a,b) => collator.compare(sortKey(a.name), sortKey(b.name)));
```

Localized strings (e.g., “Loading address…” → “جاري تحميل العنوان…”) keep status messaging native in both languages.

### Late hydration window (seamless updates)

A short MutationObserver window (~8s) watches for new .doctor-items, normalizes them, and updates markers/options/list—without reload.

```js
const beginLateHydration = (ms=8000) => {
  const seen = new WeakSet([...document.querySelectorAll(".doctor-item")]);
  const obs = new MutationObserver(muts => {
    let changed=false;
    muts.forEach(m => m.addedNodes.forEach(n => {
      if (!(n instanceof Element)) return;
      const els = n.matches(".doctor-item") ? [n] : n.querySelectorAll?.(".doctor-item");
      els && els.forEach(el => { if(seen.has(el)) return; seen.add(el); addDoctorFromEl(el); changed=true; });
    }));
    if (changed) { rebuildCountryOptions(); filterAndRender(); }
  });
  obs.observe(document.body, { childList:true, subtree:true });
  setTimeout(() => obs.disconnect(), ms);
};
```

### Image & content integrity

Photos and srcset/sizes/alt are mirrored from CMS cards into list rows and popups to preserve quality and accessibility. Alt text falls back to the doctor’s name.

### Process Overview

1. **Planning & Discovery:**
   Clarified primary task (“find a nearby clinic”), countries/cities taxonomy, CMS fields, and i18n requirements.
2. **Design & Prototyping:**
   Chose map-first with progressive disclosure: empty state → country → city → results. Defined tooltip vs. popup interaction and primary actions.
3. **Development:**
   Vanilla JS architecture: harvest CMS → normalize → renderers (markers & list). Implemented readiness gates, geocode cache, and late hydration.
4. **Testing & Optimization:**
   Cross-browser/device checks, RTL review, address resolution edge-cases, performance budget passes.
5. **Launch & Handover:**
   CMS conventions, editor guide, and notes for future analytics (filter usage, directions CTR).

## Project Images

<section>
  <div class="mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full items-start">
      <!-- Image 1 -->
      <div class="w-full">
        <img
          src="/images/png/eon-aligner-1.webp"
          alt="EON Aligner doctor finder interface showing the initial map view with location markers for dental clinics across different countries"
          class="w-full h-auto object-contain shadow-low dark:shadow-lowInverted"
        />
      </div>
      <!-- Image 2 -->
      <div class="w-full">
        <img
          src="/images/eon-aligner-2.webp"
          alt="EON Aligner doctor locator displaying country and city filter dropdowns with an interactive map showing clinic locations"
          class="w-full h-auto object-contain shadow-low dark:shadow-lowInverted"
        />
      </div>
      <!-- Image 3 -->
      <div class="w-full">
        <img
          src="/images/png/eon-aligner-3.webp"
          alt="EON Aligner doctor finder results list showing dental clinic cards with doctor names, addresses, and contact information in a filtered view"
          class="w-full h-auto object-contain shadow-low dark:shadow-lowInverted"
        />
      </div>
      <!-- Image 4 -->
      <div class="w-full">
        <img
          src="/images/png/eon-aligner-4.webp"
          alt="EON Aligner clinic detail popup showing doctor information, clinic address, contact details, and action buttons for directions and appointments"
          class="w-full h-auto object-contain shadow-low dark:shadow-lowInverted"
        />
      </div>
      <!-- Image 5 -->
      <div class="w-full">
        <img
          src="/images/png/eon-aligner-5.webp"
          alt="EON Aligner Arabic (RTL) version of the doctor finder interface demonstrating bilingual support with Arabic text and right-to-left layout"
          class="w-full h-auto object-contain shadow-low dark:shadow-lowInverted"
        />
      </div>
    </div>
  </div>
</section>
