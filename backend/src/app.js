const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const dotenv = require("dotenv");
const qr = require('qrcode');
const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config({ path: '../.env' });

const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gymapp' 
});

db.connect((error)=>{
    if(error){
        console.log(error)
    }else{
        console.log("MySQL Connected...")
    }
})

app.use(cors({
    credentials: true,
    origin:["http://localhost:4200"]
}))

const port = 5000;

app.listen(port, ()=>{
    console.log("Website served on " + port)
})

async function generateQrCode(data) {
    try {
        const jsonString = JSON.stringify(data);
        return await qr.toDataURL(jsonString); // Generiše QR kod u Base64 formatu
    } catch (err) {
        console.error('Greška pri generisanju QR koda:', err);
        throw new Error('Neuspešno generisanje QR koda');
    }
}
//slanje mejla 
async function sendEmailWithQrCode(recipient, qrData) {
    try {
        const qrCodeBase64 = await generateQrCode(qrData);
        const qrCodeBuffer = Buffer.from(qrCodeBase64.split(',')[1], 'base64'); // Konvertujemo Base64 u Buffer

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipient,
            subject: 'Vaš QR Kod za ulazak',
            text: 'Poštovani, ovde je vaš QR kod za ulazak.',
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrCodeBuffer,
                    encoding: 'base64'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Mejl uspešno poslat:', info.response);
    } catch (error) {
        console.error('Greška pri slanju mejla:', error);
    }
}

//get all data
app.get('/users', (req,res)=>{
    let qr = `SELECT * FROM users`

    db.query(qr, (err,result)=>{
        if(err){
            console.log(err, 'errs');
            return res.status(500).json({ message: "Database error", error: err });
        }
        if(result.length>0){
            res.send({
                message: 'All user data',
                data:result
            })
        }else{
            return res.status(404).json({ message: "No users found" });
        }
    })
})

//get one data
app.get('/user/:id',(req,res)=>{
    let userId = req.params.id

    let oneUser = `SELECT * FROM users WHERE id = ${userId}`;

    db.query(oneUser,(err,result)=>{
        if(err){console.log(err)}

        if(result.length>0){
            res.send({
                message: 'Get single data',
                data:result
            })
        }else{
            return res.status(404).json({ message: "No user found" });
        }
    })

})

//create data
app.post('/user', (req, res) => {
    let ime = req.body.ime;
    let prezime = req.body.prezime;
    let email = req.body.email;
    let password = 123;
    let type = req.body.type;

    let broj_ulazaka = 0;
    let admin = 0;
    let trener = 0;

    if (type === 'korisnik') {
        broj_ulazaka = 30;
    } else if (type === 'trener') {
        broj_ulazaka = 365;
        trener = 1;
    } else if (type === 'admin') {
        admin = 1;
    }

    let now = new Date();
    let datum_pocetka_clanstva = now.toISOString().split('T')[0];
    let datum_isteka_clanstva = new Date();
    datum_isteka_clanstva.setMonth(datum_isteka_clanstva.getMonth() + 12);
    datum_isteka_clanstva = datum_isteka_clanstva.toISOString().split('T')[0];
    let qr_kod = generateQrCode();

    // Provera da li email već postoji u bazi
    let checkEmailQuery = `SELECT * FROM users WHERE email = ?`;

    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            return res.send({ message: 'Greška u bazi podataka' });
        }

        if (results.length > 0) {
            return res.send({ message: 'Email je već zauzet!' });
        }

        if (!ime || !prezime || !email || !type) {
            return res.send({ message: 'Sva polja su obavezna!' });
        }
        if (!email.includes('@')) {
            return res.send({ message: 'Email nije validan!' });
        }

        // Nastavljamo sa unosom korisnika
        let insertQuery = `INSERT INTO users(ime,prezime,email,password,broj_ulazaka,datum_pocetka_clanstva,datum_isteka_clanstva,qr_kod,admin,trener) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(insertQuery, [ime, prezime, email, password, broj_ulazaka, datum_pocetka_clanstva, datum_isteka_clanstva, qr_kod, admin, trener], (err, result) => {
            if (err) {
                console.log(err);
                return res.send({ message: 'Greška pri dodavanju korisnika' });
            }
            res.send({ message: 'Korisnik uspešno dodat' });
        });
    });
});

//update user data
app.put('/user/:id',(req,res)=>{

    let userId = req.params.id;
    let ime = req.body.ime
    let prezime = req.body.prezime
    let email = req.body.email
    let password = req.body.password
    let broj_ulazaka = req.body.broj_ulazaka
    let datum_pocetka_clanstva = req.body.datum_pocetka_clanstva
    let datum_isteka_clanstva = req.body.datum_isteka_clanstva
    let qr_kod = req.body.qr_kod
    let admin = req.body.admin
    let trener = req.body.trener

    let qr = `UPDATE users 
    SET ime = '${ime}', 
        prezime = '${prezime}', 
        email = '${email}', 
        password = '${password}', 
        broj_ulazaka = '${broj_ulazaka}', 
        datum_pocetka_clanstva = '${datum_pocetka_clanstva}', 
        datum_isteka_clanstva = '${datum_isteka_clanstva}', 
        qr_kod = '${qr_kod}', 
        admin = '${admin}', 
        trener = '${trener}' 
    WHERE id = '${userId}'`;
    
    db.query(qr,(err,result)=>{
        if(err){console.log(err)}
        res.send({
            message: 'Korisnik uspešno ažuriran'
        })
    })
})

//delete user data
app.delete('/user/:id',(req,res)=>{
    let userId = req.params.id;

    let qr = `DELETE FROM users WHERE id = '${userId}'`

    db.query(qr,(err,result)=>{
        if(err){console.log(err)}
        res.send({
            message: 'data deleted'
        })
    })
})

//buy ticket for user 
app.post('/buyTicket', async (req, res) => {

    let ime = req.body.ime;
    let prezime = req.body.prezime;
    let email = req.body.email;
    let password = 123;
    let broj_ulazaka = 0;
    let admin = 0;
    let trener = 0;
    let vrstaKarte = req.body.vrstaKarte

    let now = new Date();
    let datum_pocetka_clanstva = now.toISOString().split('T')[0];
    let datum_isteka_clanstva = new Date();

    if (vrstaKarte === "mesecna") {
        datum_isteka_clanstva.setMonth(datum_isteka_clanstva.getMonth() + 1);
        broj_ulazaka = 30;
    } else if (vrstaKarte === "dnevna") {
        datum_isteka_clanstva.setDate(datum_isteka_clanstva.getDate() + 1);
        broj_ulazaka = 1;
    }
    datum_isteka_clanstva = datum_isteka_clanstva.toISOString().split('T')[0];

    let qr_kod = {
        ime,
        prezime,
        email,
        vrstaKarte,
        datum_pocetka_clanstva,
        datum_isteka_clanstva,
        broj_ulazaka
    };

    try {
        let qrCodeImage = await generateQrCode(qr_kod); // Generišemo QR kod iz JSON objekta

        let checkEmailQuery = `SELECT * FROM users WHERE email = ?`;
        db.query(checkEmailQuery, [email], (err, results) => {
            if (err) {
                return res.send({ message: 'Greška u bazi podataka' });
            }

            if (results.length > 0) {
                return res.send({ message: 'Email je već zauzet!' });
            }

            if (!ime || !prezime || !email || !vrstaKarte) {
                return res.send({ message: 'Sva polja su obavezna!' });
            }
            if (!email.includes('@')) {
                return res.send({ message: 'Email nije validan!' });
            }

            let insertQuery = `INSERT INTO users(ime,prezime,email,password,broj_ulazaka,datum_pocetka_clanstva,datum_isteka_clanstva,qr_kod,admin,trener) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            db.query(insertQuery, [ime, prezime, email, password, broj_ulazaka, datum_pocetka_clanstva, datum_isteka_clanstva, JSON.stringify(qr_kod), admin, trener], async(err, result) => {
                if (err) {
                    console.log(err);
                    return res.send({ message: 'Greška pri dodavanju korisnika!' });
                }
                try {
                    await sendEmailWithQrCode(email, qr_kod); // Slanje mejla sa QR kodom
                    res.send({ message: 'Uspešno ste uplatili članarinu', qrCode: qrCodeImage });
                } catch (emailErr) {
                    console.log(emailErr);
                    res.send({ message: 'Uspešno ste uplatili članarinu, ali došlo je do greške pri slanju mejla!' });
                }
            });
        });
    } catch (err) {
        res.send({ message: 'Greška pri generisanju QR koda' });
    }
});

//login user

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.query(query, [email, password], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ message: 'Greška u bazi podataka' });
        }

        if (result.length > 0) {
            const user = result[0];

            // Generisanje JWT tokena
            const token = jwt.sign({ id: user.id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '1h' });

            res.send({ message: 'Uspešno ste se prijavili', token });
        } else {
            res.send({ message: 'Pogrešan email ili lozinka!' });
        }
    });
});

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).send({ message: 'Pristup zabranjen! Token nije obezbeđen.' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Nevažeći token!' });
        }
        req.user = decoded;
        next();
    });
};

app.post('/logout', (req, res) => {
    res.send({ message: 'Uspešno ste se odjavili' });
});

app.get('/admin', verifyToken, (req, res) => {
    res.send({ message: 'Dobrodošli u Admin panel', user: req.user });
});

app.post('/checkMembership', (req, res) => {
    const { email } = req.body;
    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).send({ message: 'Greška u bazi podataka' });
        }
        if (!email.includes('@')) {
            return res.send({ message: 'Email nije validan!' });
        }
        if (result.length > 0) {
            const user = result[0];
            res.send({ message: 'Uspesno', user });
        } else {
            res.send({ message: 'Korisnik ne postoji!' });
        }
    });
});

//communication with arduino port 

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

// Inicijalizacija serijskog porta
const arduinoPort = new SerialPort({
    path: 'COM3',
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false,
    autoOpen: false // Ručno otvaranje kako bismo mogli da obradimo greške
});

// Inicijalizacija parsera
const parser = arduinoPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Otvaranje porta i obrada grešaka
arduinoPort.open((err) => {
    if (err) {
        console.error('Greška pri otvaranju porta:', err.message);
        return;
    }
    console.log('Serijski port otvoren.');
});

// Obrada podataka sa Arduina
parser.on('data', (data) => {
    console.log('Primljeni podaci:', data);
});

// Obrada grešaka na serijskom portu
arduinoPort.on('error', (err) => {
    console.error('Greška na serijskom portu:', err.message);
});




