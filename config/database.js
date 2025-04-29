const mongoose = require("mongoose");

const connecttodatabase = ()=>{
    mongoose.connect(process.env.DB_URI).then((data)=>{
        console.log(`The dataBase has been connected to server : ${data.connection.host}`)
    }).catch((error)=>{
        console.log(error)
    })
}
module.exports = connecttodatabase;