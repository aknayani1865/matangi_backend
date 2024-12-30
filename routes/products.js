const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('image'), productController.addProduct);
router.put('/:id', auth, upload.single('image'), productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);
router.get('/', productController.getAllProducts); // Get all products
router.get('/:id', productController.getProductById); // Get a single product by ID

module.exports = router;