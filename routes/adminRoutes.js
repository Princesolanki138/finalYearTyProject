import express from "express"
import { requireSignIn, isAdmin } from "../middleware/authMiddleware.js"
import { deleteUserController, getAllUserController } from "../controller/authController.js"

const router = express.Router()

router.get("/all-users", requireSignIn, isAdmin, getAllUserController)

router.delete("/delete-user/:userId", requireSignIn, isAdmin, deleteUserController)

router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({
    success: true,
    message: "Admin Route",
    user: req.user
  })
})


export default router;