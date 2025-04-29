class Apifeatures{
    constructor(query, querystr){
        this.query = query,
        this.querystr = querystr
    }

    //Search the products
    search(){
        const keyword = this.querystr.keyword ? {
            name : {
                $regex : this.querystr.keyword,
                $options : "i"
            },
        }:{};
        this.query = this.query.find({...keyword});
        return this;
    }
    
    filter() {
        const querystrcopy = { ...this.querystr };
        console.log(querystrcopy);
        const removefields = ["keyword", "page", "limit"];
        removefields.forEach((key) => delete querystrcopy[key]); // Modify querystrcopy, not this.querystr
        console.log(querystrcopy);

        let range = JSON.stringify(querystrcopy);
        range = range.replace(/\b(lt|gt|lte|gte)\b/g, (key) => `$${key}`);
        this.query = this.query.find(JSON.parse(range));
        console.log(range)
        return this
    }
    pagination(resultperpage){
        const page = Number(this.querystr.page)||1;
        const skip = (page-1)*resultperpage;
        this.query = this.query.skip(skip).limit(resultperpage);
        return this;
    }
    
}
module.exports = Apifeatures