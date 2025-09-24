import userModel from "../models/userModel.js";
import mongoose from 'mongoose'

export async function getAllUsers (req, res) {

    try {
        const users = await userModel.find()
        res.status(200).json(users)

    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export async function createUser (req, res) {
    try {

        const { name, email, password } = req.body
        const newUser = new userModel({ name, email, password })
        await newUser.save()
        res.status(201).json({message: "User created"}) 
        
    } catch (error) {

        res.status(500).json({message: error.message})
        
    }
}

export async function updateUser(req, res) {
  try {
    // you can pass the user ID in params (better) like /api/users/:id
    const { id } = req.params; // or req.body.id if you send it in body
    const { name, email, password } = req.body; // fields you want to update

    const updatedUser = await userModel.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true, runValidators: true }
    );

      if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

export async function deleteUser (req, res) {
    try {
        const deleteUser = await userModel.findByIdAndDelete(req.params.id)
        if(!deleteUser){
            return res.status(404).json({message: "User not found"})
        }

        res.json({message: "User deleted successfully"})
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Server error", error: error.message})   
    }
}

export async function getUserById (req, res) {
    try {
        const { id } = req.params
        const user = await userModel.findById(id)

        //const user = await userModel.findById(req.query.id)
        if(!user){
            return res.status(404).json({message: "User not found"})
        }
        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Server error", error: error.message})
    }      
}
//import userModel from "../models/userModel.js";
/*export const getUserData = async(req, res) => {
    try {
        const { userId } = req.body
        const user = await userModel.findById(userId)

        //const { userId } = req.query;
        //const user = await userModel.findById(userId);


        if(!user){
           return res.json({success: false, message: 'User not found'})
        }

        res.json({
            success: true,
            userData: {
                name:user.name,
                isAccountVerified: user.isAccountVerified
            }
        })
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}*/