class APIFeatures {

    constructor(query, queryObj) {
        this.query = query;
        this.queryObj = queryObj;
    }

    filterData() {
            const queryObj = { ...this.queryObj };
            const excludeParams = [ 'page', 'limit', 'sort', 'fields' ];

            excludeParams.forEach(el => delete queryObj[el] );

            const queryStr = JSON.stringify(queryObj).replace(/\b(lt|lte|gt|gte)\b/g, match => `$${match}`);
            this.query.find(JSON.parse(queryStr));
            return this;

    };

    sortData() {
        if(this.queryObj.sort) {
            const sortBy = this.queryObj.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy)
        }

        return this
    }

    limitFields() {
        if(this.queryObj.fields) {
            const fields = this.queryObj.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }

        return this;
    }

    paginate() {
        const page = this.queryObj.page || 1;
        const limit = this.queryObj.limit * 1 || 10;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);
        return this;
    }

}


module.exports = APIFeatures;

