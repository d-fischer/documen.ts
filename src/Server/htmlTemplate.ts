export default function render(html: string) {
	return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Twitch.js documentation</title>
    <link rel="stylesheet" href="/static/css/style.css" />
</head>
<body>
<div id="root">${html}</div>
<script src="/static/js/bundle.js"></script>
</body>
</html>`;
}
