'use strict';

const express = require('express');
var bodyParser = require('body-parser');

const server = express();
server.use(bodyParser.json());
var messages = [];

server.get('/messages', function (req, res) {
    var resultMessages = [];
    if (req.query.from === undefined && req.query.to === undefined) {
        resultMessages = messages;
    } else if (req.query.from === undefined) {
        resultMessages = messages.filter(message => message.to === req.query.to);
    } else if (req.query.to === undefined) {
        resultMessages = messages.filter(message => message.from === req.query.from);
    } else {
        resultMessages = messages.filter(message =>
            message.from === req.query.from &&
            message.to === req.query.to);
    }

    res.json(resultMessages);
});

server.post('/messages', function (req, res) {
    var newMessage = { text: req.body.text };

    if (req.query.from !== undefined) {
        newMessage.from = req.query.from;
    }

    if (req.query.to !== undefined) {
        newMessage.to = req.query.to;
    }

    messages.push(newMessage);
    res.json(newMessage);
});

module.exports = server;
