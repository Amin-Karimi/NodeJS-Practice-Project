const jwt = require('jsonwebtoken');
const CryptoJS = require('crypto-js');
const { User } = require('../models/user');
const { AppError } = require('../helpers/handlers/error');
const { statusCode } = require('../config/config');
const { jwtSecretKey, cyptoSecretKey } = require('../config/auth');

const authenticateUser = async (username, password) => {

    if (!username || !password) {
        throw new AppError('Username and password are required.', statusCode.badRequest);
    }

    const user = await User.findOne({ username }).select('_id role +password isActive');

    if (!user) {
        throw new AppError('Invalid username and password', statusCode.unauthorized);
    }

    const isPasswordValid = await user.comparePassword(password, user.password);

    if (!isPasswordValid) {
        throw new AppError('Invalid username and password', statusCode.unauthorized);
    }

    if (!user.isActive) {
        throw new AppError('User is not activated', statusCode.unauthorized);
    }

    const signedToken = signToken(user._id, user.role);

    return signedToken;
};

const signToken = (userId, userRole) => {
    const token = jwt.sign({ id: userId, role: userRole }, jwtSecretKey, {
        expiresIn: 3600
    });
    return token;
};

const decodeToken = (token) => {
    const decryptedToken = decryptToken(token);
    const decoded = jwt.verify(decryptedToken, jwtSecretKey);
    return decoded;
};

const encryptToken = (signedToken) => {
    const token = CryptoJS.AES.encrypt(JSON.stringify(signedToken), cyptoSecretKey).toString();
    return token;
};

const decryptToken = (encryptedToken) => {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, cyptoSecretKey);
    const token = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return token;
};

const getUserIdByUsername = async (username) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new AppError('User not found', statusCode.notFound);
    }
    return user._id;
};

const isUserValid = async (userId) => {
    return await User.exists({ _id: userId });
};

const isUserActive = async (userId) => {
    const isValid = await isUserValid(userId);

    if (!isValid._id) {
        return;
    }

    const user = await User.findOne({ _id: userId }).select('+isActive');
    return user.isActive;
};



module.exports = {
    authenticateUser,
    decodeToken,
    encryptToken,
    decryptToken,
    getUserIdByUsername,
    isUserValid,
    isUserActive
};