const express = require('express');
const router = express.Router();
const sparePartController = require('../controllers/sparePartController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('../middleware/auth');

router.post('/', upload.single('image'), sparePartController.addSparePart);
router.put('/:id', auth, upload.single('image'), sparePartController.updateSparePart);
router.delete('/:id', auth, sparePartController.deleteSparePart);
router.get('/', sparePartController.getAllSpareParts); // Get all spare parts
router.get('/:id', sparePartController.getSparePartById); // Get a single spare part by ID
router.get('/spareparts/:productId', sparePartController.getSparePartsByProductId); // Get spare parts by product ID
module.exports = router;