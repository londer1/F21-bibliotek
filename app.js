const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

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

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type']
}));

app.use(express.json());

//middleware for authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.sendStatus(403);
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

// Login
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

// Get all books
app.get('/books', authenticateToken, (req, res) => {
    const query = 'SELECT * FROM Biblioteksbøker';
    db.query(query, (err, result) => {
        if (err) {
            console.error('Feil med SQL-spørring:', err);
            return res.status(500).json({ message: 'Feil ved henting av bøker' });
        }
        res.json(result);
    });
});

// Get students by search query
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

// Get all active loans
app.get('/loans', authenticateToken, (req, res) => {
    const query = `
        SELECT 
            U.UtlånsID, 
            B.Tittel AS BokTittel, 
            CONCAT(E.Fornavn, " ", E.Etternavn, " (ElevID ", E.ElevID, ")") AS ElevNavn, 
            U.Utlånsdato, 
            U.Returdato
        FROM 
            Utlånsoversikt U
        JOIN 
            Biblioteksbøker B ON U.BokID = B.BokID
        JOIN 
            Elev E ON U.ElevID = E.ElevID
        WHERE 
            U.Returdato IS NULL OR U.Returdato IS NOT NULL
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved henting av lån' });
        }
        console.log(results);
        res.json(results);
    });
});


// Create new loan
app.post('/loans', authenticateToken, (req, res) => {
    const { BokID, ElevID, ReturDato } = req.body;
    const query = 'INSERT INTO Utlånsoversikt (BokID, ElevID, Utlånsdato, ReturDato) VALUES (?, ?, NOW(), ?)';
    db.query(query, [BokID, ElevID, ReturDato], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved opprettelse av lån' });
        }
        res.json({ message: 'Lån opprettet!' });
    });
});


// Return book (delete loan)
app.post('/loans/return', authenticateToken, (req, res) => {
    const { UtlånsID } = req.body;
    const query = 'DELETE FROM Utlånsoversikt WHERE UtlånsID = ?';
    db.query(query, [UtlånsID], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved markering av bok som returnert' });
        }
        res.json({ message: 'Bok returnert!' });
    });
});

app.listen(port, () => {
    console.log(`Server kjører på http://localhost:${port}`);
});
