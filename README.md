# Digital Engagement Invitation

A single-page, scroll-through digital invitation — a sealed envelope that opens on tap,
an illustrated arch with the couple's names, the invitation itself, and a
**scratch-to-reveal** date. No frameworks, no build step: plain HTML, CSS and JavaScript,
ready for GitHub Pages.

```
index.html
assets/css/style.css
assets/js/config.js   ← the only file you need to edit
assets/js/app.js
```

## 1. Personalise it

Open `assets/js/config.js` and change the values. Everything the guest sees comes
from that one file — names, parents, the date, the venue, the RSVP number, the wording.

```js
window.INVITE = {
  groom: { name: "Hussein", parents: "Mr & Mrs [Groom's Family]" },
  bride: { name: "Maha",    parents: "Mr & Mrs [Bride's Family]" },
  monogram: "H&M",              // the letters on the wax seal
  ceremony: "Engagement",
  welcomeLine: "Welcome to our Engagement",
  date: { day: "10", month: "January", year: "2027",
          iso: "2027-01-10T17:00:00" },   // drives the countdown + calendar file
  ...
};
```

A few notes:

- **`date.iso`** must stay in `YYYY-MM-DDTHH:MM:SS` form. It powers the live countdown
  and the "Add to calendar" (`.ics`) download. The three scratch cards use the separate
  `day` / `month` / `year` strings, so you can write them however you like.
- **`rsvp.whatsapp`** is an international number with digits only — no `+`, no spaces
  (e.g. Lebanon `961XXXXXXXX`, Pakistan `92XXXXXXXXXX`). Leave it empty to hide the button.
- **`venue.mapsUrl`** — paste a Google Maps share link for an exact pin, or delete the
  line and a search link is built from the venue name and address.
- **`music`** — optional. Drop an mp3 into `assets/audio/` and set
  `music: "assets/audio/your-file.mp3"`. The floating toggle only appears when it's set.
  Browsers block autoplay until the guest interacts, which is why the track starts the
  moment they tap the envelope open.

## 2. Publish on GitHub Pages

1. Push this repository to GitHub.
2. **Settings → Pages**.
3. Under *Build and deployment*, choose **Deploy from a branch**.
4. Pick the branch (`main`, or whichever branch holds these files) and folder **`/ (root)`**.
5. Save. After a minute the invitation is live at:

   `https://<your-username>.github.io/<repository-name>/`

The `.nojekyll` file in the root tells Pages to serve the folder as-is rather than running
it through Jekyll.

### A custom domain (optional)

Add a file named `CNAME` at the root containing just your domain (e.g. `hussein-maha.com`),
then point a `CNAME` DNS record at `<your-username>.github.io`.

## 3. How it behaves

| Section  | What happens |
|----------|--------------|
| Envelope | The page is locked until the guest taps. The wax seal lifts, the flap folds back, the letter rises, and the scene dissolves into the invitation. |
| Hero     | An illustrated arch — the sun setting over the water, hanging lanterns, and the couple silhouetted on the shore — drawn entirely in inline SVG, so it stays sharp on any screen and adds no image weight. |
| Details  | The formal invitation: Bismillah, both names, both families, and your message. |
| The Date | Three cards covered by a scratch layer. Drag across a card to rub it away; it snaps open at roughly a third cleared, and the weekday and time fade in once all three are open. |
| Venue    | Opens Maps, or downloads a calendar event. |
| RSVP     | Opens WhatsApp with a pre-written message. |

Accessibility and fallbacks are built in: the envelope opens with Enter or Space,
a scratch card can be double-tapped instead of scratched, and everything reveals itself
immediately for guests who have "reduce motion" turned on.

## 4. Fonts

Typography comes from Google Fonts (Cormorant Garamond, Cinzel, Great Vibes, Amiri).
They load over the network; if a guest is offline the page falls back to system serifs
and still reads correctly.
