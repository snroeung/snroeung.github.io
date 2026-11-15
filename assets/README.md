# assets

```
assets/
  photos/        travel photographs (naming convention below)
  photos.json    list of the photos the site shows
  site/          other site images (project screenshots, headshot)
```

## Photo naming convention

```
[city/state*]_[country*]_[YYYYMMDD]_[count*].jpg|png
```

`*` = optional. Use lowercase. Separate the parts with `_`, and put hyphens between the words inside a part.

| File | Shown as |
| --- | --- |
| `philadelphia-pa_usa_20220416.jpg` | Philadelphia, PA · USA — Apr 16, 2022 |
| `philadelphia-pa_usa_20220416_2.jpg` | second photo from the same place and day |
| `kyoto_japan_20240310.png` | Kyoto · Japan — Mar 10, 2024 |
| `iceland_20230701.jpg` | Iceland — Jul 1, 2023 |
| `20230701.jpg` | Somewhere — Jul 1, 2023 |

- The date is required, and it must be a real date.
- Add a count (`_2`, `_3`, …) only when there's more than one photo from the same city/state/country.
- A trailing 2-letter word in the city/state part shows in caps (`-pa` → `, PA`).

## Adding a photo

1. Put the file in `assets/photos/` with a name that follows the convention.
2. Add it to `assets/photos.json` with short alt text:

```json
[
  { "file": "kyoto_japan_20240310.png", "alt": "Lanterns over a narrow street at dusk" }
]
```

On every visit the home page picks photos at random: five join your headshot (`assets/site/headshot.png`) in the polaroid stack, and 12 fill the film strip. `photographs.html` shows every photo, newest first. Files whose names break the convention are skipped, with a warning in the browser console.
