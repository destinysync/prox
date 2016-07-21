'use strict';

var path = process.cwd();
var User = require('../models/users');
var XLSX = require('xlsx');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');

function ClickHandler() {


    this.getDownloadLink = function (req, res) {
        var localFirmwareVersion = req.url.match(/\/getDownloadLink\/(.*)&.*/)[1],
            upgradeOption = req.url.match(/&(.*)/)[1],
            arr = ['2016720','2016721','2016722','2016724','2016725','2016726','2016727'],
            downloadLink = '';
        if (upgradeOption == 'false') {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] > localFirmwareVersion) {
                    downloadLink = process.cwd() + arr[i] + '.zip';
                    res.end(downloadLink);
                    break;
                }
            }
        } else {
            downloadLink = process.cwd() + arr[arr.length - 1] + '.zip';
            res.end(downloadLink);
        }

console.log(localFirmwareVersion + "  " + upgradeOption);
    };

    this.upload = function (req, res) {

        function respond(msg) {
            res.end(msg);
        }

        var form = new formidable.IncomingForm();
        form.multiples = true;
        form.uploadDir = path.join(process.cwd(), '/uploads');
        var obj = {};

        form.on('file', function (field, file) {

            var filePath = path.join(form.uploadDir, file.name),
                fileName = file.name;

            fs.rename(file.path, filePath, function () {

                if (fileName.match(/\.xlsx$/) !== null || fileName.match(/\.xls$/) !== null) {

                    console.log(file.name + '    ' + file.name.match(/\.xlsx$/));
                    var workbook = XLSX.readFile(filePath);
                    var first_sheet_name = workbook.SheetNames[0];
                    var worksheet = workbook.Sheets[first_sheet_name];
                    var json = XLSX.utils.sheet_to_json(worksheet);
                    obj['excel'] = json[0];

                    setTimeout(function () {
                        fs.unlink(filePath, function (err) {
                            if (err) throw err;
                        });
                    }, 5000);
                } else {
                    obj['zipName'] = file.name;
                }

            });

        });


        form.on('error', function (err) {
            console.log('An error has occured: \n' + err);
        });



        function checkObj() {
            var checkObjInterval = setInterval(function () {
                if (obj.excel !== undefined && obj.zipName !== undefined) {
                    clearInterval(checkObjInterval);


                    var firmwareInfo = {固件版本: obj.excel.固件版本, 固件描述: obj.excel.固件描述},
                        firewareVersion = obj.excel.固件版本;

                    User.find({
                        '固件.主控名称': obj.excel.主控名称
                    }, function (err, result) {
                        if (err) throw err;
                        if (result[0] === undefined) {
                            var newUser = new User();
                            newUser.固件.主控名称 = obj.excel.主控名称;
                            newUser.固件.固件信息 = [firmwareInfo];
                            newUser.固件.固件版本 = [firewareVersion];

                            newUser.save(function (err) {
                                if (err) {
                                    throw err;
                                }
                            });

                            var firmwareHTML = '',
                                part1 = '<div class="row firewareInfoRow"><div class="col-lg-12"><div class="firmwareName"><b>主控名称:</b>',
                                part2 = '</div><div class="firmwareVersion"><b>固件版本:</b>',
                                part3 = '</div><div class="firmwareInfo"><b>固件描述:</b>',
                                part4 = '</div></div></div>';
                            firmwareHTML += part1 + obj.excel.主控名称 + part2 + obj.excel.固件版本 + part3 + obj.excel.固件描述 + part4;

                            respond(firmwareHTML);

                        } else {
                            User.find({
                                '固件.主控名称': obj.excel.主控名称
                            }, function (err, result) {
                                if (err) throw err;

                                if (result[0].固件.固件版本.indexOf(obj.excel.固件版本) == -1) {
                                    User.findOneAndUpdate({
                                        '固件.主控名称': obj.excel.主控名称
                                    }, {
                                        $push: {
                                            '固件.固件信息': firmwareInfo,
                                            '固件.固件版本': firewareVersion
                                        }
                                    }, {
                                        new: true
                                    }, function (err, result) {

                                        if (err) throw err;

                                        console.log('ss:     ' + JSON.stringify(result));
                                        var firmwareHTML = '',
                                            part1 = '<div class="row firewareInfoRow"><div class="col-lg-12"><div class="firmwareName"><b>主控名称:</b>',
                                            part2 = '</div><div class="firmwareVersion"><b>固件版本:</b>',
                                            part3 = '</div><div class="firmwareInfo"><b>固件描述:</b>',
                                            part4 = '</div></div></div>';
                                        firmwareHTML += part1 + obj.excel.主控名称 + part2 + obj.excel.固件版本 + part3 + obj.excel.固件描述 + part4;

                                        respond(firmwareHTML);
                                    })
                                }

                            })
                        }
                    });


                }
            }, 50);
        }

        form.on('end', function () {

            console.log('done');
            checkObj();

        });

        // parse the incoming request containing the form data
        form.parse(req);

    };


    this.displayFirmwareInfo = function (req, res) {
        User.find({}, function (err, result) {
            if (err) throw err;
            var firmwareHTML = '',
                part1 = '<div class="row firewareInfoRow"><div class="col-lg-12"><div class="firmwareName"><b>主控名称:</b>',
                part2 = '</div><div class="firmwareVersion"><b>固件版本:</b>',
                part3 = '</div><div class="firmwareInfo"><b>固件描述:</b>',
                part4 = '</div></div></div>',
                count = 0;

            for (var i = 0; i < result.length; i++) {
                if (result[i].固件 !== undefined) {
                    for (var q = 0; q < result[i].固件.固件信息.length; q++) {
                        firmwareHTML += part1 + result[i].固件.主控名称 + part2 + result[i].固件.固件信息[q].固件版本 + part3 + result[i].固件.固件信息[q].固件描述 + part4;
                    }
                }
                count++;
                if (count == result.length) {
                    res.end(firmwareHTML);
                }
            }
        })
    }
}


module.exports = ClickHandler;
