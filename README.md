# hamzahassanain.github.io

Personal site & online résumé of **Hamza Hassanain**: Founding Software Engineer @ Repovive (YC F'26),
AWS Certified Solutions Architect – Associate, 3× ACPC Finalist.

Live at **https://hamzahassanain.github.io/**

## Stack

Plain HTML/CSS/JS with no build step, so GitHub Pages serves it as-is.

```
index.html                 all content (experience, OSS, projects, CP, volunteering, education, writing, skills)
assets/css/style.css       styles: light/dark tokens, responsive layout, print-to-résumé styles
assets/js/main.js          theme toggle, repo browser, live GitHub / Codeforces / dev.to data
assets/data/repos.js       snapshot of public repos (fallback when the GitHub API is unreachable)
scripts/update-repos.sh    regenerates repos.js from the GitHub API
.github/workflows/         weekly job that refreshes repos.js
```

## Live data

At page load, `main.js` refreshes the data below. If a request fails, the page falls back to the static values in the HTML.

- **Repos, stars, followers:** GitHub REST API (unauthenticated)
- **Codeforces ratings:** `codeforces.com/api/user.info`
- **Articles:** `dev.to/api/articles`

The CV button links straight to the PDF in
[hamza-hassanain-cv](https://github.com/HamzaHassanain/hamza-hassanain-cv), so it always serves the latest version.

## Local preview

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Updating

- Content: edit `index.html`.
- Repo snapshot: `GITHUB_TOKEN=$(gh auth token) ./scripts/update-repos.sh`, or run the *Refresh repo data* workflow.
