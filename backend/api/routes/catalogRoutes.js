// Rutas para el catalogo Camila G.
const path = require('path');
console.log('📂 __dirname:', __dirname);
console.log('🔍 Ruta esperada del controller:', path.join(__dirname, '../controllers/catalogController.js'));
const express = require('express');
const router = express.Router();

// Importación correcta del controller (1 nivel arriba desde routes)
const { 
    getAllProducts,
    filterProducts // <- Se mantiene exactamente igual que en tu código
  } = require('../../controllers/catalogController');
  console.log('✅ Controller cargado:', { getAllProducts, filterProducts });

// Routes
router.get('/', getAllProducts);
router.get('/filtrar', filterProducts);


module.exports = router;