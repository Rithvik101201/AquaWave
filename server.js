const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoDBStore = require("connect-mongodb-session")(session);
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/database");
const User = require("./models/User");

const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const songsPath = path.join(__dirname, "/songs.json");

let songs = [];
try {
  const data = fs.readFileSync(songsPath, "utf-8");
  songs = JSON.parse(data);
  console.log("Songs loaded successfully");
} catch (err) {
  console.log("Error while loading songs");
}

app.get("/api/songs", (req, res) => {
  res.json(songs);
});

const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});

app.use(
  session({
    secret: "Dont know",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

const checkAuth = (req, res, next) => {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect("/signup");
  }
};

app.get("/", checkAuth, (req, res) => {
  res.render("index");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    let userData = await User.findOne({ email });
    if (userData) {
      return res.redirect("/signup");
    }

    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    userData = new User({ email, password: hashedPassword });
    req.session.person = userData.email;
    await userData.save();
    res.redirect("/login");
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userData = await User.findOne({ email });

  if (!userData) {
    return res.redirect("/signup");
  }

  const checkPassword = await bcrypt.compare(password, userData.password);

  if (!checkPassword) {
    return res.redirect("/signup");
  }
  req.session.isAuthenticated = true;
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/signup");
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});