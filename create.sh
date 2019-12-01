set -e
browserify index.js > bundle.js
cat head.html <(echo "<body>") <(marked README.md) <(echo "</body>") > index.html
