const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const path = require('path');

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Kunne ikke koble til databasen:', err);
    } else {
        console.log('Koblet til MySQL-databasen');
    }
});

const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


//autentisere token
const authHeader = req.headers['authorization'];
if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.sendStatus(403);
}
const token = authHeader.split(' ')[1];


    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        console.log('User from token:', user);
        req.user = user;
        next();
    });

    console.log('Authorization Header:', token); {
    };

//registrering
app.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved hashing av passord' });
        }

        const query = 'INSERT INTO Brukere (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [username, hashedPassword, role], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Feil ved innsending av brukerdata' });
            }

            res.status(201).json({ message: 'Bruker registrert' });
        });
    });
});

//login rute
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // sender login.html fra 'public' mappen
});

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
            res.json({ token });
        });
    });
});

app.get('/books', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM Biblioteksbøker';
    db.query(query, (err, result) => {
        if (err) {
            console.error('Feil med SQL-spørring:', err);
            return res.status(500).json({ message: 'Feil ved henting av bøker' });
        }
        console.log('Resultat fra SQL:', result);
        res.json(result);
    });
});


app.post('/books', authenticateToken, (req, res) => {
    if (req.user.role !== 'bibliotekar') return res.sendStatus(403);

    const { tittel, forfatter, isbn } = req.body;
    const query = 'INSERT INTO Biblioteksbøker (Tittel, Forfatter, ISBN) VALUES (?, ?, ?)';
    db.query(query, [tittel, forfatter, isbn], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved innsending av bokdata' });
        }
        res.status(201).json({ message: 'Bok lagt til', bokID: result.insertId });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
