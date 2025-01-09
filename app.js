const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const app = express();
const port = 3000;

//mysql kobling
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'f21'
});

app.use(express.json());

//middleware for autentisering
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403);
    jwt.verify(token, 'secretkey', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
    });
};

//rute for å hente alle bøker
app.get('/books', (req, res) => {
  db.query('SELECT * FROM Biblioteksbøker', (err, result) => {
    if (err) throw err;
    res.json(result);
    });
});

//rute for å legge til en bok (kun for bibliotekar)
app.post('/books', authenticateToken, (req, res) => {
    if (req.user.role !== 'bibliotekar') return res.sendStatus(403);
    const { tittel, forfatter, isbn } = req.body;
    const query = 'INSERT INTO Biblioteksbøker (Tittel, Forfatter, ISBN) VALUES (?, ?, ?)';
    db.query(query, [tittel, forfatter, isbn], (err, result) => {
    if (err) throw err;
    res.status(201).json({ message: 'Bok lagt til', bokID: result.insertId });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
