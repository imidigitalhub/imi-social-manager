# IMI Social Manager

**Social media planning, content management and analytics platform by IMI DIGITAL HUB.**

IMI Social Manager is a responsive, browser-based workspace for organising social content and keeping track of social media performance.

## MVP features

- **Overview dashboard** — sample audience, engagement, reach and publishing metrics.
- **Content planner** — monthly calendar for scheduled content.
- **Post manager** — create, edit, search, filter and delete drafts, scheduled posts and published-post records.
- **Analytics** — record dated performance snapshots and export them as CSV.
- **Responsive layout** — designed for desktop, tablet and mobile screens.
- **Local persistence** — posts and metric snapshots are saved in the current browser using local storage.

## Run locally

No build tools or dependencies are required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.

For a local development server, you can also run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Important notes

This first release is a front-end MVP. Dashboard figures shown on first load are illustrative sample data, not live account analytics. No social media accounts are connected, and the app does not publish posts to external platforms.

Live analytics and publishing require official platform APIs, approved applications, user authorisation, secure server-side token handling and compliance with each platform's policies. Do not put API secrets or access tokens in browser JavaScript.

Data entered in this MVP is stored locally in the browser where it is used. It is not synced between devices or users. Export recorded analytics to CSV for backup.

## Project structure

- `index.html` — application interface
- `styles.css` — responsive styling
- `app.js` — planner, post management, local storage and analytics
- `.gitignore` — common local/dependency exclusions

## Roadmap

- Connect approved social platform accounts.
- Import analytics through official APIs.
- Add secure publishing workflows where platform APIs permit.
- Add user accounts, cloud storage and team collaboration.
- Add richer reports and content performance comparisons.

## Maintainer

**IMI DIGITAL HUB**  
Email: mullarmediaandcommunications@gmail.com  
Website: https://imidigitalhub.wordpress.com/

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
