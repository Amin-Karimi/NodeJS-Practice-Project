const { User, UserStatsAggregateOptions, UserAgeAggregateOptions } = require('../../models/user');
const { UserServices } = require('../../services/user');
const { CommonServices } = require('../../services/common');
const { sendResponse } = require('../../helpers/handlers/response');
const { handleAsyncErrors, handleUserNotExistsError } = require('../../helpers/handlers/error');
const { statusCode } = require('../../config/config');

class UserController {

    constructor() {
        this._userServices = new UserServices();
        this._commonServices = new CommonServices();

        this.getUsersList = handleAsyncErrors(this.getUsersList.bind(this));
        this.getUser = handleAsyncErrors(this.getUser.bind(this));
        this.updateUser = handleAsyncErrors(this.updateUser.bind(this));
        this.deleteUser = handleAsyncErrors(this.deleteUser.bind(this));
    }

    async getUsersList(req, res, next) {
        await this._userServices.filterUser(req, res, next);
    };

    async getUser(req, res, next) {
        const { id } = req.params;
        const user = await User.findById(id).select('-_id -__v');

        handleUserNotExistsError(user, next);

        sendResponse(res, statusCode.ok, user);
    }

    async updateUser(req, res, next) {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );
        handleUserNotExistsError(updatedUser, next);

        sendResponse(res, statusCode.ok, updatedUser);
    };

    async deleteUser(req, res, next) {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        handleUserNotExistsError(deletedUser, next);

        sendResponse(res, statusCode.ok, deletedUser);
    };
}

class UserAggregationController {

    constructor() {
        this._commonServices = new CommonServices();

        this.getUserStats = handleAsyncErrors(this.getUserStats.bind(this));
        this.getFilterUserByAge = handleAsyncErrors(this.getFilterUserByAge.bind(this));
    }

    async getUserStats(req, res) {
        const result = await User.aggregate(UserStatsAggregateOptions);

        sendResponse(res, statusCode.ok, result);
    };

    async getFilterUserByAge(req, res) {
        const age = +req.params.age;
        const result = await User.aggregate(UserAgeAggregateOptions(age));

        sendResponse(res, statusCode.ok, result);
    };
}

module.exports = {
    UserController,
    UserAggregationController
};