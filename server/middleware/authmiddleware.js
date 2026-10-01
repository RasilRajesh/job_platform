const jwt=require('jsonwebtoken');
const User=require('../models/user.js');
const authmiddleware=async(req,res,next)=>{
    const authheader=req.headers.authorization;
    if (!authheader || !authheader.startsWith('Bearer ')){
        return res.status(401).json({message:"Unauthorized"});
    }
    const token=authheader.split(' ')[1];
    if (!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await User.findById(decoded.id).select('-password');
        if (!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user=user;
        next();

    }catch(err){
        return res.status(401).json({message:"Unauthorized"});
    }
    
}
module.exports=authmiddleware;