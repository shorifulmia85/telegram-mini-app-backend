"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskType = exports.AdNetwork = exports.TaskStatus = void 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["DRAFT"] = "DRAFT";
    TaskStatus["ACTIVE"] = "ACTIVE";
    TaskStatus["PAUSED"] = "PAUSED";
    TaskStatus["ENDED"] = "ENDED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
var AdNetwork;
(function (AdNetwork) {
    AdNetwork["NONE"] = "NONE";
    AdNetwork["MONETAG"] = "MONETAG";
    AdNetwork["ADSGRAM"] = "ADSGRAM";
    AdNetwork["ONCLICKA"] = "ONCLICKA";
    AdNetwork["GIGAPUB"] = "GIGAPUB";
    AdNetwork["ADSENSE"] = "ADSENSE";
})(AdNetwork || (exports.AdNetwork = AdNetwork = {}));
var TaskType;
(function (TaskType) {
    TaskType["VIEW"] = "VIEW";
    TaskType["CLICK"] = "CLICK";
    TaskType["WATCH"] = "WATCH";
    TaskType["VISIT"] = "VISIT";
})(TaskType || (exports.TaskType = TaskType = {}));
