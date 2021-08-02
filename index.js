require('dotenv/config')
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const User = require('./models/user')
const Noticia = require('./models/noticia')

const app = express()
const port = process.env.PORT || 3000
const mongo = process.env.MONGODB || 'mongodb://localhost/noticias'
const session = require('express-session')

console.log(process.env.MONGODB)

const noticias = require('./routes/noticias')
const restrito = require('./routes/restrito')
const auth = require('./routes/auth')
const pages = require('./routes/pages')
const admin = require('./routes/admin')

app.use(session({ secret: 'fullstack-master' }))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use('/', auth)
app.use('/', pages)
app.use('/restrito', restrito)
app.use('/noticias', noticias)
app.use('/admin', admin)

const createInitialUser = async () => {
	const total = await User.countDocuments({})
	
	if (total === 0) {	
		const user1 = new User({
			username: 'user1',
			password: '1234',
			roles: ['restrito', 'admin']
		})

		await user1.save()

		const user2 = new User({
			username: 'user2',
			password: '1234',
			roles: ['restrito']
		})

		await user2.save()
		console.log('Created user')
	}else{
		console.log('Created user skipped')
	}

	/*const noticia = new Noticia({
		title: 'Notícia Pública'+ new Date().getTime(),
		content: 'content',
		category: 'public'
	})
	await noticia.save()

	const noticia2 = new Noticia({
		title: 'Notícia Privada'+ new Date().getTime(),
		content: 'content',
		category: 'private'
	})
	await noticia2.save()*/
}

mongoose 
	.connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		createInitialUser()
		app.listen(port, () => console.log('Listening...'))
	})
	.catch(e => console.log(e))

