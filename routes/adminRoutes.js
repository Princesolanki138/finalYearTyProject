import express from "express"
import { requireSignIn, isAdmin } from "../middleware/authMiddleware.js"
import { deleteUserController, getAllUserController, totalCountAllController } from "../controller/authController.js"
import { adminLoginController, admintRegisterController } from "../controller/adminController.js"

const router = express.Router()

router.post("/register", admintRegisterController)

router.post("/AdminLogin", adminLoginController)

router.get("/all-users", requireSignIn, isAdmin, getAllUserController)

router.get("/all-total-count", requireSignIn, isAdmin, totalCountAllController)


router.delete("/delete-user/:userId", requireSignIn, isAdmin, deleteUserController)

router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({
    success: true,
    message: "Admin Route",
    user: req.user
  })
})


export default router;