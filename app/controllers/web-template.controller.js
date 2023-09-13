const fs = require('fs');
const url = require('url');
const statusCode = require('../config/status-codes');
const { templates, replaceDefaultRoute, replaceTemplate } = require('../services/template');

const dataObj = JSON.parse(fs.readFileSync(`${__dirname}/../db/db.json`));

const webTemplateController = {

    listUsers: (req, res) => {
        const homeTableHtml = dataObj.map(el => replaceTemplate(templates.home.table, el)).join('');
        const tempDefaultRoute = templates.home.index
            .replace(/{%USER_DETAILS%}/g, templates.home.userDetails)
            .replace(/{%HOME_TABLE%}/g, homeTableHtml);

        const updatedIndex = replaceDefaultRoute(templates.index, tempDefaultRoute);

        res.status(statusCode.ok).end(updatedIndex);
    },

    getUserDetails: (req, res) => {
        const { query } = url.parse(req.url, true);
        try {
            const userDetailsObj = dataObj[query.id - 1];
            const tempDefaultRoute = replaceTemplate(templates.userDetails, userDetailsObj);

            const updatedIndex = replaceDefaultRoute(templates.index, tempDefaultRoute);

            res.status(statusCode.ok).end(updatedIndex);
        } catch {
            res.status(statusCode.notFound).end('<h3>Invalid ID</h3>');
        }
    },

    getJsonDb: (req, res) => {
        res.status(statusCode.ok).json(dataObj);
    },

    notFound: (req, res) => {
        const updatedIndex = replaceDefaultRoute(templates.index, templates.notFound);
        res.status(statusCode.notFound).end(updatedIndex);
    }
};

module.exports = webTemplateController;
