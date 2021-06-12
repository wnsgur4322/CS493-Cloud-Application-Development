// CS493 - Cloud Application Development
// Assignment 1 - API design and server implementation
// Author: Junhyeok Jeong, jeongju@oregonstate.edu
// github: wnsgur4322

const express = require('express');
const app = express();
app.use(express.json());

var business = require('./business');
var user = require('./user');

var business_attrs = ["owner", "name", "address", "city", "state", "zip", "phone", "category", "subcategory"];
var review_attrs = ["star_rate", "dollar_rate",  "user", "text"];
var review_edit_attrs = ["star_rate", "dollar_rate", "text"];
var user_attrs = ["username", "firstname", "lastname", "owned_businesses"];
var photo_attrs = ["photo_url", "caption", "user" ];
var photo_edit_attrs = ["photo_url", "caption"];

app.get('/', (req, res) => {
	res.send('Welcome to Yelp REST API!');
});

app.get('/business', (req ,res) => {
	res.send(business);
});

//get chosen business information
app.get('/business/:id', (req, res, next) =>{
        console.log("== req.params:", req.params);
        const id = req.params.id;
        if (business[id]) {
                res.status(200).send(business[id]);
        } else {
                next(); // call next middleware
        }

});

function reqValidation(req, attrs){
	var isValid = true;

	console.log(Object.keys(req.body).length);
	if (attrs.length != Object.keys(req.body).length){
		console.log("check your req.body attributes!");
		return false;
	}

	console.log("-- reqValidation function start --");
	for (attr of attrs){
		isValid = isValid && req.body[attr];
		console.log(isValid);
		if (!req.body[attr]){
			console.log("[ERR] reqValidation: ", attr, req.body[attr]);
		}

		
	}
	console.log("-- reqValidation function end --");

	return isValid && req.body;
};

function removeNull(arr){
	return arr.filter(x => x !== null)
};

 
//CREATE Request Handler
//CREATE New business information
app.post('/business', (req, res) => {
        console.log("== req.body:", req.body);

	var isUser = false;
	var user_id = undefined;

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == req.body.owner){
			user_id = i;
			isUser = true;
		}
	}

        if (reqValidation(req, business_attrs)){
                const id = business.length;
		console.log("new business ID:", id);
		business[id] = req.body;
		business[id].photos = {};
		business[id].reviews = {};
		if(isUser){
			console.log(req.body["name"]);
			user[user_id].owned_businesses.push(req.body["name"]);
		}

                res.status(201).send({          // 201 is creation code
                        id: id,
			name: business[id].name,
			owner: business[id].owner
                });
        } else {
                res.status(400).send({
                        err: "Request body needs business attribute fields"
                });
        }

});

// EDIT a chosen business
app.put('/business/:id', (req, res) =>{
	console.log("== req.params:", req.params);
	const id = req.params.id;

	var isUser = false;
	var user_id = undefined;
	var id_flag = true;

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == req.body.owner){
			user_id = i;
			isUser = true;
		}
	}

	if(!business[id]){
		id_flag = false;
	}

	if(id_flag && reqValidation(req, business_attrs)){
		if(isUser && (business[id].name != req.body.name)){
			for (let j = 0; j < (user[user_id].owned_businesses).length; j++){
				if(business[id].name == user[user_id].owned_businesses[j]){
					user[user_id].owned_businesses[j] = req.body.name;
				}
			}
		}
		business[id] = req.body;
		res.status(200).send({
			id: id,
			name: business[id].name,
			owner: business[id].owner
			});
	} else{
                res.status(400).send({
                        err: "[EDIT] reqValidation error"
                });
	}
});

// DELETE a chosen business
app.delete('/business/:id', (req, res) =>{
	console.log("== req.params:", req.params);
	const id = req.params.id;
	if(business[id]){
		delete business[id];
		business = removeNull(business);
		res.status(204).end();
		console.log("business id: " + id + " has deleted successfully");
	} else {
		res.status(400).send({
		err: "business id: " + id + " doesn't exist"
		});
	}
});

//CREATE user review
app.post('/business/:id/reviews', (req, res, next) => {
	console.log("== req.params:", req.params);
        console.log("== req.body:", req.body);

	const id = req.params.id;
	console.log("business id: ",id);
	const username = req.body.user;
	const review_contents = {};
	for (let [key, value] of Object.entries(req.body)) {
		if(key != 'user'){
			review_contents[key] = value;
		}
	}
	
	var rate_flag = true;
	var isUser = false;
	var user_id = undefined;

	if(req.body["star_rate"] > 5 || req.body["star_rate"] < 0){
		console.log("[ERR] star rate should be 0 ~ 5");
		rate_flag = false;
		
	}
	if(req.body["dollar_rate"] > 4 || req.body["dollar_rate"] < 1){
		console.log("[ERR] dollar rate should be 1 ~ 4");
		rate_flag = false;
	}

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == username){
			user_id = i;
			isUser = true;
		}
	}
	
	if (isUser && rate_flag && business[id] && reqValidation(req, review_attrs) && !(business[id].reviews[username])){

		const review_id = Object.keys(business[id].reviews).length;
		business[id].reviews[username] = review_contents;
		user[user_id].reviews[id] = business[id].reviews[username];

		console.log(business[id].reviews[username]);

		res.status(201).send({
			review_id: review_id,
			created_review: req.body

		});
	} else{
		res.status(400).send({
			err: "Please check business id, review attribute or the user had already written a review for the place"
		});
	}

});

// EDIT user review
app.put('/business/:id/reviews/:username', (req, res) =>{
	console.log("== req.params:", req.params);
        console.log("== req.body:", req.body);

	const id = req.params.id;
	console.log("business id: ",id);
	const username = req.params.username;
	var id_flag = true;
	var isUser = false;
	var user_id = undefined;

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == username){
			user_id = i;
			isUser = true;
		}
	}
	
	if( !business[id] || !business[id].reviews[username]){
		id_flag = false;
	}

	if(isUser && id_flag && reqValidation(req, review_edit_attrs)){
		business[id].reviews[username] = req.body;
		user[user_id].reviews[id] = business[id].reviews[username];

		res.status(200).send({
			business_id: id,
			review_username: username
		});
	} else{
		res.status(400).send({
			err: "Please check your editted attributes or url!"
		});
	}
});

//DELETE user review
app.delete('/business/:id/reviews/:username', (req, res, next) =>{
	console.log("== req.params:", req.params);
        console.log("== req.body:", req.body);

	const id = req.params.id;
	console.log("business id: ",id);
	const username = req.params.username;
	var isUser = false;
	var user_id = undefined;

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == username){
			user_id = i;
			isUser = true;
		}
	}

	if(isUser && business[id].reviews[username]){
		delete business[id].reviews[username];
		delete user[user_id].reviews[id];
		res.status(204).end();
		console.log("the review of " + username + " in business id " + id +" has deleted successfully");
	} else{
		res.status(400).send({
			err: username + "'s review" + " doesn't exist in this business"
			});
	}

});

// user part
app.get('/user', (req, res) => {
	res.status(200).send(user);

});


//get chosen user information
app.get('/user/:username', (req, res, next) =>{
	console.log("== req.params:", req.params);
	const username = req.params.username;
	var user_id = undefined;
	var isUser = false;

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == username){
			user_id = i;
			isUser = true;
		}
	}

        if (user[user_id] && (isUser == true)) {
                res.status(200).send(user[user_id]);
        } else {
		console.log("[GET] can't find that user");
                next(); // call next middleware
        }
});

//CREATE a user
app.post('/user', (req, res) =>{
	console.log("== req.body:", req.body);

	if (reqValidation(req, user_attrs)){
		const user_id = user.length;
		console.log("new user ID:", user_id);
		user[user_id] = req.body;
		user[user_id].photos = {};
		user[user_id].reviews = {};

		res.status(201).send({
			username: req.body.username
		});
	} else{
		res.status(400).send({
			err: "Request body needs user attribute fields" 
		});
	}
});

//EDIT a chosen user
app.put('/user/:username', (req, res) =>{
	console.log("== req.params:", req.params);
	const username = req.params.username;
	var user_id = undefined;
	var isUser = false;

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == username){
			user_id = i;
			isUser = true;
		}
	}

	if (user[user_id] && isUser){
		if(reqValidation(req, user_attrs)){
			user[user_id] = req.body;
			res.status(200).send({
				user_id: user_id,
				username: user[user_id].username
			});
		}
	} else {
                res.status(400).send({
                        err: "[EDIT] reqValidation error"
                });
	}
});

// DELETE a chosen user
app.delete('/user/:username', (req, res) =>{
	console.log("== req.params:", req.params);
	const username = req.params.username;
	var user_id = undefined;
	var isUser = false;

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == username){
			user_id = i;
			isUser = true;
		}
	}

	if(user[user_id] && (isUser == true)){
		for (let j = 0; j < business.length; j++){
			if(business[j].reviews[username]){
				delete business[j].reviews[username];
			}
			if(business[j].photos[username]){
				delete business[j].photos[username];
			}
		}
		delete user[user_id];
		user = removeNull(user);
		res.status(204).end();
		console.log("user: " + username + " has deleted successfully");
	} else {
		res.status(400).send({
		err: "user: " + username + " doesn't exist"
		});
	}
});

//photo part

//CREATE photo
app.post('/business/:id/photos', (req, res) =>{
	console.log("== req.body:", req.body);
	const id = req.params.id;
	console.log("business id: ",id);
	const username = req.body.user;
	const review_contents = {};
	for (let [key, value] of Object.entries(req.body)) {
		if(key != 'user'){
			review_contents[key] = value;
		}
	}
	
	var isUser = false;
	var user_id = undefined;

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == username){
			user_id = i;
			isUser = true;
		}
	}

	if(isUser && business[id] && reqValidation(req, photo_attrs)){
		if(!business[id].photos[username]){
			business[id].photos[username] = [];
			if(!user[user_id].photos[id]){
				user[user_id].photos[id] = [];
			}
		}

		business[id].photos[username].push(review_contents);
		user[user_id].photos[id].push(review_contents);

		res.status(201).send({
			photo_owner: username,
			photo_url: req.body.photo_url,
			caption: req.body.caption
		});
	}  else{
		res.status(400).send({
			err: "Please check business id, photo attributes"
		});
	}

});

//EDIT photo
app.put('/business/:id/photos/:username/:photo_id', (req, res) =>{
	console.log("== req.params:", req.params);
        console.log("== req.body:", req.body);

	const id = req.params.id;
	console.log("business id: ",id);
	const username = req.params.username;
	const photo_id = req.params.photo_id;
	var id_flag = true;
	var isUser = false;
	var isPhoto = false;
	var user_id = undefined;

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == username){
			user_id = i;
			isUser = true;
		}
	}
	for (let j = 0; j < Object.keys(user[user_id].photos[id]).length; j++) {
		if (j == parseInt(photo_id)){
			isPhoto = true;
		}
	}
	
	if( !business[id] || !business[id].photos[username]){
		id_flag = false;
	}

	if(isUser && isPhoto && id_flag && reqValidation(req, photo_edit_attrs)){
		business[id].photos[username][photo_id] = req.body;
		user[user_id].photos[id][photo_id] = req.body;

		res.status(200).send({
			business_id: id,
			photo_id: photo_id,
			photo_username: username,
			modified_photo_url: req.body["photo_url"],
			modified_caption: req.body["caption"]
		});
	} else{
		res.status(400).send({
			err: "Please check your editted attributes or url!"
		});
	}
});

//DELETE photo
app.delete('/business/:id/photos/:username/:photo_id', (req, res) =>{
	console.log("== req.params:", req.params);
        console.log("== req.body:", req.body);

	const id = req.params.id;
	console.log("business id: ",id);
	const username = req.params.username;
	const photo_id = req.params.photo_id;
	var id_flag = true;
	var isUser = false;
	var isPhoto = false;
	var user_id = undefined;

	for (let i = 0; i < user.length; i++) {
		if (user[i].username == username){
			user_id = i;
			isUser = true;
		}
	}
	for (let j = 0; j < Object.keys(user[user_id].photos[id]).length; j++) {
		if (j == parseInt(photo_id)){
			isPhoto = true;
		}
	}
	if( !business[id] || !business[id].photos[username]){
		id_flag = false;
	}

	if(id_flag && isPhoto && isUser){
		delete business[id].photos[username][photo_id];
		business[id].photos[username] = removeNull(business[id].photos[username]);
		delete user[user_id].photos[id][photo_id];
		user[user_id].photos[id] = removeNull(user[user_id].photos[id]);
		res.status(204).end();
		console.log("the photo id " + photo_id + " of " + username + " in business id " + id +" has deleted successfully");
	} else{
		res.status(400).send({
			err: username + "'s photo" + " doesn't exist in this business"
			});
	}
});



// if '*' use, put last order because it reads all url
app.use('*', (req, res, next) => {
        res.status(404).send({
                err: "The requested resource doesn't exist: " + req.originalUrl
        });

});
 
//PORT ENVIRONMENT VARIABLE
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}..`));