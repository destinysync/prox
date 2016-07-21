'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');

module.exports = function (app, passport) {

    var clickHandler = new ClickHandler();

    app.route('/upload')
        .post(clickHandler.upload);

    app.route('/')
        .get(function (req, res) {
            res.sendFile(path + '/public/index.html');
        })
        .post(clickHandler.displayFirmwareInfo);

    app.route('/logout')
        .get(function (req, res) {
            req.logout();
            res.redirect('/');
        });

    app.route('/auth/local')
        .post(passport.authenticate('local', {failureRedirect: '/login'}),
            function (req, res) {
                res.redirect('/');
            });

    app.route('/getDownloadLink/*')
        .post(clickHandler.getDownloadLink)

};
