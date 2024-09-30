import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required:true},
    email: {type: String, required:true},
    image: {type:String},
    authProviderId: {type:String},
    spam: [{type:String}],
    inbox: [{type:String}],
     
});

const User = mongoose.models?.User || mongoose.model('User',userSchema);

export default User
