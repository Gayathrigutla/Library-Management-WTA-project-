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

var msg = {
    email : "",
    password : ""
};

// GET requests

app.get('/',function(req, res){
    res.render('login.ejs', {msg: msg});
});

app.get('/SignUp',function(req, res){
    res.render('SignUp.ejs');
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

//  POST requests

app.post('/', urlencodedParser, function(req, res) {
    console.log(req.body);
    
    mysqlConnection.query("SELECT * FROM users WHERE Email = ? AND password = ?",
                            [req.body.Email, req.body.pass], function(err, result, fields) {
        if (err) throw err;
                
        console.log(result);
                
        if(result.length > 0)
        {
            res.render('wtafrontpage.ejs');
        }
        else
        {
            mysqlConnection.query("SELECT * FROM users WHERE Email = ?",
                                    [req.body.Email], function(err, result) {

                console.log(result);

                if (result.length == 0) {
                    console.log('inside if');
                    msg.email = "Invalid email ID.";
                    res.render('login.ejs', {msg: msg});
                } else {
                    console.log(result.length);
                    console.log('inisde else')
                    msg.password = "Incorrect Password.";
                    res.render('login.ejs', {msg: msg});
                }

            });
        }

    });
        
});

// to be completed..

app.post('/SignUp', urlencodedParser, function(req, res) {
    console.log(req.body);
    var user_details = {
        username : req.body.name,
        password : req.body.pass,
        Email : req.body.Email,
        Phone_number : req.body.phnumber
        
    };
    console.log(user_details);

    if(req.body.pass != req.body.cpass)
    {
        res.render('SignUp.ejs');
    }
    else
    {  
        mysqlConnection.query("INSERT INTO `new_sem4_project`.`users` SET ?",
                                [user_details], function(err, result, fields) {
            if(err)
            {
                throw err;
            }
            else
            {
                console.log(result);
                res.render('wtafrontpage.ejs');
            }
        }); 
             
    }

});

app.post('/admin', urlencodedParser, upload.single('image'), function(req, res) {
    
    console.log('inside post');
    console.log(req.file);
    console.log(req.body);
    
    var loc = __dirname + '/' + req.file.path;
    console.log(loc);

    if(req.body.bookname)
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
             
            mysqlConnection.query("SELECT * FROM `new_sem4_project`.`book` WHERE Book_name = ? AND  book_author = ?",
                                    [values.Book_name, values.book_author], function (err, result, fields) {
                if (err) throw err;
                
                console.log(result);
                
                if(result.length > 0)
                {
                    mysqlConnection.query("UPDATE `book` SET Availability = (Availability + 1) WHERE Book_name = ?", 
                                            [values.Book_name], function (err, result, fields) {
                        if(err) throw err;
                        console.log(result);
                    })

                }
                else
                {
                    console.log(values);
                    var sql = "INSERT INTO `new_sem4_project`.`book` SET ?";
                    mysqlConnection.query(sql, [values], function(err, result, fields) {
                        if(err)
                            throw err;
                        console.log(result);
                        
                    });
                }    
            });
        }
        res.render('wtafrontpage.ejs');
});




app.listen(3000);