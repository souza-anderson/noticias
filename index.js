const express = require('express')
const path = require('path')
const mongoose = require('mongoose')

const app = express()
const port = process.env.PORT || 3000
const mongo = process.env.MONGODB || 'mongodb://localhost/noticias'

app.get('/', (req, res) => res.render('index'))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static('public'))

mongoose 
    .connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        app.listen(port, () => console.log('Listening...'))
    })
    .catch(e => console.log(e))

