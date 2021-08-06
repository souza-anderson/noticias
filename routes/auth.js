require('dotenv/config')
const express = require('express')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy

const router = express.Router()
const User = require('../models/user')

router.use(passport.initialize())
router.use(passport.session())

passport.serializeUser((user, done) => {
	done(null, user)
})
passport.deserializeUser((user, done) => {
	done(null, user)
})

// definindo estratégia para login local
passport.use(new LocalStrategy(async (username, password, done) => {
	const user = await User.findOne({ username })
	if (user) {
		const isValid = await user.checkPassword(password)
		if (isValid) {
			return done(null, user)
		} else {
			return done(null, false)
		}
	} else {
		return done(null, false)
	}
}))

// definindo estratégia com login do facebook
passport.use(new FacebookStrategy({
	clientID: process.env.FACEBOOK_CLIENTID,
	clientSecret: process.env.FACEBOOK_CLIENTSECRET,
	callbackURL: 'http://localhost:3000/facebook/callback',
	profileFields: ['id', 'displayName', 'email', 'photos']
}, async(accessToken, refreshToken, profile, done) => {
	const userDB = await User.findOne({ facebookId: profile.id })
	
	if (!userDB) {
		const user = new User({
			name: profile.displayName,
			facebookId: profile.id,
			roles: ['restrito']
		})
		await user.save()
		
		return done(null, user)
	} else {
		return done(null, userDB)
	}
}))

// definindo estratégia de login com google
passport.use(new GoogleStrategy({
	clientID: process.env.GOOGLE_CLIENTID,
	clientSecret: process.env.GOOGLE_CLIENTSECRET,
	callbackURL: 'http://localhost:3000/google/callback',
}, async(accessToken, refreshToken,err, profile, done) => {
	const userDB = await User.findOne({ googleId: profile.id })
	
	if (!userDB) {
		const user = new User({
			name: profile.displayName,
			googleId: profile.id,
			roles: ['restrito']
		})
		await user.save()
		
		return done(null, user)
	} else {
		return done(null, userDB)
	}
}))

router.use((req, res, next) => {
	// if ('user' in req.session) {
  //   res.locals.user = req.session.user
  // }

	if (req.user) {
		res.locals.user = req.user
		if (!req.session.role) {
			req.session.role = req.user.roles[0]
		}
		res.locals.role = req.session.role
	}
	next()
})

router.get('/change-role/:role', (req, res) => {
	if (req.isAuthenticated()) {
		if (req.user.roles.indexOf(req.params.role) >= 0) {
			req.session.role = req.params.role
		}
	}
	res.redirect('/')
})

router.get('/login', (req, res) => {
	res.render('login')
})
router.get('/logout', (req, res) => {
	req.session.destroy(() => {
		res.redirect('/')
	})
})
router.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	failureRedirect: '/login',
	failureFlash: false
}))

// app.post('/login', async (req, res) => {
//   const user = await User.findOne({ username: req.body.username })
//   const isValid = await user.checkPassword(req.body.password)

//   if (isValid) {
//     req.session.user = user
//     res.redirect('/restrito/noticias')
//   } else {
//     res.redirect('/login')
//   }
// })

router.get('/facebook', passport.authenticate('facebook'))
router.get('/facebook/callback', passport.authenticate('facebook', {
	failureRedirect: '/'
}), (req, res) => {
	res.redirect('/')
})

router.get('/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile'] }))
router.get('/google/callback', passport.authenticate('google', {
	failureRedirect: '/',
	successRedirect: '/'
}))

module.exports = router