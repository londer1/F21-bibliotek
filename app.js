// Importerer de tingene vi trenger
const express = require('express'); // Bror, dette lager serveren vår
const jwt = require('jsonwebtoken'); // For å lage tokens, sånn at folk må logge inn
const mysql = require('mysql2'); // Snakker med MySQL databasen
const bcrypt = require('bcryptjs'); // Hasher passord så ingen kan se dem, ekte hemmelig opplegg
require('dotenv').config(); // Henter hemmelige ting fra .env-fila
const path = require('path'); // Hjelper med fil-stier, så vi finner ting i prosjektet

const app = express(); // Lager selve serveren
const port = 3000; // Setter hvilken port serveren skal kjøre på

// Koble til MySQL, wallah hvis dette feiler, vi er ferdige
const db = mysql.createConnection({
    host: process.env.DB_HOST, // Henter database-host fra .env
    user: process.env.DB_USER, // Brukernavn
    password: process.env.DB_PASSWORD, // Passord
    database: process.env.DB_NAME // Databasenavn
});

// Prøver å koble til databasen, vi må sjekke om det funker
db.connect(err => {
    if (err) {
        console.error('Kunne ikke koble til databasen:', err); // Bro, hvis det feiler, vi må fikse
    } else {
        console.log('Koblet til MySQL-databasen 🔥'); // Easy peasy, vi inne
    }
});

// CORS, lar frontend snakke med backend
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000', // Kun frontend kan snakke med oss
    methods: ['GET', 'POST'], // Vi tillater bare disse metodene
    allowedHeaders: ['Authorization', 'Content-Type'] // Viktig for tokens og JSON
}));

app.use(express.json()); // Wallah, vi må lese JSON i requestene
app.use(express.static(path.join(__dirname, 'public'))); // Gjør at vi kan servere HTML-filer fra "public"-mappa

// Middleware for å sjekke om folk har riktig token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization']; // Tar ut token fra header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.sendStatus(403); // Ingen token? Bror, du får ikke komme inn
    }
    const token = authHeader.split(' ')[1]; // Fjerner "Bearer" fra token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Ugyldig token? UT
        }
        req.user = user; // Lagrer brukeren i requesten
        next(); // Lar dem gå videre
    });
};

// Lage ny bruker, wallah dette er viktig
app.post('/register', (req, res) => {
    const { username, password, role } = req.body; // Henter brukernavn, passord og rolle

    bcrypt.hash(password, 10, (err, hashedPassword) => { // Hasher passordet så ingen kan lese det
        if (err) {
            return res.status(500).json({ message: 'Feil ved hashing av passord' });
        }

        const query = 'INSERT INTO Brukere (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [username, hashedPassword, role], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Feil ved innsending av brukerdata' });
            }
            res.status(201).json({ message: 'Bruker registrert, velkommen inn bror!' });
        });
    });
});

// Login, bror du må bevise at du hører til her
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM Brukere WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved henting av bruker' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Ugyldig brukernavn eller passord' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ message: 'Feil ved passordverifisering' });
            }

            if (!isMatch) {
                return res.status(401).json({ message: 'Ugyldig brukernavn eller passord' });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token }); // Sender token så bror kan gå videre
        });
    });
});

// Hente alle bøker, men du må ha token
app.get('/books', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM Biblioteksbøker';
    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved henting av bøker' });
        }
        res.json(result); // Sender bøkene til frontend
    });
});

// Legge til ny bok, men bare bibliotekar kan gjøre det
app.post('/books', authenticateToken, (req, res) => {
    if (req.user.role !== 'bibliotekar') return res.sendStatus(403); // Ikke bibliotekar? GTFO bror

    const { tittel, forfatter, isbn } = req.body;
    const query = 'INSERT INTO Biblioteksbøker (Tittel, Forfatter, ISBN) VALUES (?, ?, ?)';
    db.query(query, [tittel, forfatter, isbn], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved innsending av bokdata' });
        }
        res.status(201).json({ message: 'Bok lagt til, bror vi bygger biblioteket!' });
    });
});

// Søke på elever, men du må være logga inn
app.get('/students', authenticateToken, (req, res) => {
    const searchQuery = req.query.search || '';
    const query = 'SELECT ElevID, CONCAT(Fornavn, " ", Etternavn) AS ElevNavn FROM Elev WHERE CONCAT(Fornavn, " ", Etternavn) LIKE ?';
    db.query(query, [`%${searchQuery}%`], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved henting av elever' });
        }
        res.json(results);
    });
});

// Hente aktive utlån
app.get('/loans', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            U.UtlånsID, 
            B.Tittel AS BokTittel, 
            CONCAT(E.Fornavn, " ", E.Etternavn) AS ElevNavn, 
            U.Utlånsdato 
        FROM Utlånsoversikt U
        JOIN Biblioteksbøker B ON U.BokID = B.BokID
        JOIN Elev E ON U.ElevID = E.ElevID
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved henting av utlån' });
        }
        res.json(results);
    });
});

// Opprette utlån
app.post('/loans', authenticateToken, (req, res) => {
    const { BokID, ElevID } = req.body;
    const query = 'INSERT INTO Utlånsoversikt (BokID, ElevID, Utlånsdato) VALUES (?, ?, NOW())';
    db.query(query, [BokID, ElevID], (err) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved oppretting av utlån' });
        }
        res.status(201).json({ message: 'Utlån opprettet, ei bror jævla nørd' });
    });
});

// Kjøre serveren
app.listen(port, () => {
    console.log(`Server running on port ${port}, bror!`);
});
