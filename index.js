const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const uuidv4 = require("uuid/v4"); //for Multer
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const fs = require("fs");
const util = require("util");
const { exec } = require("child_process");
const flash = require("connect-flash");
const errorController = require("./controllers/error");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");

const helmet = require("helmet");
const compression = require("compression");
const app = express();

// const csrfProtection = csrf();
const MONGODBURI = `mongodb+srv://abdelrhman:bodakaka@edu-apps.uodvh.mongodb.net/ibrahimkamel?retryWrites=true&w=majority`;

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, "pdf");
    } else {
      cb(null, "images");
    }
  },
  filename: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, file.originalname); //Appending .jpg
    } else {
      cb(null, uuidv4());
    }
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const teacherRoutes = require("./routes/teacher");
const studentRoutes = require("./routes/student");
const authRoutes = require("./routes/auth");
const ownerRoutes = require("./routes/owner");
const assistentRoutes = require("./routes/assistent");
const publicRoutes = require("./routes/public");

app.use(helmet());
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: imageStorage, fileFilter: fileFilter }).single("image")
);
// app.use(multer({ storage: filesStorage }).single('file'));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/videos", express.static(path.join(__dirname, "videos")));
app.use("/pdf", express.static(path.join(__dirname, "pdf")));

// app.use('/files', express.static(path.join(__dirname, 'files')));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, application/json"
  );
  next();
});

const store = new MongoDBStore({
  uri: MONGODBURI,
  collection: "sessions",
});
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(flash());
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  req.user = req.session.user;
  next();
  // if (req.session.user.isTeacher === true) {
  //     return Teacher.findById(req.session.user._id)
  //         .then(user => {
  //             if (!user) return next();
  //             req.user = user;
  //             next();
  //         })
  //         .catch(err => {
  //             next(new Error(err));
  //         });
  // }
  // if (req.session.user.isStudent === true) {
  //     return Student.findById(req.session.user._id)
  //         .then(user => {
  //             if (!user) { return next(); }
  //             req.user = user;
  //             next();
  //         }).catch(err => {
  //             next(new Error(err));
  //         });
  // }
  // if (req.session.user.isAssistent) {
  //     return Assistent.findById(req.session.user._id).then(user => {
  //         if (!user) { return next() }
  //         req.user = user;
  //         next();
  //     }).catch(err => {
  //         next(new Error(err));
  //     });
  // }
});

app.use("/teacher", teacherRoutes);
app.use(studentRoutes);
app.use(authRoutes);
app.use("/owner", ownerRoutes);
app.use("/assistent", assistentRoutes);
app.use("/public", publicRoutes);
app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);
  return res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
  });
});

async function updateElms(Model) {
  let items = await Model.find();
  const bulkOps = items.map((update) => ({
    updateOne: {
      filter: { _id: mongoose.Types.ObjectId(update._id) },
      // Where field is the field you want to update
      update: {
        $set: update, //update whole document
        $inc: { version: 1 }, //increase version + 1
      },
      upsert: true,
    },
  }));
  // where Model is the name of your model
  return Model.collection
    .bulkWrite(bulkOps)
    .then((results) => {
      Model.deleteMany({ _id: { $type: 2 } }).then(() => {
        console.log("done");
      });
    })
    .catch((err) => console.log(err));
}

async function createTeacher() {
  const newtea = new Teacher({
    name: "Ibrahim Kamel",
    password: "$2a$12$.m9hXgag0rMTBbiXkbhReOWG7C9g8ADna0Y/XBMgfNMKweZ/gGBCG",
    mobile: "01143451621",
    centers: [],
    isTeacher: true,
    isOwner: false,
    profileImage: "",
    requests: [],
    section: "Chimestry",
    events: [],
    assistents: [],
    membership: "23",
    stars: [],
  });
  await newtea.save();
  console.log("Created");
}

mongoose
  .connect(MONGODBURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((res) => {
    console.log("Conntected");
    // createTeacher();
  })
  .catch((error) => {
    console.log(error);
  });

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
