import express from "express"
import { requireSignIn, isAdmin } from "../middleware/authMiddleware.js"
import { deleteUserController, getAllUserController, totalCountAllController } from "../controller/authController.js"
import { adminLoginController, admintRegisterController, updateOrderStatus } from "../controller/adminController.js"
import { getAllOrders, searchUserOrder } from "../controller/orderController.js"

const router = express.Router()

router.post("/register", admintRegisterController)

// /api/v1/admin/AdminLogin
router.post("/AdminLogin", adminLoginController)

router.get("/all-users", requireSignIn, isAdmin, getAllUserController)

router.get("/all-total-count", requireSignIn, isAdmin, totalCountAllController)


router.delete("/delete-user/:_id", requireSignIn, isAdmin, deleteUserController)

router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({
    success: true,
    message: "Admin Route",
    user: req.user
  })
})

router.get("/getAllOrders", requireSignIn, isAdmin, getAllOrders)

router.put("/update-order-status", requireSignIn, isAdmin, updateOrderStatus)

router.get("/search-user-order/:id", requireSignIn, isAdmin, searchUserOrder)


export default router;