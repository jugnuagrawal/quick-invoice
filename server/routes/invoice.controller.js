const router = require('express').Router();
const puppeteer = require('puppeteer');
const uniqueToken = require('unique-token');

const template = require('./invoice.template');

router.get('/:token', (req, res) => {
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

router.get('/test', (req, res) => {
    try {
        let content;
        let flag = !(req.query && req.query.layout && req.query.layout == 'portrait');
        let sample = req.query && req.query.sample && req.query.sample == '1' ? 1 : 2;
        content = template.getContent(JSON.parse(fs.readFileSync(path.join(__dirname, `sample_invoice_${sample}.json`))))
        res.status(200).end(content);
    } catch (e) {
        res.status(500).end(e.message);
    }
});

router.post('/', (req, res) => {
    puppeteer.launch().then(doc => {
        doc.newPage().then(page => {
            let content;
            let flag = !(req.query && req.query.layout && req.query.layout == 'portrait');
            content = template.getContent(req.body)
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

module.exports = router;