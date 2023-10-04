const { User } = require('../../models/user');
const { sendResponse } = require('../../helpers/handlers/response');
const { handleAsyncErrors } = require('../../helpers/handlers/error');
const { statusCode } = require('../../config/config');
const { authenticateUser } = require('../../services/auth');

class AuthController {

    constructor() {
        this.loginUser = handleAsyncErrors(this.loginUser.bind(this));
        this.registerUser = handleAsyncErrors(this.registerUser.bind(this));
    }

    async loginUser(req, res, next) {
        const { username, password } = req.body;

        const token = await authenticateUser(username, password);

        if (token) {
            res.cookie('token', token, { httpOnly: true });
            sendResponse(res, statusCode.ok, token, 'Logged in successfully');
        }
    }

    async registerUser(req, res, next) {
        const userData = req.body;

        if (userData) {
            const user = new User(userData);
            await user.save();
        }

        sendResponse(res, statusCode.created, '', 'Registered successfully');
    }
}

module.exports = {
    AuthController,
};
