"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next(); // The user is logged in, proceed to the route handler
    }
    else {
        res.redirect("/login");
    }
}
exports.isAuthenticated = isAuthenticated;
