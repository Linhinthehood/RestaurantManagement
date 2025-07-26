import User from "../models/user.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const registerUser = async (req, res) => {
  const { name, password,role , phoneNumber, email, gender, } = req.body;
  try {
    if (!name || !password || !email ||!phoneNumber) {
      return res.status(400).json({
        message: "Vui Lòng Nhập Đầy Đủ Thông Tin...!",
      });
    }
    const userExists = await User.findOne({$and:[{name}, {email},{phoneNumber}]});
    if(userExists){
return res.status(400).json({
  message:' Tài Khoản Đã Tồn Tại',
})
    }
    const newUser = await User.create({
      name,
      password,
      role,
      phoneNumber,
      email,
      gender,
  
    });
    if (newUser) {
      res.status(201).json({
        _id: newUser.id,
        name: newUser.name,
        role:newUser.role,
    
      });
    }else{
        res.status(400).json({
            message:"invalid user data",
        });
    
    }
  } catch (error) {
    console.error('Eror', error.message);
    res.status(500).json({
      message:"Server is error during registration",
      error:error?.message,
    });
  }
};

const loginUser = async (req, res) => {
 const { name , password ,} = req.body
 try{
if(!name || !password  ){
  return res.status(400).json({
    message:"Vui Lòng Nhập Đầy Đủ Thông Tin..!"
  });
}
const existUser = await User.findOne({ name}).select('+password');
if ( existUser && ( await existUser.comparePassword(password))){
  const accesToken =  jwt.sign({
    id:existUser.id,
    name:existUser.name,
    role:existUser.role,
  },
process.env.JWT_SECRET_KEY,

{
  expiresIn: process.env.JWT_EXPIRE_TIME,
});
  return res.json({
    _id: existUser.id,
    name:existUser.name,
    role:existUser.role,
    accesToken,
  });
}else{
  res.json({
    message:"Tài Khoản Không Tồn Tại ",
  })
}

 } catch (error){console.error('Eror', error.message);
    res.status(500).json({
      message:"Server is error during login",
      error:error?.message,
    });

 } 
};
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    const { name, phoneNumber, gender, role, status } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, phoneNumber, gender, role, status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
};




const AuthController = {
  registerUser,
  loginUser,
  getMyProfile,
  updateUser,
  deleteUser,
  getUsers,
  
};

export default AuthController;
