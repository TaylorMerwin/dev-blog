"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cacheService_1 = require("./services/cacheService");
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const homeRoutes_1 = __importDefault(require("./routes/homeRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
const SECRET = process.env.SECRET || "my_secret";
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 5 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
(0, cacheService_1.updateCache)();
app.set("view engine", "ejs");
app.use(express_1.default.static("public"));
app.use(express_1.default.static("uploads"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, express_session_1.default)({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(limiter);
app.use(postRoutes_1.default);
app.use(homeRoutes_1.default);
app.use(userRoutes_1.default);
app.use(authRoutes_1.default);
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
