const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'londer',
    password: 'pasword',
    database: 'f21'
});

app.use(express.json());

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.post('/register', (req, res) => {
    const { username, password, role } = req.body;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved hashing av passord' });
        }

        const query = 'INSERT INTO Users (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [username, hashedPassword, role], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Feil ved innsending av brukerdata' });
            }
            res.status(201).json({ message: 'Bruker registrert' });
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM Users WHERE username = ?';
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

app.get('/books', (req, res) => {
    db.query('SELECT * FROM Biblioteksbøker', (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved henting av bøker' });
        }
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

//borrow
app.post('/borrow', authenticateToken, (req, res) => {
    const { bokID } = req.body;
    const brukerID = req.user.id;

    db.query('SELECT * FROM Biblioteksbøker WHERE bokID = ?', [bokID], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved henting av bok' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Boken finnes ikke' });
        }

        const dato_utlånt = new Date().toISOString().split('T')[0];
        const dato_forventet_returt = new Date();
        dato_forventet_returt.setDate(dato_forventet_returt.getDate() + 14);

        const query = 'INSERT INTO Utlånsoversikt (bruker_id, bok_id, dato_utlånt, dato_forventet_returt) VALUES (?, ?, ?, ?)';
        db.query(query, [brukerID, bokID, dato_utlånt, dato_forventet_returt.toISOString().split('T')[0]], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Feil ved registrering av utlån' });
            }
            res.status(201).json({ message: 'Bok utlånt', utlånID: result.insertId });
        });
    });
});

//return
app.post('/return', authenticateToken, (req, res) => {
    const { bokID } = req.body;
    const brukerID = req.user.id;

    db.query('SELECT * FROM Utlånsoversikt WHERE bruker_id = ? AND bok_id = ? AND dato_returt IS NULL', [brukerID, bokID], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Feil ved henting av utlån' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Ingen utlån funnet for denne boken' });
        }

        const dato_returt = new Date().toISOString().split('T')[0];

        db.query('UPDATE Utlånsoversikt SET dato_returt = ? WHERE id = ?', [dato_returt, result[0].id], (err, updateResult) => {
            if (err) {
                return res.status(500).json({ message: 'Feil ved oppdatering av retur' });
            }
            res.json({ message: 'Bok returnert' });
        });
    });
});

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
