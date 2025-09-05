"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const constants_1 = require("../constants");
function isValid(d) {
    return d instanceof Date && !isNaN(d.getTime());
}
// Parse 'YYYY-MM-DD' safely to UTC start-of-day
function parseYMDStartUTC(ymd) {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, (m !== null && m !== void 0 ? m : 1) - 1, d !== null && d !== void 0 ? d : 1, 0, 0, 0, 0));
}
// Next day's UTC midnight
function parseYMDNextDayUTC(ymd) {
    const [y, m, d] = ymd.split("-").map(Number);
    return new Date(Date.UTC(y, (m !== null && m !== void 0 ? m : 1) - 1, (d !== null && d !== void 0 ? d : 1) + 1, 0, 0, 0, 0));
}
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    filter() {
        const filter = Object.assign({}, this.query);
        for (const field of constants_1.excludeField) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete filter[field];
        }
        this.modelQuery = this.modelQuery.find(filter); // Tour.find().find(filter)
        return this;
    }
    // date range
    dateRange(field = "createdAt") {
        const { dateFrom, dateTo } = this.query;
        if (!dateFrom && !dateTo)
            return this;
        const range = {};
        if (dateFrom) {
            const from = /^\d{4}-\d{2}-\d{2}$/.test(dateFrom)
                ? parseYMDStartUTC(dateFrom)
                : new Date(dateFrom);
            if (isValid(from)) {
                range.$gte = from;
            }
            else {
                this.modelQuery = this.modelQuery.where("_id").equals(null);
                return this;
            }
        }
        // TO (exclusive)
        if (dateTo) {
            const toExclusive = /^\d{4}-\d{2}-\d{2}$/.test(dateTo)
                ? parseYMDNextDayUTC(dateTo)
                : new Date(dateTo);
            if (isValid(toExclusive)) {
                range.$lt = toExclusive;
            }
            else {
                // dateTo invalid → empty বা error
                this.modelQuery = this.modelQuery.where("_id").equals(null);
                return this;
            }
        }
        else if (range.$gte) {
            range.$lt = new Date();
        }
        if (range.$gte && range.$lt && range.$gte > range.$lt) {
            [range.$gte, range.$lt] = [range.$lt, range.$gte];
        }
        this.modelQuery = this.modelQuery.find({ [field]: range });
        return this;
    }
    search(searchableField) {
        const searchTerm = this.query.searchTerm || "";
        if (!searchTerm) {
            return this;
        }
        // ObjectId and other non-string fields should not be searched with $regex and $options.
        // We need to filter out these fields from the searchableField array.
        // Assuming a field named '_id' is an ObjectId, we can filter it out.
        // You can extend this logic to filter out other non-string fields if needed.
        const fieldsToSearch = searchableField.filter((field) => field !== "_id" && !field.includes("Id"));
        const searchQuery = {
            $or: fieldsToSearch.map((field) => ({
                [field]: { $regex: searchTerm, $options: "i" },
            })),
        };
        this.modelQuery = this.modelQuery.find(searchQuery);
        return this;
    }
    sort() {
        const sort = this.query.sort || "-createdAt";
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }
    fields() {
        var _a;
        const fields = ((_a = this.query.fields) === null || _a === void 0 ? void 0 : _a.split(",").join(" ")) || "";
        this.modelQuery = this.modelQuery.select(fields);
        return this;
    }
    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    build() {
        return this.modelQuery;
    }
    getMeta() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalDocuments = yield this.modelQuery.model.countDocuments();
            const page = Number(this.query.page) || 1;
            const limit = Number(this.query.limit) || 10;
            const totalPage = Math.ceil(totalDocuments / limit);
            return { page, limit, total: totalDocuments, totalPage };
        });
    }
}
exports.QueryBuilder = QueryBuilder;
