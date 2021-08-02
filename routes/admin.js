const express = require('express')
const router = express.Router()
const Noticia = require('../models/noticia')

router.use((req, res, next) => {
	if (req.isAuthenticated()) {
		if (req.user.roles.indexOf('admin') >= 0) {
			return next()
		} else {
			res.redirect('/')
		}
	}
	res.redirect('/login')
})

router.get('/', (req, res) => res.send('restrito'))

router.get('/noticias', async(req, res) => {
  const noticias = await Noticia.find({})
  res.render('noticias/admin', { noticias })
})

module.exports = router