const express = require("express");
const { createProduct, getProducts, getProduct, deleteProduct, updateProduct } = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/createProduct", protect, adminOnly , createProduct)
router.post("/getProducts", getProducts)
router.post("/getProduct/:id", getProduct)
router.post("/deleteProduct/:id",adminOnly, deleteProduct)
router.post("/updateProduct/:id",adminOnly, updateProduct)

module.exports = router;