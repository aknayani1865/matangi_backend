const SparePart = require('../models/SparePart');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/Product');

exports.addSparePart = async (req, res) => {
    const { name, price, image, productId } = req.body;
  
    try {
      // Upload the Base64 image to Cloudinary
      const imageResult = await cloudinary.uploader.upload(image, {
        folder: 'spareparts',
        transformation: [
        { width: 1200, height: 1200, crop: "limit" }, // Resize if the image exceeds this size
      ],
      quality: "auto", // Automatically adjust quality based on the image
      fetch_format: "auto", // Optimize the image format
      });
  
      // Create a new spare part
      const sparePart = new SparePart({
        name,
        price,
        product: productId, // Reference to the product
        image: {
          public_id: imageResult.public_id,
          url: imageResult.secure_url,
        },
      });
  
      // Save the spare part
      await sparePart.save();
  
      // Update the product to include the new spare part
      await Product.findByIdAndUpdate(productId, {
        $push: { spareParts: sparePart._id },
      });
  
      res.json(sparePart);
    } catch (error) {
      console.error("Error saving spare part:", error);
      res.status(500).send("Server error");
    }
  };

exports.updateSparePart = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, newImage, imageToRemove, newProductId } = req.body; // Assuming newImage is a Base64 string
    console.log(name, price, newImage, imageToRemove, newProductId);
    // Find the spare part by ID
    const sparePart = await SparePart.findById(id);
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    // Update spare part fields only if provided
    if (name) sparePart.name = name;
    if (price) sparePart.price = price;

    // Handle changing the associated product
    if (newProductId && newProductId !== sparePart.product.toString()) {
      // Remove the spare part from the old product's spareParts array
      await Product.findByIdAndUpdate(sparePart.product, {
        $pull: { spareParts: sparePart._id },
      });

      // Update the spare part's product reference
      sparePart.product = newProductId;

      // Add the spare part to the new product's spareParts array
      await Product.findByIdAndUpdate(newProductId, {
        $push: { spareParts: sparePart._id },
      });
    }


    // Handle uploading a new image to Cloudinary
    if (newImage) {
      const uploadResponse = await cloudinary.uploader.upload(newImage, {
        folder: 'spareparts',
        transformation: [
        { width: 1200, height: 1200, crop: "limit" }, // Resize if the image exceeds this size
      ],
      quality: "auto", // Automatically adjust quality based on the image
      fetch_format: "auto", // Optimize the image format
      });
      sparePart.image = {
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id,
      };
    }

    // Validate that the spare part has an image
    if (!sparePart.image || !sparePart.image.public_id || !sparePart.image.url) {
      return res.status(400).json({ message: 'A spare part must have an image.' });
    }

    // Save updated spare part
    await sparePart.save();

    res.status(200).json(sparePart);
  } catch (error) {
    console.error('Error updating spare part:', error);
    res.status(400).json({ message: error.message });
  }
};


exports.deleteSparePart = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the spare part by ID
      const sparePart = await SparePart.findById(id);
      if (!sparePart) {
        return res.status(404).json({ message: 'Spare part not found' });
      }
  
      // Remove the image from Cloudinary
      if (sparePart.image && sparePart.image.public_id) {
        await cloudinary.uploader.destroy(sparePart.image.public_id);
      }
  
      // Remove the spare part from the associated product's spareParts array
      await Product.findByIdAndUpdate(sparePart.product, {
        $pull: { spareParts: sparePart._id },
      });
  
      // Delete the spare part using findByIdAndDelete
      await SparePart.findByIdAndDelete(id);
  
      res.status(200).json({ message: 'Spare part deleted successfully' });
    } catch (error) {
      console.error('Error deleting spare part:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
// Get all spare parts
exports.getAllSpareParts = async (req, res) => {
    try {
        const spareParts = await SparePart.find().populate('product');
        res.json(spareParts);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Get a single spare part by ID
exports.getSparePartById = async (req, res) => {
    const { id } = req.params;
    try {
        const sparePart = await SparePart.findById(id);
        if (!sparePart) return res.status(404).send('Spare part not found');
        res.json(sparePart);
    } catch (error) {
        res.status(500).send('Server error');
    }
};


// Get spare parts by product ID
exports.getSparePartsByProductId = async (req, res) => {
    const { productId } = req.params;
    console.log(productId);
    try {
      // Find spare parts associated with the given product ID
      const spareParts = await SparePart.find({ product: productId });
      res.json(spareParts);
    } catch (error) {
      console.error('Error fetching spare parts:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };