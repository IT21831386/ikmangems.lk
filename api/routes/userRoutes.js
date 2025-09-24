import express from 'express'
//import userAuth from '../middleware/userAuth.js'
import { getAllUsers,createUser, updateUser, deleteUser, getUserById } from '../controllers/userController.js'

const userRouter = express.Router()

//rev > get
//change by Dana
userRouter.get('/all-users', getAllUsers)
userRouter.get('/one-user/:id', getUserById)
userRouter.post('/create-user', createUser)
userRouter.put('/users/:id', updateUser)
userRouter.delete('/users/:id', deleteUser)

export default userRouter