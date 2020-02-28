const express = require('express');
const router = express.Router();

const auth = require('./../../middleware/auth');
const Profile = require('./../../models/Profile');
const { check, validationResult } = require('express-validator');

// @route   Get api/profile/me
// @desc    Get user current profile
// @access  Private

router.get('/me', auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.user.id }).populate('user', [ 'name', 'avatar' ]);
		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile for this user' });
		}

		res.json(profile);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Server Error');
	}
});

// @route   Post api/profile
// @desc    Create and Upadate Profile
// @access  Private

router.post(
	'/',
	[
		auth,
		[
			check('bio', 'Max Length is 100').isLength({ max: 100 }),
			check('website', 'Max Length is 100').isLength({ max: 100 }),
			check('location', 'Max Length is 50').isLength({ max: 50 })
		]
	],
	async (req, res) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { bio, website, location } = req.body;

		const profileField = {};
		profileField.user = req.user.id;
		if (bio) profileField.bio = bio;
		if (website) profileField.website = website;
		if (location) profileField.location = location;
		try {
			let profile = await Profile.findOne({ user: req.user.id });
			//update
			if (profile) {
				profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileField }, { new: true });
				console.log('Updated');
				return res.json(profile);
			}

			//create
			profile = new Profile(profileField);

			await profile.save();
			res.json(profile);
			console.log('Created');
		} catch (error) {
			console.log(error.message);
			res.status(500).send('Server Error');
		}
	}
);

// @route   Get api/profile
// @desc    Get all profiles
// @access  Private

router.get('/', auth, async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', [ 'name', 'avatar' ]);

		res.json(profiles);
	} catch (error) {
		console.error(error.message);
		res.status(500).json('Server Error');
	}
});

// @route   Get api/profile/:user_id
// @desc    Get profile by Id
// @access  Public

router.get('/:user_id', async (req, res) => {
	try {
		const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [ 'name', 'avatar' ]);

		if (!profile) {
			return res.status(400).json({ msg: 'There is no profile with this id.' });
		}

		res.json(profile);
	} catch (error) {
		if (error.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'There is no profile with this id.' });
		}
		console.error(error.message);
		res.status(500).json('Server Error');
	}
});

module.exports = router;
