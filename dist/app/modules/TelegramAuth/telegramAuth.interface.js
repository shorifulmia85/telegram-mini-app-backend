"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAuthStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["SUPER_ADMIN"] = "SUPER_ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var IAuthStatus;
(function (IAuthStatus) {
    IAuthStatus["ACTIVE"] = "ACTIVE";
    IAuthStatus["INACTIVE"] = "INACTIVE";
    IAuthStatus["BLOCKED"] = "BLOCKED";
})(IAuthStatus || (exports.IAuthStatus = IAuthStatus = {}));
