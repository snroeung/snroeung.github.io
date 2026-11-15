# sarenna-roeung.com

Personal portfolio for Sarenna Roeung. It's static HTML/CSS/JS on GitHub Pages, with no build step.

- `index.html` is the home page (work, projects, film strip).
- `photographs.html` is the full photo grid.
- `css/site.css` holds the design tokens and all styles.
- `js/` contains `photos.js` (manifest + filename parser), `home.js`, `gallery.js` and `menu.js`.
- `assets/` holds the site images. See [assets/README.md](assets/README.md) for the photo naming convention.

To run it locally:

```bash
python3 -m http.server 8000
```
