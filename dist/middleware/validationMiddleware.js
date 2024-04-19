"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegistration = exports.validateEmail = exports.validatePassword = exports.validateUsername = void 0;
const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
const validateUsername = (username) => {
    if (!usernameRegex.test(username)) {
        return "Username must be between 3 and 16 characters long and can only contain letters, numbers, underscores and hyphens.";
    }
    return null;
};
exports.validateUsername = validateUsername;
const validatePassword = (password) => {
    if (!passwordRegex.test(password)) {
        return "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number.";
    }
    return null;
};
exports.validatePassword = validatePassword;
const validateEmail = (email) => {
    if (!email.includes("@")) {
        return "Invalid email.";
    }
    return null;
};
exports.validateEmail = validateEmail;
const validateRegistration = async (req, res, next) => {
    const { username, email, password } = req.body;
    let errorMessage = "";
    if (!username || !password) {
        errorMessage = "Username and password are required.";
    }
    const usernameError = (0, exports.validateUsername)(username);
    if (usernameError) {
        errorMessage = usernameError;
    }
    const emailError = (0, exports.validateEmail)(email);
    if (emailError) {
        errorMessage = emailError;
    }
    const passwordError = (0, exports.validatePassword)(password);
    if (passwordError) {
        errorMessage = passwordError;
    }
    if (errorMessage.length > 0) {
        return res.render("register", { message: errorMessage, username, email });
    }
    next();
};
exports.validateRegistration = validateRegistration;
