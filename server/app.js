const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const puppeteer = require('puppeteer');
const uniqueToken = require('unique-token');

const template1 = require('./invoice1.template');
const template2 = require('./invoice2.template');

const PORT = process.env.PORT || 3300;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logger = log4js.getLogger('Server');
const app = express();


log4js.configure({
    appenders: { 'out': { type: 'stdout' }, server: { type: 'file', filename: 'logs/server.log', maxLogSize: 52428800 } },
    categories: { default: { appenders: ['out', 'server'], level: LOG_LEVEL } }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use((req, res, next) => {
    logger.info(req.method, req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.path);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/invoice/:token', (req, res) => {
    try {
        const token = req.params.token;
        const filePath = path.join(__dirname, 'tmp', token + '.pdf');
        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Disposition', 'attachment;filename="' + token + '.pdf"');
            fs.createReadStream(filePath).pipe(res);
            // res.sendFile(filePath);
        } else {
            res.status(200).end('File Not Found');
        }
    } catch (e) {
        res.status(500).end(e.message);
    }
});

app.post('/invoice', (req, res) => {
    puppeteer.launch().then(doc => {
        doc.newPage().then(page => {
            let content;
            let flag = !(req.query && req.query.layout && req.query.layout == 'portrait');
            if (flag) {
                content = template1.getContent(req.body)
            } else {
                content = template2.getContent(req.body)
            }
            page.setContent(content).then(pageData => {
                page.pdf({
                    landscape: flag
                }).then(data => {
                    const token = uniqueToken.token();
                    const filePathPDF = path.join(__dirname, 'tmp', token + '.pdf');
                    const filePathJSON = path.join(__dirname, 'tmp', token + '.json');
                    fs.writeFileSync(filePathPDF, data);
                    fs.writeFileSync(filePathJSON, JSON.stringify(req.body), 'utf8');
                    res.status(200).json({
                        token: token,
                        messsage: 'Invoice Created'
                    });
                }).catch(err => {
                    logger.error(err);
                    res.status(500).json({
                        message: err.message
                    });
                });
            }).catch(err => {
                logger.error(err);
                res.status(500).json({
                    message: err.message
                });
            });
        }).catch(err => {
            logger.error(err);
            res.status(500).json({
                message: err.message
            });
        });
    }).catch(err => {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    });
});

app.listen(PORT, (err) => {
    if (!err) {
        logger.info('Server is listening on port', PORT);
    } else {
        logger.error(err);
    }
});