const express = require("express");
const multer = require("multer");
const app = express();
const mysql = require("mysql2");
const { handlebars } = require("hbs");
app.set("view engine", "hbs");
app.listen(3000, () => console.log("Сервер запущен..."));
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "admin",
  database: "testdatabase",
  password: "admin"
});
hbs.registerHelper("CheckAvatar", function (variable) {

  var login = variable;
  var pathAvatar = __dirname + "\\uploads\\" + login + '.jpg';
  if (fs.existsSync(pathAvatar)) {
    return new handlebars.SafeString("<td>" + "<img src=../uploads/" + login + ".jpg alt=" + login + ".jpg></img></td>");
  }
  else {
    return new handlebars.SafeString("<td>" + "<img src=../uploads/default.jpg alt=default.jpg></img></td>");
  }
});
app.get("/users", function (request, response) {
  pool.query("SELECT * FROM users", function (err, data) {
    if (err) return console.log(err);
    response.render("users.hbs", { users: data });
  });
});
app.get("/feedbackOutput", function (request, response) {
  pool.query("SELECT * FROM feedback", function (err, data) {
    if (err) return console.log(err);
    response.render("feedbackOutput.hbs", { feedback: data });
  });
});
app.get("/feedback", function (request, response) {
  response.sendFile(__dirname + "/feedback.html");
});
app.get("/authoriz", function (request, response) {
  response.sendFile(__dirname + "/authoriz.html");
});
app.get('/Greetings.html', function (request, response) {
  let userLogin1 = request.query.login;
  fs.readFile("Greetings.html", "utf8", function (error, data) {
    let header = "Здравствуйте, " + userLogin1;
    data = data.replace("{header}", header);
    response.send(data);
  })
});
const urlencodedParser = express.urlencoded({ extended: false });
app.get("/", function (request, response) {
  response.sendFile(__dirname + "/index.html");
});
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.filename = file.originalname)
      ;
  }
})
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg") {
    cb(null, true);
  }
  else {
    cb(null, false);
  }
}
app.use(express.static(__dirname));
app.use(multer({ storage: storageConfig, fileFilter: fileFilter }).single("filedata"));
app.post("/Greetings.html", function (req, res, next) {
  let filedata = req.file;
  if (!filedata) {
    let userLogin1 = req.query.login;
    fs.readFile("Greetings.html", "utf8", function (error, data) {
      let header = "Здравствуйте, " + userLogin1;
      data = data.replace("{header}", header);
      res.send(data + "<h1>Файл не загружен</h1>");
    })
  }
  else {
    let userLogin1 = req.query.login;
    fs.readFile("Greetings.html", "utf8", function (error, data) {
      let header = "Здравствуйте, " + userLogin1;
      data = data.replace("{header}", header);
      res.send(data + "<h1>Файл загружен</h1>");
    })

    fs.rename(__dirname + "\\" + filedata.path, __dirname + "\\uploads\\" + userLogin1 + '.jpg', function (err) {
      if (err) console.log('ERROR: ' + err);
    });
  }
});
app.post("/", urlencodedParser, function (request, response) {
  {
    if (!request.body) return response.sendStatus(400);
    if (request.body.formName === "form1") {
      const userLogin = request.body.userLogin;
      const userSurname = request.body.userSurname;
      const userName = request.body.userName;
      const userPatronymic = request.body.userPatronymic;
      const userEmail = request.body.userEmail;
      const userPassword = request.body.userPassword;
      const sql = `INSERT INTO users(login ,userSurname,userName,userPatronymic,email,password) VALUES(?,?,?,?,?,?)`;
      response.redirect('/Greetings.html?login=' + userLogin);
      pool.query(sql, [userLogin, userSurname, userName, userPatronymic, userEmail, userPassword], function (err, results) {
        if (err) console.log(err);
      });
    }
  }
});
app.post("/feedback.html", urlencodedParser, function (request, response) {
  {
    if (!request.body) return response.sendStatus(400);
    const userName = request.body.userName;
    const userEmail = request.body.userEmail;
    const userQuestion = request.body.userQuestion;
    const sql = `INSERT INTO feedback(name ,email,question) VALUES(?,?,?)`;
    response.redirect("/feedback.html");
    pool.query(sql, [userName, userEmail, userQuestion], function (err, results) {
      if (err) console.log(err);
    });
  }
}
);
app.post("/authoriz.html", urlencodedParser, function (request, response) {
  {
    if (!request.body) return response.sendStatus(400);
    const userLogin = request.body.userLogin;
    const userPassword = request.body.userPassword;
    const sql = `SELECT login, password FROM users WHERE login = (?)`;
    pool.query(sql, [userLogin], function (err, results) {
      if (err) console.log(err);
      if (typeof results[0] != "undefined") {
        if (userPassword== results[0].password) {
          response.redirect('/Greetings.html?login=' + userLogin);
        }
      }  
      else
      {   
        fs.readFile("authoriz.html", "utf8", function (error, data) {
          let header = "Такого пользователя не найдено";
          data = data.replace("{Вход}", header);
          response.send(data);
        }) 
      }           
    });
    
  }
}
)
