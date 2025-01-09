const express = require('express');
const mysql = require('mysql2/promise');
const app = express();

// Konfigurer databaseforbindelsen
const db = mysql.createPool({
    host: 'localhost',
    user: 'londer', // erstatt med ditt MySQL-brukernavn
    assword: 'pasword', // erstatt med ditt MySQL-passord
    database: 'f21'
});

// Hent alle bøker
app.get('/bøker', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Biblioteksbøker');
        res.json(rows);
    } catch (error) {
        console.error('Feil under henting av bøker:', error);
        res.status(500).send('Noe gikk galt');
    }
});

// Start serveren
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server kjører på http://localhost:${PORT}`);
});
