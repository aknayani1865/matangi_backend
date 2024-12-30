const mongoose = require('mongoose');

const sparePartSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
    },
    price: { type: Number, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
});

module.exports = mongoose.model('SparePart', sparePartSchema);