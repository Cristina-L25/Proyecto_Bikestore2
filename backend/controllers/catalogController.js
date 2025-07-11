// Manejo de req/res Camila G.
const CatalogService = require('../services/catalogService');
const service = new CatalogService();

exports.getAllProducts = async (req, res) => {
  try {
    const products = await service.getAllProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.filterProducts = async (req, res) => {
  try {
    const products = await service.filterProducts(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};