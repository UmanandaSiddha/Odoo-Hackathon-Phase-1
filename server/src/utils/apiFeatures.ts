import { Prisma } from '@prisma/client';

type PrismaModelDelegate = {
    findMany: (args: any) => Promise<any[]>;
    count: (args: any) => Promise<number>;
};

export type QueryString = {
    [key: string]: string | undefined;
};

export class PrismaApiFeatures<T extends PrismaModelDelegate> {
    private model: T;
    private queryStr: QueryString;
    private prismaQuery: {
        where: Prisma.JsonObject;
        take?: number;
        skip?: number;
        orderBy?: Prisma.JsonObject | Prisma.JsonArray;
    };

    constructor(model: T, queryStr: QueryString) {
        this.model = model;
        this.queryStr = queryStr;
        this.prismaQuery = {
            where: {},
        };
    }

    search(searchFields: string[]): this {
        const keyword = this.queryStr.keyword;
        if (keyword && searchFields.length > 0) {
            this.prismaQuery.where.OR = searchFields.map(field => ({
                [field]: {
                    contains: keyword,
                    mode: 'insensitive',
                },
            }));
        }
        return this;
    }

    filter(): this {
        const queryCopy = { ...this.queryStr };

        const removeFields = ["keyword", "page", "limit", "sort"];
        removeFields.forEach((key) => delete queryCopy[key]);

        const filterObject: Prisma.JsonObject = {};
        for (const key in queryCopy) {
            let value: any = queryCopy[key];
            if (typeof value === 'object' && value !== null) {
                const operator = Object.keys(value)[0];
                const operatorValue = value[operator];
                if (['gt', 'gte', 'lt', 'lte'].includes(operator)) {
                    filterObject[key] = { [operator]: Number(operatorValue) };
                }
            } else {
                filterObject[key] = value;
            }
        }
        
        this.prismaQuery.where = { ...this.prismaQuery.where, ...filterObject };

        return this;
    }

    pagination(defaultResultPerPage: number = 10): this {
        const resultPerPage = Number(this.queryStr.limit) || defaultResultPerPage;
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);

        this.prismaQuery.take = resultPerPage;
        this.prismaQuery.skip = skip;

        return this;
    }
    
    sort(): this {
        if (this.queryStr.sort) {
            const [field, order] = this.queryStr.sort.split('_');
            if (field && (order === 'asc' || order === 'desc')) {
                this.prismaQuery.orderBy = {
                    [field]: order,
                };
            }
        } else {
            this.prismaQuery.orderBy = {
                createdAt: 'desc',
            };
        }
        return this;
    }

    async execute(): Promise<{ results: any[], totalCount: number }> {
        const countQuery = { where: this.prismaQuery.where };

        const [results, totalCount] = await Promise.all([
            this.model.findMany(this.prismaQuery),
            this.model.count(countQuery),
        ]);

        return { results, totalCount };
    }
}