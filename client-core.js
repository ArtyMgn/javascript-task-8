'use strict';

module.exports.execute = execute;
module.exports.isStar = false;

const ArgumentParser = require('argparse').ArgumentParser;
const chalk = require('chalk');
const rp = require('request-promise');

const red = chalk.hex('#f00');
const green = chalk.hex('#0f0');

const rootUrl = 'http://localhost:8080/messages';

function execute() {
    const argsParser = getArgsParser();
    const args = argsParser.parseArgs(process.argv.slice(2));

    switch (args.command) {
        case 'list':
            return getMessagesList(args.from, args.to);
        case 'send':
            return sendMessage(args.from, args.to, args.text);
        default:
            Promise.reject('client doesn\'t support this command');
            break;
    }
}

function getArgsParser() {
    const argsParser = new ArgumentParser();
    argsParser.addArgument('command', {
        help: 'command name',
        choices: ['list', 'send']
    });
    argsParser.addArgument('--from', { help: 'message sender' });
    argsParser.addArgument('--to', { help: 'message recipient' });
    argsParser.addArgument('--text', { help: 'message text' });

    return argsParser;
}

function sendMessage(from, to, text) {
    return new Promise((resolve, reject) => {
        rp(
            {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                uri: rootUrl,
                qs: getDefinedQueryArguments(from, to),
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
            method: 'GET',
            uri: rootUrl,
            qs: getDefinedQueryArguments(from, to),
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

function getDefinedQueryArguments(from, to) {
    var args = {};
    if (from) {
        args.from = from;
    }

    if (to) {
        args.to = to;
    }

    return args;
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
