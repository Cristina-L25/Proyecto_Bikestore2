// Camila G.
const path = require('path');

// Verificación de ruta
const rutaConexion = path.join(__dirname, '../api/db/connection');

// Importación corregida
const conexion = require(rutaConexion);





class CatalogService {
  async getAllProducts() {

    try {

      const [products] = await conexion.promise().query('SELECT * FROM productos');

      return products;
    } catch (error) {

      throw new Error('Error al obtener productos');
    }
  }
  /**
 * Filtra productos según las opciones dadas.
 * @param {{ categorias?: string, marcas?: string, precios?: string }} filtros
 */
  async filterProducts({ categorias, marcas, precios }) {
    console.log('Filtros recibidos en el backend:', { categorias, marcas, precios });



    try {
      let query = 'SELECT * FROM productos WHERE 1=1';
      const params = [];

      // categorias
      if (categorias) {
        const categoriaList = Array.isArray(categorias)
          ? categorias.map(s => decodeURIComponent(s.trim()))
          : [decodeURIComponent(categorias.trim())];
        if (categoriaList.length === 1) {
          query += ` AND categoria = ?`;
          params.push(categoriaList[0]);
        } else {
          query += ` AND categoria IN (${categoriaList.map(() => '?').join(',')})`;
          params.push(...categoriaList);
        }


      }
      console.log('🚨 DEBUG FINAL');
      console.log('Query final:', query);
      console.log('Parámetros enviados:', JSON.stringify(params));

      // marcas 
      if (marcas) {
        const marcaList = Array.isArray(marcas)
          ? marcas.map(s => s.trim())
          : marcas.split(',').map(s => s.trim());

        if (marcaList.length > 0) {
          query += ` AND marca IN (${marcaList.map(() => '?').join(',')})`;
          params.push(...marcaList);
        }
      }


      // rango de precios
      if (precios) {
        const conditions = [];
        precios.split(',').forEach(rango => {
          switch (rango.trim()) {
            case '0 - 100000':
              conditions.push('(precio BETWEEN 0 AND 100000)');
              break;
            case '100000 - 300000':
              conditions.push('(precio BETWEEN 100000 AND 300000)');
              break;
            case '300000 - 1000000':
              conditions.push('(precio BETWEEN 300000 AND 1000000)');
              break;
            case '1000000+':
              conditions.push('(precio >= 1000000)');
              break;
          }
        });

        if (conditions.length) {
          query += ` AND (${conditions.join(' OR ')})`;
        }
      }

      // 👇 Agrega estos logs antes de ejecutar la consulta
      console.log('Consulta construida:', query);
      console.log('Parámetros:', params);
      console.log('Valores exactos que se envían al query:', params);

      const [products] = await conexion.promise().query(query, params);
      console.log('🔎 Productos encontrados:', products);
      console.log("🧪 Resultado crudo desde BD:", products);
      return products;
    } catch (error) {

      throw error;
    }
  }
}

module.exports = CatalogService;