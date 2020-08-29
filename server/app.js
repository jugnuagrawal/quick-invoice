const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const fileupload = require('express-fileupload');


const PORT = process.env.PORT || 3300;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logger = log4js.getLogger('server');
const app = express();


log4js.configure({
    appenders: { 'out': { type: 'stdout' }, server: { type: 'file', filename: 'logs/server.log', maxLogSize: 52428800 } },
    categories: { default: { appenders: ['out', 'server'], level: LOG_LEVEL } }
});

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: './uploads'
}))
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    logger.info(req.method, req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.path);
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api', require('./routes'));

app.listen(PORT, (err) => {
    if (!err) {
        logger.info('Server is listening on port', PORT);
    } else {
        logger.error(err);
    }
});