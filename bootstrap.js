  (function () {
    fetch("app.jsx")
      .then(function (r) { return r.text(); })
      .then(function (source) {
        var compiled = Babel.transform(source, {
          presets: [["react", { runtime: "classic" }]],
          filename: "app.jsx"
        }).code;
        var script = document.createElement("script");
        script.text = compiled + "\nReactDOM.createRoot(document.getElementById('root')).render(React.createElement(IconStudio));";
        document.body.appendChild(script);
      })
      .catch(function (e) {
        console.error(e);
      });
  })();
