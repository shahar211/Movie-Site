const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const request = require('request');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');



const url= "https://api.themoviedb.org/3";
const key= "api_key=4535b7bb2cd4d8959efe68747ebb2366";
const upcoming = "/movie/upcoming?";
const nowPlaying = "/movie/now_playing?";
const searchMovie = "/search/movie?";
const base_url ="http://image.tmdb.org/t/p/";
const logoSize="original";
const firstHalf= base_url+logoSize;

let searchResults=[];
let cartResults=[];

let title=[];
const titles = ["/movie/popular?","/movie/top_rated?"];
const movieTitles = ["Popular Movies","Top Rated Movies"]; 
const cartItems = [];
const app = express();
let watchList=0;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/movieSiteUserDB",{useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const secret = "jfCuZHhfAGtTkn1RaPYr";
userSchema.plugin(encrypt, { secret: secret,encryptedFields:["password"] });


const User = new mongoose.model("User",userSchema);

app.get("/", function(req, res){

  if (Object.keys(title).length<Object.keys(titles).length) {
  titles.forEach(function(tit){
    request(url+tit+key, function (error, response, body) 
    {
        const json = JSON.parse(body);
         title.push(json.results);
    });
  });
}

  res.render("index",{posts: title,firstHalf: firstHalf,movieTitle:movieTitles,counter: watchList});
  });
  
  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
  
  app.get("/Categori/:postId", function(req, res){


    searchResults.forEach(function(result)
    {
      if (req.params.postId===result.title) {
        console.log(result);
        res.render("movieInfo",{title: result, firstHalf: firstHalf,counter: watchList});
      }
    });
  });


  app.post("/description",function(req,res)
  {
    request(url+searchMovie+key+"&query="+req.body.search, function (error, response, body) 
    {
        const json = JSON.parse(body);
        searchResults=(json.results);
    });
    res.redirect("/Categori");

  });



  app.get("/Categori", function(req, res){
    res.render("Categori",{search: searchResults, firstHalf: firstHalf,counter: watchList});
  });

  
  app.get("/description", function(req, res){
    res.render("description");
  });

  app.get("/login", function(req, res){
    res.render("login",{counter: watchList});
  });

  app.get("/signup", function(req, res){
    res.render("signup",{counter: watchList});
  });


  app.get("/watchList", function(req, res){

    if (Object.keys(cartResults).length<Object.keys(cartItems).length) {
      cartResults.splice(0, cartResults.length)
    cartItems.forEach(function(item)
    {
      request(url+"/movie/"+item + "?" + key, function (error, response, body) 
      {
          const json = JSON.parse(body);
          cartResults.push(json);
      });  
    });
  }
    res.render("watchList",{search: cartResults, firstHalf: firstHalf,counter: watchList});
  });



  app.post("/cart", function(req, res){

    watchList++;
    if(cartItems.includes(req.body.button) === false)
    {
      console.log("in");
      console.log(req.body.button);
      cartItems.push(req.body.button);
    }
    console.log(cartItems.length);
    res.redirect("/Categori");

  });

  app.post("/unWatch", function(req, res){


    const index = cartItems.indexOf(req.body.button);
    cartItems.splice(index, 1);
    watchList--;
    cartResults.splice(0, cartResults.length)

    res.redirect("/watchList");
  });

  app.post("/login",function(req,res){
     const username= req.body.username;
     const password= req.body.password;
     console.log(username);
     console.log(password);
  User.findOne({email: username}, function(err, foundUser){
if(err)
{
  console.log(err);
}
else {
  if(foundUser)
  {
    console.log("found?");
    if(foundUser.password===password)
    {
      
      res.redirect("/");
    }
  }
}
res.render("login",{counter: watchList});
});
});


  

app.post("/signup",function(req,res){
  const newUser = new User ({
    email: req.body.username,
    password: req.body.password
  });
  newUser.save(function(err)
  {
    if (err)
    {
      console.log(err);
    }
    else{
      res.redirect("/");
    }
  });
});



















  app.get("/upcoming", function(req, res){
    request(url+upcoming+key, function (error, response, body) 
    {
        const json = JSON.parse(body);
        searchResults=(json.results);
    });
    res.redirect("Categori");
  });

  app.get("/nowPlaying", function(req, res){
    request(url+nowPlaying+key, function (error, response, body) 
    {
        const json = JSON.parse(body);
        searchResults=(json.results);
    });
    res.redirect("Categori");
  });


  app.get("/bestTvShows", function(req, res){
    request(url+"/tv/popular?"+key, function (error, response, body) 
    {
        const json = JSON.parse(body);
        searchResults=(json.results);
    });
    res.redirect("Categori");
  });

