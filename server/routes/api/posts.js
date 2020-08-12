const express = require('express');
const mongodb = require('mongodb');

const path = require('path');
const appDir = path.dirname(require.main.filename);
console.log(appDir);
console.log(process.env.NODE_PATH);
console.log("Hello");


const ENV = "local";

let config;
if (ENV === "local") {
	config = require('config/db_config.js');
} else if (ENV === "prod") {
	config = {
		user: process.env.MONGO_USER,
		password: process.env.MONGO_PASSWORD,
		cluster: process.env.MONGO_CLUSTER,
	}
}


const router = express.Router();

// Get Posts 
router.get('/', async (req, res) => {
	const posts = await loadPostsCollection();
	res.send(await posts.find({}).toArray());
});

// Add Posts
router.post('/', async (req, res) => {
	const posts = await loadPostsCollection();
	await posts.insertOne({
		text: req.body.text,
		createdAt: new Date()
	});
	res.status(201).send()
});


// Delete Posts

router.delete('/:id', async (req, res) => {
	const posts = await loadPostsCollection();
	await posts.deleteOne({ _id: new mongodb.ObjectID(req.params.id) });
	res.status(200).send()
}
)

async function loadPostsCollection() {
	const DB_NAME = "vue_express";
	const uri = "mongodb+srv://" + config.user + ":" + config.password + "@" + config.cluster + "/" + DB_NAME + "?retryWrites=true&w=majority";
	const client = await mongodb.MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true});
	return client.db('vue_express').collection('posts');
}

module.exports = router;