const mysql = require('mysql');
const express = require("express");
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

var app = express();

app.set('view engine' , 'ejs');

app.use('/assets', express.static('assets'));

app.use(bodyParser.json());

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, req.body.bookid + '.' + 'png')
    }
  });
   
var upload = multer({ storage: storage });

var mysqlConnection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'password',
    database : 'new_sem4_project',
    multipleStatements : true
});

mysqlConnection.connect((err)=>{
    if(!err)
    {
        console.log('Connected');
    }
    else
    {
        console.log('Connection failed \n Error :' + JSON.stringify(err,undefined,2));
    }
});


app.get('/',function(req, res){
    res.render('wtafrontpage.ejs');
});

app.get('/cs.ejs',function(req, res){
    res.render('cs.ejs');
});

app.get('/ece.ejs',function(req, res){
    res.render('ece.ejs');
});

app.get('/eee.ejs',function(req, res){
    res.render('eee.ejs');
});

app.get('/admin', function(req, res){
       
        res.render('admin.ejs');
});

app.post('/admin', upload.single('image'), function(req, res) {
    
    console.log('inside post');
    console.log(req.file);
    console.log(req.body);

    var loc = __dirname + '/' + req.file.path;
    console.log(loc);
 
    if(req.body.bookid)
        {
            var values = {
                book_id: req.body.bookid, 
                Book_name: req.body.bookname, 
                book_author: req.body.author, 
                Image: fs.readFileSync(loc),
                Description: req.body.message, 
                Price: req.body.price, 
                Availability: '1',
                subject_code: req.body.subject
                };
            console.log(values);
            var sql = "INSERT INTO `new_sem4_project`.`book` SET ?";
            mysqlConnection.query(sql, [values], function(err, result, fields) {
                if(err)
                    throw err;
                console.log(result);
                mysqlConnection.query("SELECT book_id FROM book", function (err, result, fields) {
                    if (err) throw err;
                    console.log(result);
                });
            });
        }

        res.render('wtafrontpage.ejs');
});




app.listen(3000);