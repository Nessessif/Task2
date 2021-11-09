'use strict'

const express = require('express')
const path = require('path')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const xlsx = require('xlsx')
const multer = require('multer')
const fs = require('fs');
const app = express()
const port = process.env.PORT || 7700

//Для подключение к БД необходимо заменить данные на свои
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "task2",
    password: "12345678",
});

let fileName;

//Выбор места загрузки файлов и их имени
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        fileName = Date.now() + '.xlsx'
        cb(null, fileName)
    }
})

const upload = multer({ storage: storage })

app.set('port', port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`App listen on port ${port}\nhttp://localhost:7700/`);
})

//Запрос получения начальной страницы
app.get('/', function (req, res, next) {
    getFiles(res)
});

//Запрос загрузки файла на сервер
app.post('/uploadfile', upload.single('file'), function (req, res) {
    parseExcel(fileName)
    res.redirect('/')
});

//Запрос получения страницы с данными выбранного файла
app.get('/:name', function (req, res) {
    getData(res, req)
});

//Создание подключения к БД
connection.connect((error) => {
    if (error) {
        return console.log('Ошибка: ' + error.message);
    } else {
        return console.log('Подлючение успешно!');
    }
})

//Функция для получения списка файлов из БД и их вывода на экран
function getFiles(res) {
    let filesArray = []
    let query = 'SELECT name FROM files'
    connection.query(query, function (err, result, fields) {
        if (err)
            console.log('Ошибка: ' + err);
        else {
            result.forEach(obj => {
                filesArray.push(obj.name)
            })
            res.render('index', { title: 'Task 2', files: filesArray });
        }
    })
}

//Фуекция для считывания данных выбранного файла из БД, их обработки и вывода на экран
function getData(res, req) {
    let filesArray = []
    let classesArray = []
    let query = 'SELECT num, description from classes'
    connection.query(query, function (err, result, fields) {
        if (err)
            console.log('Ошибка: ' + err);
        else {
            result.forEach(obj => {
                classesArray.push(obj)
            })
            query = 'SELECT accounts.num, opening_balances.active AS open_active, opening_balances.passive AS open_passive, turnovers.debit, turnovers.credit, outgoing_balances.active AS out_active, outgoing_balances.passive AS out_passive FROM accounts INNER JOIN files ON accounts.id_file = files.id INNER JOIN opening_balances ON opening_balances.id_account = accounts.id INNER JOIN turnovers ON turnovers.id_account = accounts.id INNER JOIN outgoing_balances ON outgoing_balances.id_account = accounts.id WHERE files.name = ?'
            connection.query(query, [req.params.name], function (err, result, fields) {
                if (err)
                    console.log('Ошибка: ' + err);
                else {
                    result.forEach(obj => {
                        filesArray.push(obj)
                    })
                    let data = []
                    let sumClass = [0, 0, 0, 0, 0, 0]
                    let sumAll = [0, 0, 0, 0, 0, 0]
                    let sum = [0, 0, 0, 0, 0, 0]
                    let strSum = filesArray[0].num.toString().substring(0, 2)
                    let strClass = 0
                    let i = 0
                    filesArray.forEach((j, index) => {
                        if (strSum !== j.num.toString().substring(0, 2)) {
                            data.push({
                                num: strSum,
                                open_active: sum[0],
                                open_passive: sum[1],
                                debit: sum[2],
                                credit: sum[3],
                                out_active: sum[4],
                                out_passive: sum[5],
                                is_sum: true
                            })
                            strSum = j.num.toString().substring(0, 2)
                            sum = [0, 0, 0, 0, 0, 0]
                        }
                        if (strClass != 0 && strClass !== j.num.toString()[0]) {
                            data.push({
                                num: 'ПО КЛАССУ',
                                open_active: sumClass[0],
                                open_passive: sumClass[1],
                                debit: sumClass[2],
                                credit: sumClass[3],
                                out_active: sumClass[4],
                                out_passive: sumClass[5],
                                is_sum: true
                            })
                        }
                        if (strClass !== j.num.toString()[0]) {
                            sumClass = [0, 0, 0, 0, 0, 0]
                            data.push(classesArray[i])
                            i++
                            strClass = j.num.toString()[0]
                        }
                        sum[0] += j.open_active
                        sum[1] += j.open_passive
                        sum[2] += j.debit
                        sum[3] += j.credit
                        sum[4] += j.out_active
                        sum[5] += j.out_passive
                        sumClass[0] += j.open_active
                        sumClass[1] += j.open_passive
                        sumClass[2] += j.debit
                        sumClass[3] += j.credit
                        sumClass[4] += j.out_active
                        sumClass[5] += j.out_passive
                        sumAll[0] += j.open_active
                        sumAll[1] += j.open_passive
                        sumAll[2] += j.debit
                        sumAll[3] += j.credit
                        sumAll[4] += j.out_active
                        sumAll[5] += j.out_passive
                        data.push(j)
                        if (index == filesArray.length - 1) {
                            data.push({
                                num: strSum,
                                open_active: sum[0],
                                open_passive: sum[1],
                                debit: sum[2],
                                credit: sum[3],
                                out_active: sum[4],
                                out_passive: sum[5],
                                is_sum: true
                            })
                            data.push({
                                num: 'ПО КЛАССУ',
                                open_active: sumClass[0],
                                open_passive: sumClass[1],
                                debit: sumClass[2],
                                credit: sumClass[3],
                                out_active: sumClass[4],
                                out_passive: sumClass[5],
                                is_sum: true
                            })
                        }
                    })
                    data.push({
                        num: 'БАЛАНС',
                        open_active: sumAll[0],
                        open_passive: sumAll[1],
                        debit: sumAll[2],
                        credit: sumAll[3],
                        out_active: sumAll[4],
                        out_passive: sumAll[5],
                        is_sum: true
                    })
                    res.render('fileData', { title: req.params.name, rows: data });
                }
            })
        }
    })
}

//Фуенкция для парсинга exel файла и записи данных в БД
function parseExcel(file) {
    const myRe = new RegExp("\d{4}", "g");
    let wb = xlsx.readFile('./uploads/' + file);
    fs.unlinkSync('./uploads/' + file);
    let query = 'INSERT INTO files(name) VALUES (?)';
    connection.query(query, [file], function (err, result, fields) {
        if (err)
            console.log('Ошибка: ' + err);
    });
    let fileId;
    query = 'SELECT id FROM files WHERE files.name = ?'
    connection.query(query, [file], function (err, result, fields) {
        if (err)
            console.log('Ошибка: ' + err);
        else {
            fileId = result[0].id;
            let data = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
            data.forEach(obj => {
                if (obj.__EMPTY !== undefined && /\d{4}/g.test(obj['Название банка']) === true) {
                    let classId;
                    query = 'SELECT id FROM classes WHERE classes.num = ?'
                    connection.query(query, [obj['Название банка'][0]], function (err, result, fields) {
                        if (err)
                            console.log('Ошибка: ' + err);
                        else {
                            classId = result[0].id
                            query = 'INSERT INTO accounts(num, id_file, id_class) VALUES (?,?,?)';
                            connection.query(query, [obj['Название банка'], fileId, classId], function (err) {
                                if (err)
                                    console.log('Ошибка: ' + err);
                            });

                            let accountId;
                            query = 'SELECT accounts.id FROM accounts INNER JOIN files ON accounts.id_file = files.id WHERE accounts.num = ? AND files.id = ?'
                            connection.query(query, [obj['Название банка'], fileId], function (err, result, fields) {
                                if (err)
                                    console.log('Ошибка: ' + err);
                                else {
                                    accountId = result[0].id
                                    query = 'INSERT INTO opening_balances(active, passive, id_account) VALUES (?,?,?)';
                                    connection.query(query, [obj.__EMPTY, obj.__EMPTY_1, accountId], function (err) {
                                        if (err)
                                            console.log('Ошибка: ' + err);
                                    });

                                    query = 'INSERT INTO turnovers(debit, credit, id_account) VALUES (?,?,?)';
                                    connection.query(query, [obj.__EMPTY_2, obj[' '], accountId], function (err) {
                                        if (err)
                                            console.log('Ошибка: ' + err);
                                    });

                                    query = 'INSERT INTO outgoing_balances(active, passive, id_account) VALUES (?,?,?)';
                                    connection.query(query, [obj.__EMPTY_3, obj.__EMPTY_4, accountId], function (err) {
                                        if (err)
                                            console.log('Ошибка: ' + err);
                                    });
                                }
                            })
                        }
                    })
                }
            })
        }
    })
};