const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
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
    console.log(username + ' ' + password + ' ' + email)
    res.json({ com: 'passed' })

})

app.listen(3002, function () {
    console.log("started 3002")
})