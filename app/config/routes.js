const webTemplate = require('../routes/template.routes');
const user = require('../routes/user.routes');
const addRequestTime = require('../middlewares/request-time.spec');
const { globalErrorHandler, routeNotFoundHandler } = require('../middlewares/error.middleware');
const { handleDbErrors } = require('../helpers/error-handler');

module.exports = (app) => {

    if (process.env.NODE_ENV === 'development') {
        app.use('*', addRequestTime);
    }

    app
        .use('/web', webTemplate)
        .use('/api/user', user);

    app
        .all('*', routeNotFoundHandler)
        .use(handleDbErrors)
        .use(globalErrorHandler);
};