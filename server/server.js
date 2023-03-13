const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
const bcrypt = require('bcrypt')
const { sign } = require('jsonwebtoken')
var pg = require('pg');
var conString = "postgres://vpqoiofu:6xwCEq9MDTttZgbiRANukvE-UM9_s9dk@rogue.db.elephantsql.com/vpqoiofu";
var client = new pg.Client(conString);

app.use(express.json())
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));

client.connect(function (err) {
    if (err) {
        return console.error('could not connect to postgres', err);
    }
    client.query('SELECT NOW() AS "theTime"', function (err, result) {
        if (err) {
            return console.error('error running query', err);
        }
        console.log("connected");
    });
});

app.post('/register', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email
    console.log('username: ' + username + ' ' + 'password: ' + password + ' ' + 'email: ' + email)

    bcrypt.hash(password, 10).then((hash) => {
        client.query('SELECT name FROM users WHERE name = $1', [username], (err, result) => {
            if (!result.rows[0]) {
                client.query('INSERT INTO users (name,password,email) VALUES ($1,$2,$3)', [username, hash, email], (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        res.json({ com: 'registered' })
                    }
                })
            } else {
                res.json({ com: 'user exists' })
            }
        })
    })
})

app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password
    client.query('SELECT * FROM users WHERE name = $1', [username], (err, result) => {
        if (result.rows[0]) {
            bcrypt.compare(password, result.rows[0].password, (err, response) => {
                if (!response) {
                    res.json({ err: "Check your combination and try again" })
                } else {
                    const accessToken = sign({ username: username, id: result.rows[0].id }, 'secretToLogin')
                    res.json({ accessToken: accessToken, username: username })
                }
            })
        } else {
            res.json({ err: "User doesn't exists" })
        }
    })
})

app.post('/addnote', (req, res) => {
    const username = req.body.username
    const title = req.body.title
    const content = req.body.content
    const date = req.body.date

    client.query('INSERT INTO notes (name,title,text,date) VALUES ($1,$2,$3,$4)', [username, title, content, date], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.json({ com: 'added' })
        }
    })
})

app.post('/getAll', (req, res) => {
    const username = req.body.username
    client.query('SELECT notes.id,title,text,date FROM users,notes WHERE users.name=$1 AND notes.name=$1', [username], (err, result) => {
        if (err) {
            console.log(err)
        } else {
            res.json(result)
        }
    })
})

app.listen(3002, function () {
    console.log("started 3002")
})