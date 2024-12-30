const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const SparePart = require('../models/SparePart');

exports.addProduct = async (req, res) => {
    const { name, image } = req.body;
    console.log(name);
  try {
    // Upload the Base64 image to Cloudinary
    const imageResult = await cloudinary.uploader.upload(image, {
      folder: 'products',
      transformation: [
        { width: 1200, height: 1200, crop: "limit" }, // Resize if the image exceeds this size
      ],
      quality: "auto", // Automatically adjust quality based on the image
      fetch_format: "auto", // Optimize the image format
    });

    const product = new Product({
      name,
      image: {
        public_id: imageResult.public_id,
        url: imageResult.secure_url,
      },
    });

    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Error saving product:", error);
    res.status(500).send("Server error");
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, newImage, imageToRemove } = req.body; // Assuming newImage is a Base64 string

    // Find the product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update product fields only if provided
    if (name) product.name = name;

    // Handle removing the existing image from Cloudinary
    // if (imageToRemove && product.image.public_id === imageToRemove) {
    //   await cloudinary.uploader.destroy(product.image.public_id);
    //   product.image = null; // Remove image reference
    // }

    // Handle uploading a new image to Cloudinary
    if (newImage) {
      const uploadResponse = await cloudinary.uploader.upload(newImage, {
        folder: 'products',
        transformation: [
        { width: 1200, height: 1200, crop: "limit" }, // Resize if the image exceeds this size
      ],
      quality: "auto", // Automatically adjust quality based on the image
      fetch_format: "auto", // Optimize the image format
      });
      product.image = {
        url: uploadResponse.secure_url,
        public_id: uploadResponse.public_id,
      };
    }

    // Validate that the product has an image
    if (!product.image) {
      return res.status(400).json({ message: 'A product must have an image.' });
    }

    // Save updated product
    await product.save();

    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find the product by ID
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Find and delete all spare parts associated with this product
      const spareParts = await SparePart.find({ product: id });
  
      for (const sparePart of spareParts) {
        // Remove the image from Cloudinary
        if (sparePart.image && sparePart.image.public_id) {
          await cloudinary.uploader.destroy(sparePart.image.public_id);
        }
  
        // Delete the spare part
        await SparePart.findByIdAndDelete(sparePart._id);
      }
  
      // Delete the product
      await Product.findByIdAndDelete(id);
  
      res.status(200).json({ message: 'Product and associated spare parts deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) return res.status(404).send('Product not found');
        res.json(product);
    } catch (error) {
        res.status(500).send('Server error');
    }
};