'use strict';

module.exports.execute = execute;
module.exports.isStar = false;

const program = require('commander');
const chalk = require('chalk');
const rp = require('request-promise');

const red = chalk.hex('#f00');
const green = chalk.hex('#0f0');

const rootUrl = 'http://localhost:8080/messages/';

function execute() {
    return new Promise((resolve, reject) => {
        program.command('list')
            .description('show messages list')
            .option('-s, --from <sender>', 'message sender')
            .option('-r, --to <recipient>', 'message recipient')
            .action(function (params) {
                getMessagesList(params.from, params.to)
                    .then(resolve)
                    .catch(reject);
            });

        program.command('send')
            .description('send message to the server')
            .option('-s, --from <sender>', 'message sender')
            .option('-r, --to <recipient>', 'message recipient')
            .option('-t, --text <messageText>', 'message text')
            .action(function (params) {
                sendMessage(params.from, params.to, params.text)
                    .then(resolve)
                    .catch(reject);
            });

        program.parse(process.argv);
    });
}

function sendMessage(from, to, text) {
    return new Promise((resolve, reject) => {
        rp(
            {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                url: rootUrl,
                qs: { from: from, to: to },
                body: { 'text': text },
                json: true
            })
            .then(response => resolve(messageToString(response)))
            .catch(err => reject(err));
    });
}

function getMessagesList(from, to) {
    return new Promise((resolve, reject) => {
        rp({
            url: rootUrl,
            qs: { from: from, to: to },
            json: true
        })
            .then((resp) => {
                const messages = resp.map(messageToString)
                    .join('\n\n');
                resolve(messages);
            })
            .catch(err => reject(err));
    });
}

function messageToString(message) {
    var convertedMessage = '';
    if (message.from !== undefined) {
        convertedMessage += `${red('FROM')}: ${message.from}\n`;
    }

    if (message.to !== undefined) {
        convertedMessage += `${red('TO')}: ${message.to}\n`;
    }

    return convertedMessage + `${green('TEXT')}: ${message.text}`;
}
