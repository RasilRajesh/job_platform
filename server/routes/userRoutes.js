const express=require("express");
const router=express.Router();
const authmiddleware=require('../middleware/authmiddleware.js');

router.get("/profile",authmiddleware,(req,res)=>{
    res.status(200).json({message:"User profile",user:req.user});
} );
module.exports=router;