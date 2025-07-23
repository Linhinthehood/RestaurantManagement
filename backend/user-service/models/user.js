import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    minLength: [6],
    required: true,
    select:false,
    
  },
  Image: {
    type: String,
  },
  dob: {
    type: Date,
  },
  phoneNumber: {
    type:String,
  },
  gender: {
    type: String,
    enum: ["Male", "Femle"],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
    required: true,
  },
  role: {
    type: String,
    enum: ["Waiter", "Chef", "Manager","Receptionist"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
userSchema.pre('save', async function (next) {
  
  if(!this.isModified('password') ) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password , salt);
  next();
});
userSchema.methods.comparePassword = async function (candidatePassWord) {
  return await bcrypt.compare(candidatePassWord,this.password);
  
};

const User = mongoose.model("User", userSchema);
export default User ;
