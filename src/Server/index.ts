import app from './App';

const port = process.env.PORT || 8080;

app.listen(port);

console.log(`Listening at http://localhost:${port}`);
