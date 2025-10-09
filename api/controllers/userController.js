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

export async function getUserProfile (req, res) {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const user = await userModel.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Return user data without sensitive information
        const userProfile = {
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email,
            phone: user.phone,
            country: user.country,
            city: user.city,
            address: user.address,
            bio: user.bio,
            role: user.role,
            status: user.status,
            isAccountVerified: user.isAccountVerified,
            savedCards: user.savedCards || [],
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.status(200).json(userProfile);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export async function createUser (req, res) {
    try {
        const { firstName, lastName, username, email, password, role, phone, country, city, address, bio, status, isAccountVerified } = req.body;
        const newUser = new userModel({ 
            firstName, 
            lastName, 
            username, 
            email, 
            password, 
            role, 
            phone, 
            country, 
            city, 
            address, 
            bio, 
            status, 
            isAccountVerified 
        });
        await newUser.save();
        res.status(201).json({message: "User created successfully", user: newUser}); 
        
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

/*export async function updateUser(req, res) {
  try {
    
    const { id } = req.params; 
    const { name, email, password } = req.body; 

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
}*/
export async function updateUser(req, res) {
    try {
        const { id } = req.params;
        
        // Validate the ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Extract all possible fields from request body
        const {
            firstName,
            lastName,
            username,
            email,
            role,
            phone,
            country,
            city,
            address,
            bio,
            status,
            isAccountVerified
        } = req.body;

        // Create update object with only provided fields
        const updateFields = {};
        if (firstName !== undefined) updateFields.firstName = firstName;
        if (lastName !== undefined) updateFields.lastName = lastName;
        if (username !== undefined) updateFields.username = username;
        if (email !== undefined) updateFields.email = email;
        if (role !== undefined) updateFields.role = role;
        if (phone !== undefined) updateFields.phone = phone;
        if (country !== undefined) updateFields.country = country;
        if (city !== undefined) updateFields.city = city;
        if (address !== undefined) updateFields.address = address;
        if (bio !== undefined) updateFields.bio = bio;
        if (status !== undefined) updateFields.status = status;
        if (isAccountVerified !== undefined) updateFields.isAccountVerified = isAccountVerified;

        console.log('Updating user with ID:', id);
        console.log('Update fields:', updateFields);

        const updatedUser = await userModel.findByIdAndUpdate(
            id,
            updateFields,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User updated successfully:', updatedUser);
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const deletedUser = await userModel.findByIdAndDelete(id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export async function getUserById(req, res) {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            userData: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                isAccountVerified: user.isAccountVerified
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
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

//import userModel from "../models/userModel.js";

export const uploadNIC = async (req, res) => {
  try {
    const userId = req.user.id; // assuming you’re using JWT middleware
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Both files come from frontend (field names: nicFrontImage, nicBackImage)
    const frontImage = req.files["nicFrontImage"]?.[0]?.path;
    const backImage = req.files["nicBackImage"]?.[0]?.path;

    if (!frontImage || !backImage)
      return res.status(400).json({ message: "Both NIC images required" });

    user.nicFrontImage = frontImage;
    user.nicBackImage = backImage;
    user.nicStatus = "pending"; // waiting for admin review
    await user.save();

    res.status(200).json({
      message: "NIC images uploaded successfully, awaiting verification.",
      data: {
        nicFrontImage: frontImage,
        nicBackImage: backImage,
        nicStatus: user.nicStatus,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}
