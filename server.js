const express = require('express');
const app = express();

// DB connection
const connectDB = require('./config/db');
connectDB();

// init middlewares
app.use(express.json({ extended: false }));

app.get('/', (req, res) => {
	res.send('Hello World');
});

//routers
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));

//server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server is started at port ${PORT}`);
});
