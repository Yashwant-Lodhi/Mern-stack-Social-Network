const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

// @route   POST api/users
// @desc    Test Routes
// @access  Public

router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Valid Email is required').isEmail(),
		check('password', 'Password is required of 6 or more characters').isLength({ min: 6 })
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// Email not taken
			let user = await User.findOne({ email });

			if (user) {
				return res.status(400).json({ errors: [ { msg: 'Email is already taken' } ] });
			}

			//Gravatar
			const avatar = gravatar.url(email, {
				s: 200,
				r: 'pg',
				d: 'mm'
			});

			// New user
			user = new User({
				name,
				email,
				avatar,
				password
			});
			//Encrypt Password
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			await user.save();

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
