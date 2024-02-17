const express = require("express");
const app = express();
const path = require("path");
const ejs = require("ejs");
const templatepath= path.join(__dirname,'./templates')
const collection = require("./src/mongodb");
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

app.use(express.json());
app.set("view engine","ejs");
app.set("views",templatepath);
app.use(express.urlencoded({extended:false}));

// Set the path to the directory containing your static files
const publicDirectoryPath = path.join(__dirname, "./public");

// Serve static files from the public directory
app.use(express.static(publicDirectoryPath));
app.get("/",(req,res)=>{
    res.render("login");
});

app.get("/signup",(req,res)=>{
    res.render("signup");
});

app.post("/signup",async (req,res)=>{
try{
const data = {
    name:req.body.name,
    password:req.body.password
}
await collection.insertMany([data])

console.log("added to database");
res.redirect('/watchlist');
}
catch(err){
    console.log(err.body);
    res.render("signup");
}
})

app.post("/login",async (req,res)=>{

    try {
        const check = await collection.findOne({name:req.body.name});
        if (check.password==req.body.password) {
           res.redirect(`/watchlist/${check._id}`);
        } else {
            console.log("wrongpassword");
            res.redirect('/login');
        }

    } catch (error) {
        console.log("invalid");
        res.redirect('/login');
    }
   
    
})

// You need to add a GET route for login
app.get("/login", (req, res) => {
    res.render("login");
});
app.get("/signup", (req, res) => {
    res.render("signup");
});

// GET route for watchlist
app.get("/watchlist/:id", async (req, res) => {
    try {
        const id =req.params.id;
        res.render("watchlist", { id: id });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/watchlist/:id", async (req, res) => {
    try {

        const user = await collection.findById(req.params.id);
        user.portfolioData.push(req.body);
        await user.save();
        res.redirect(`/watchlist/${user._id}`);
        console.log(user);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/portfolio/:id", async (req, res) => {
    try {
        const user = await collection.findById(req.params.id);
        if (!user) {
            // If user not found, handle appropriately (e.g., return a 404 page)
            return res.status(404).send("User not found");
        }
        console.log(user.portfolioData);
        res.render("portfolio", { userdata: user.portfolioData, id: req.params.id });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/portfolio/:id/:stockId", async (req, res) => {
    try {
        const id = req.params.id;
        const user = await collection.findById(id);
        const stockId = req.params.stockId;
        await user.updateOne({ $pull: { portfolioData: { _id: stockId } } });
        console.log("hey")
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(5000,()=>{
    console.log("port connected");
});

