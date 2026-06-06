# ADINN Unipole Quotation Generator

Premium React + TypeScript quotation generator for ADINN unipole signage proposals.

## What's included

- Editable ADINN unipole quotation form
- Line item pricing with size, material, quantity, rate and GST calculations
- Editable master pricing data
- Live A4 quotation proposal preview
- Print A4 and PDF export
- Searchable saved quotation records with optional Supabase permanent database storage
- Reopen saved quotations later for editing, preview, print or PDF
- Official ADINN logo included in app header, preview, print and PDF export

## Quotation record storage

Click **Save** to store the complete quotation record. Print A4 and Download PDF also save the latest quotation before output.

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured, records are saved permanently in Supabase PostgreSQL. Without those environment variables, the app falls back to browser localStorage.

Saved records include:

- Quotation number
- Quotation date and valid-until date
- Client company, contact person, phone and email
- Project / campaign name
- Location
- Prepared by
- Line item count
- Subtotal, discount, GST and grand total
- Created and updated timestamps
- Full quotation data for reopening later

Note: Supabase is the permanent source when configured. The app also keeps a browser cache for convenience. See `SUPABASE_SETUP.md` and run `supabase-schema.sql` in Supabase SQL Editor.

## Run locally

```bash
npm install --no-audit --no-fund
npm run dev
```

Open the localhost URL shown in the terminal.

## Build

```bash
npm run build
```


## Latest fix

- Fixed Download PDF header alignment. The QUOTATION meta box now stays compact and aligned to the top-right of the A4 PDF instead of dropping below the logo.
- PDF export now captures a fixed A4 clone, so responsive preview rules do not affect the downloaded document.


## Latest layout fix

This version uses a safe two-column CSS grid for the editor and live A4 preview. The preview is kept in its own grid column and automatically stacks below the form when the browser width is not enough, so it will not overlap the quotation setup section.

## CRUD + scroll fix

This version adds broader CRUD controls and fixes the scrolling/layout behavior:

- Normal full-page scrolling works across the app.
- The live preview stacks below the editor on regular laptop/browser widths, preventing overlap.
- On very wide screens, the editor and preview can use separate columns safely.
- Line items support create, edit, duplicate, reorder, clear and delete.
- Master products/services support create, edit, duplicate and delete.
- Sizes support create, edit, duplicate and delete, including related specification blocks.
- Materials/specifications support create, edit, duplicate and delete.
- Add-ons support create, edit, duplicate and delete.
- Preview specification lines support create, edit and delete.
- Saved quotation records support search, view, open/edit, duplicate, delete and delete all.

## Multipage preview update
- Live A4 Preview now has its own vertical scroll area on desktop.
- Long quotations are no longer forced into a single A4 page.
- Print and PDF export can continue into additional pages when more line items are added.


## Supabase permanent storage update

This version adds Supabase storage for quotations. Files added:

- `src/utils/supabase.ts` for Supabase client + CRUD operations
- `supabase-schema.sql` for the quotations table and policies
- `.env.example` for local environment variable format
- `SUPABASE_SETUP.md` for step-by-step setup

