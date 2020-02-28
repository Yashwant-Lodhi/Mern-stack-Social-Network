const express = require('express');

const auth = require('./../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Post = require('./../../models/Post');
const Profile = require('./../../models/Profile');
const User = require('./../../models/User');

const router = express.Router();

// @route   Post api/posts
// @desc    Creating Post
// @access  Private

router.post('/', [ auth, [ check('postContent', 'Post Content is required').not().isEmpty() ] ], async (req, res) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	try {
		const user = await User.findById(req.user.id).select('-password');

		const newPost = new Post({
			postContent: req.body.postContent,
			name: user.name,
			avatar: user.avatar,
			user: req.user.id
		});

		const post = await newPost.save();
		res.json(post);
	} catch (error) {
		console.log(error.message);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/posts
// @desc    Getting all Posts
// @access  Private

router.get('/', auth, async (req, res) => {
	try {
		const posts = await Post.find().sort({ date: -1 });

		res.json(posts);
	} catch (error) {
		console.error(error.message);
		res.status(500).json('Server Error');
	}
});

// @route   Get api/posts/:post_id
// @desc    Get post by Id
// @access  Public

router.get('/:post_id', async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		if (!post) {
			return res.status(400).json({ msg: 'Post not found' });
		}

		res.json(post);
	} catch (error) {
		if (error.kind == 'ObjectId') {
			return res.status(400).json({ msg: 'Post not found' });
		}
		console.error(error.message);
		res.status(500).json('Server Error');
	}
});

// @route   Delete api/posts/:post_id
// @desc    Delete post by Id
// @access  Private

router.delete('/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		if (!post) {
			return res.status(404).json({ msg: 'Post not found' });
		}

		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized to delete this post.' });
		}

		await post.remove();

		res.json({ msg: 'Post has been removed' });
	} catch (error) {
		console.error(error.message);
		res.status(500).json('Server Error');
	}
});

// @route   PUT api/posts/like/:post_id/
// @desc    Like the post by Id
// @access  Private
router.put('/like/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		//post like check

		if (post.likes.filter((like) => like.user.toString() === req.user.id).length > 0) {
			return res.status(400).json({ msg: 'Post Already Liked' });
		}

		post.likes.unshift({ user: req.user.id });

		await post.save();

		res.json(post.likes);
	} catch (error) {
		console.error(error.message);
		res.status(500).json('Server Error');
	}
});

// @route   PUT api/posts/unlike/:post_id/
// @desc    unLike the post by Id
// @access  Private
router.put('/unlike/:post_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.post_id);

		//post like check

		if (post.likes.filter((like) => like.user.toString() === req.user.id).length === 0) {
			return res.status(400).json({ msg: 'Post has not been liked yet' });
		}

		const removeIndex = post.likes.map((like) => like.user.toString()).indexOf(req.user.id);
		post.likes.splice(removeIndex, 1);

		await post.save();

		res.json(post.likes);
	} catch (error) {
		console.error(error.message);
		res.status(500).json('Server Error');
	}
});
module.exports = router;
