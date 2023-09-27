const { User } = require('../models/user');
const { CommonServices } = require('../services/common');
const { handlePaginationError, AppError } = require('../helpers/error-handler');
const { sendResponse } = require('../helpers/response-handler');
const { baseApiUrl, httpMethods, statusCode, HttpHeaders } = require('../config/config');

class UserServices {

    constructor() {
        this._commonServices = new CommonServices();
    }

    async filterUser(req, res, next) {

        if (this._commonServices.isEmptyObject(req.query)) {
            return UserServices.getUsersList(req.query, res);
        }

        const filteredQuery = this._commonServices.checkAndFilterQuery(User.schema, req.query);

        const selectFields = UserServices.getSelectFields(req.query);
        const sortFields = UserServices.getSortFields(req.query);
        const skipValue = UserServices.getSkipValue(req.query);

        const totalRecords = await User.countDocuments(filteredQuery);

        if (skipValue >= totalRecords) {
            return handlePaginationError(next);
        }

        const result = await User.find(filteredQuery)
            .sort(sortFields)
            .select(selectFields)
            .skip(skipValue)
            .limit(req.query.limit);

        return sendResponse(res, statusCode.ok, result);
    }

    static async getUsersList(query, res) {
        const filterResult = await User.find(query).select('-_id -__v');

        return sendResponse(res, statusCode.ok, filterResult);
    }

    static getSelectFields(query) {
        return query.fields ? query.fields.split(',').join(' ') : '-_id -__v';
    }

    static getSortFields(query) {
        return query.sort ? query.sort.split(',').join(' ') : '_id';
    }

    static getSkipValue(query) {
        return (query.page - 1) * query.limit;
    }
}

class UserApiServices {

    async createUser(userData) {
        const response = await fetch(`${baseApiUrl}/user`, {
            method: httpMethods.POST,
            headers: HttpHeaders.content.json,
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new AppError('Creating user failed', statusCode.internalServerError);
        }

        const data = await response.json();
        return data;
    }
}

module.exports = {
    UserServices,
    UserApiServices
};