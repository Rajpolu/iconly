# Iconly — 3D Icon Studio

This is the same app as the single-file version, split into separate files:

- `index.html` — HTML5 shell, loads everything else
- `base.css` — page-level CSS (background, root container, error banner)
- `app.jsx` — the React app source (components, styles, icon library, Ask AI logic)
- `bootstrap.js` — fetches `app.jsx`, compiles it with Babel in the browser, and mounts the app
- `vendor-react.js`, `vendor-reactdom.js`, `vendor-babel.js` — third-party libraries (React, ReactDOM, Babel Standalone), unminified/inline copies bundled with the original file, now saved as their own scripts

## Running it

Because `bootstrap.js` uses `fetch("app.jsx")`, the browser needs the files served over `http://`, not opened directly as `file://` (browsers block that fetch for local files as a security measure).

Any static file server works, for example from inside this folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in your browser.

The in-browser JSX compilation (via Babel Standalone) means there's no build step — edit `app.jsx` and refresh the page.

## Contributing

Contributions are welcome! Whether it's a new icon, a bug fix, or an
improvement to the build setup, feel free to get involved.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-icon`)
3. Make your changes
4. Commit with a clear message (`git commit -m "Add new icon: rocket"`)
5. Push to your fork (`git push origin feature/my-icon`)
6. Open a Pull Request describing what you changed and why

Please keep PRs focused — one feature or fix per PR makes review much faster.
