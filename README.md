# KDD MILETS presentation site

Zero-dependency static GitHub Pages site for **Feature-Informed Self-Supervised Learning for Time-Series Understanding**.

## Structure

```text
.
├── index.html                         Academic landing page
├── assets/site.css                    Responsive visual system
├── presentation/index.html            Final Marp HTML (placeholder initially)
├── downloads/                         Presentation and source downloads
├── scripts/validate-site.mjs          Relative-link and staging validator
├── .github/workflows/pages.yml        GitHub Pages deployment
├── .nojekyll                          Serve files without Jekyll processing
└── ASSET-PROVENANCE.md                Ownership and attribution boundary
```

All URLs are relative, so the site works both at a user/organization Pages domain and beneath a repository subpath.

## Stage the final presentation

Replace `presentation/index.html` with the final Marp HTML export. If the export is not self-contained, copy every referenced asset beside it while preserving the paths used by that HTML.

Populate `downloads/` with exactly:

| Site path | Artifact |
|---|---|
| `downloads/kdd-millets-feature-ssl-strong.md` | Canonical Marp source |
| `downloads/kdd-millets-feature-ssl-strong.html` | HTML presentation export; keep sibling `assets/` and `fonts/` when relocating it |
| `downloads/kdd-millets-feature-ssl-strong.pdf` | PDF export |
| `downloads/kdd-millets-feature-ssl-strong.pptx` | PowerPoint export |
| `downloads/source.zip` | Marp source, theme, notes, and supporting assets |
| `downloads/svg-assets.zip` | Reusable editable SVG figures plus provenance/data |

The landing page already references these exact filenames.

## Local preview

Serve the directory over HTTP so the iframe and relative downloads behave as they will on Pages:

```bash
python3 -m http.server 8000 --directory work/gh-pages-site
```

Then open `http://localhost:8000/`.

Avoid previewing `index.html` through a `file://` URL; browser security behavior differs for embedded local documents.

## Validation

Before the final artifacts are staged, skeleton mode permits the six known download targets to be absent:

```bash
node work/gh-pages-site/scripts/validate-site.mjs
```

After copying the rebuilt deck and archives, strict mode requires every target to exist and rejects the presentation placeholder:

```bash
node work/gh-pages-site/scripts/validate-site.mjs --strict
```

Also inspect the landing page at desktop and mobile widths and verify that the embedded deck accepts keyboard navigation and full-screen presentation.

## GitHub Pages deployment

The included workflow uses GitHub’s official Pages actions:

- `actions/configure-pages@v5`
- `actions/upload-pages-artifact@v3`
- `actions/deploy-pages@v4`

To deploy after this folder becomes the repository root:

1. In the repository settings, choose **GitHub Actions** as the Pages source.
2. Ensure the default deployment branch is `main`, or update the workflow trigger.
3. Commit the complete static site and push `main`, or run the workflow manually.

The workflow uploads the repository root as a static artifact and does not run a build step.

## Accessibility and maintenance

- Keep slide titles meaningful: the iframe has a descriptive accessible title, but slide-level accessibility remains the deck’s responsibility.
- Preserve the visible focus ring, semantic headings, skip link, and reduced-motion behavior in `assets/site.css`.
- Do not replace speaker-note citations with landing-page prose. The paper remains the primary factual source.
- Update `ASSET-PROVENANCE.md` if new photographs, logos, datasets, or third-party code are added.
