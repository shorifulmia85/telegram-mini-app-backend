/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query } from "mongoose";
import { excludeField } from "../constants";

function isValid(d: Date) {
  return d instanceof Date && !isNaN(d.getTime());
}

// Parse 'YYYY-MM-DD' safely to UTC start-of-day
function parseYMDStartUTC(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0));
}

// Next day's UTC midnight
function parseYMDNextDayUTC(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, (d ?? 1) + 1, 0, 0, 0, 0));
}

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  filter(): this {
    const filter = { ...this.query };

    for (const field of excludeField) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete filter[field];
    }

    this.modelQuery = this.modelQuery.find(filter); // Tour.find().find(filter)

    return this;
  }

  // date range
  dateRange(field: string = "createdAt"): this {
    const { dateFrom, dateTo } = this.query;
    if (!dateFrom && !dateTo) return this;

    const range: Record<string, any> = {};

    if (dateFrom) {
      const from = /^\d{4}-\d{2}-\d{2}$/.test(dateFrom)
        ? parseYMDStartUTC(dateFrom)
        : new Date(dateFrom);
      if (isValid(from)) {
        range.$gte = from;
      } else {
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
      } else {
        // dateTo invalid → empty বা error
        this.modelQuery = this.modelQuery.where("_id").equals(null);
        return this;
      }
    } else if (range.$gte) {
      range.$lt = new Date();
    }

    if (range.$gte && range.$lt && range.$gte > range.$lt) {
      [range.$gte, range.$lt] = [range.$lt, range.$gte];
    }

    this.modelQuery = this.modelQuery.find({ [field]: range });
    return this;
  }

  search(searchableField: string[]): this {
    const searchTerm = this.query.searchTerm || "";
    if (!searchTerm) {
      return this;
    }

    // ObjectId and other non-string fields should not be searched with $regex and $options.
    // We need to filter out these fields from the searchableField array.
    // Assuming a field named '_id' is an ObjectId, we can filter it out.
    // You can extend this logic to filter out other non-string fields if needed.
    const fieldsToSearch = searchableField.filter(
      (field) => field !== "_id" && !field.includes("Id")
    );

    const searchQuery = {
      $or: fieldsToSearch.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
    };

    this.modelQuery = this.modelQuery.find(searchQuery);
    return this;
  }
  sort(): this {
    const sort = this.query.sort || "-createdAt";

    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }
  fields(): this {
    const fields = this.query.fields?.split(",").join(" ") || "";

    this.modelQuery = this.modelQuery.select(fields);

    return this;
  }
  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);

    return this;
  }

  build() {
    return this.modelQuery;
  }

  async getMeta() {
    const totalDocuments = await this.modelQuery.model.countDocuments();

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    const totalPage = Math.ceil(totalDocuments / limit);

    return { page, limit, total: totalDocuments, totalPage };
  }
}
