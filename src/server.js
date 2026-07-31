import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`the server is online http://localhost:${PORT}`)
})