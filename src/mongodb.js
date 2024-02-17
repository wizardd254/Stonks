const mongoose = require('mongoose');

const connectionstring = "mongodb+srv://kindip:12august@cluster0.pqnzwch.mongodb.net/STOCKLIST?retryWrites=true&w=majority"
mongoose
   .connect(connectionstring)
   .then(()=>console.log("CONNECTED TO THE DB"))
   .catch((err)=>console.log(err))

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },
    portfolioData: {
        type: [{
            symbol: String,
            quantity: Number,
            purchasePrice: Number
        }],
        default: []
    }
})

const collection = new mongoose.model("collection1",userSchema);

module.exports=collection;

