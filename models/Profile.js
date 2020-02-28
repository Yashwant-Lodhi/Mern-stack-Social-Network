const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'user'
	},
	bio: {
		type: String
	},
	location: {
		type: String
	},
	website: {
		type: String
	}
});

const Profile = mongoose.model('profile', ProfileSchema);

module.exports = Profile;
