import app from './App';

const port = process.env.PORT || 8080;

app.listen(port);

// tslint:disable-next-line:no-console
console.log(`Listening at http://localhost:${port}`);
