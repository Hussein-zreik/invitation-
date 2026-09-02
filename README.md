# Digital Engagement Invitation

A single-page, scroll-through digital invitation — a sealed envelope that opens on tap,
an illustrated arch with the couple's names, the invitation itself, and a
**scratch-to-reveal** date. No frameworks, no build step: plain HTML, CSS and JavaScript,
ready for GitHub Pages.

```
index.html
assets/css/style.css
assets/js/config.js       ← the only file you need to edit
assets/js/app.js
assets/img/envelope.webp  ← the envelope photograph
```

## 1. Personalise it

Open `assets/js/config.js` and change the values. Everything the guest sees comes
from that one file — names, parents, the date, the venue, the RSVP number, the wording.

```js
window.INVITE = {
  groom: { name: "Hussein", fullName: "Hussein Zreik", parents: "Mr & Mrs Zreik" },
  bride: { name: "Maha",    fullName: "Maha Maatouk",  parents: "Mr & Mrs Maatouk" },
  monogram: "H&M",              // the letters on the wax seal (part of the image)
  ceremony: "Engagement",
  welcomeLine: "Welcome to our Engagement",
  date: { day: "03", month: "October", year: "2026", weekday: "Saturday",
          time: "",                       // fill in to switch the calendar file on
          iso: "2026-10-03T00:00:00" },   // drives the countdown
  ...
};
```

A few notes:

- **`name` is the short name** shown large in script; **`fullName`** is what appears on
  the invitation itself. Leave `fullName` out and the short name is used for both.
- **`date.iso`** must be in `YYYY-MM-DDTHH:MM:SS` form (venue local time). It powers the
  live countdown, and while it is empty the countdown hides itself, so nothing counts down
  to a date that is not fixed yet. It is currently set to the *start* of 3 October 2026 —
  once the hour is known, put the real start time in `iso` and in `date.time`.
- **The "Add to calendar" (`.ics`) button** needs an actual start time, so it stays hidden
  until `date.time` is filled in. A calendar entry at midnight would be worse than none.
- The three scratch cards use the separate `day` / `month` / `year` strings, so you can
  write them however you like; a `day` of `"TBC"` is left out of the line under the
  couple's names.
- **`date.weekday` and `date.time`** join into the line under the cards, and that line
  disappears entirely when both are empty.
- **`rsvp.whatsapp`** is an international number with digits only — no `+`, no spaces
  (e.g. Lebanon `961XXXXXXXX`, Pakistan `92XXXXXXXXXX`). Leave it empty to hide the button.
- **`venue.mapsUrl`** — paste a Google Maps share link for an exact pin, or delete the
  line and a search link is built from the venue name and address.
- **The monogram on the seal is part of `assets/img/envelope.webp`**, not text — changing
  the initials means editing or replacing that image. The four panels are cut from the envelope's own geometry 
  if you swap in a differently framed photo, those figures in `style.css` need to match it
  (apex 50%/55.45%, seal centred at 50%/51.8% with a radius of 18.5% of the width).
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
| Envelope | The photographed white envelope, with the gold `H&M` monogram already part of the image. The page is locked until the guest taps. All four panels of the envelope back then swing open on their own edges — the seal riding out on the top one — revealing the card lying inside, before the scene dissolves into the invitation. |
| Hero     | An arch drawn entirely in gold hairlines — the sun setting into the water, hanging lanterns, and the couple as line art. Inline SVG, so it stays sharp on any screen and adds no image weight. |
| Details  | The formal invitation: Bismillah, both names, both families, and your message. |
| The Date | Three cards covered by a gold foil layer. Drag across a card to rub it away; it snaps open at roughly a third cleared, and the weekday and time fade in once all three are open. |
| Venue    | Opens Maps, or downloads a calendar event. |
| RSVP     | Opens WhatsApp with a pre-written message. |

Accessibility and fallbacks are built in: the envelope opens with Enter or Space,
a scratch card can be double-tapped instead of scratched, and everything reveals itself
immediately for guests who have "reduce motion" turned on.

## 4. Fonts

Typography comes from Google Fonts (Playfair Display, Cinzel, Great Vibes, Amiri).
They load over the network; if a guest is offline the page falls back to system serifs
and still reads correctly.
