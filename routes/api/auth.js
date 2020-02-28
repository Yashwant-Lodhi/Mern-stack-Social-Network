const express = require('express');
const router = express.Router();

const User = require('./../../models/User');
const auth = require('./../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// @route   Get api/auth
// @desc    Test Routes
// @access  Private

router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password');

		res.json(user);
	} catch (error) {
		console.error(error.mesage);
		res.status(500).send('Server Error');
	}
});

// @route   POST api/auth
// @desc    Login
// @access  Public

router.post(
	'/',
	[ check('email', 'Valid Email is required').isEmail(), check('password', 'Password is required').exists() ],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;

		try {
			// Email not taken
			let user = await User.findOne({ email });

			if (!user) {
				return res.status(400).json({ errors: [ { msg: 'Invalid Credintials.' } ] });
			}

			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return res.status(400).json({ errors: [ { msg: 'Invalid Credintials.' } ] });
			}

			//jwt
			const payload = {
				user: {
					id: user.id
				}
			};
			jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
				if (err) throw err;
				res.json({ token });
			});
		} catch (error) {
			console.error(error.message);
			return res.status(500).send('Server Error.!');
		}
	}
);

module.exports = router;
