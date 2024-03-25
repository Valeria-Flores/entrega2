const express = require('express');
const router = express.Router();

// Simulamos una DB
let products = [];

// Listar todos los productos con filtros, paginación y ordenamiento
router.get('/', (req, res) => {
    let { limit = 10, page = 1, sort, query } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);

    // Filtros
    let filteredProducts = products;
    if (query) {
        filteredProducts = filteredProducts.filter(product => product.category === query || product.availability === query);
    }

    // Ordenamiento
    if (sort) {
        if (sort === 'asc') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sort === 'desc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }
    }

    // Paginación
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, totalProducts);
    const results = filteredProducts.slice(startIndex, endIndex);

    const hasNextPage = endIndex < totalProducts;
    const hasPrevPage = page > 1;

    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const prevLink = hasPrevPage ? `/api/products?limit=${limit}&page=${prevPage}&sort=${sort}&query=${query}` : null;
    const nextLink = hasNextPage ? `/api/products?limit=${limit}&page=${nextPage}&sort=${sort}&query=${query}` : null;

    res.send({
        status: "success",
        payload: results,
        totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink
    });
});

// Agregar un producto
router.post('/', (req, res) => {
    console.log(req.body);
    let product = req.body;

    if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category) {
        return res.status(400).send({ status: "error", msg: "Valores incompletos." });
    }

    // Asignar un ID
    let newProductId = products.length + 1;
    while (products.some(product => product.id === newProductId)) {
        newProductId++;
    }
    product.id = newProductId;

    // Asignar status
    product.status = true;

    products.push(product);
    res.send({ status: "Success", msg: 'Producto agregado' });
});

// Actualizar producto
router.put('/:productId', (req, res) => {
    let productId = parseInt(req.params.productId);
    let productUpdate = req.body;
    const productPosition = products.findIndex((p => p.id === productId));

    if (productPosition < 0) {
        return res.status(404).send({ status: "error", error: "Producto no encontrado" });
    }

    productUpdate.id = productId;
    productUpdate.status = true;
    products[productPosition] = productUpdate;

    res.send({ status: "Success", message: "Producto actualizado.", data: products[productPosition] });
});

// Eliminar producto
router.delete('/:productId', (req, res) => {
    let productId = parseInt(req.params.productId);
    const productSize = products.length;

    const productPosition = products.findIndex((p => p.id === productId));
    if (productPosition < 0) {
        return res.status(404).send({ status: "error", error: "Producto no encontrado" });
    }

    products.splice(productPosition, 1);
    if (products.length === productSize) {
        return res.status(500).send({ status: "error", error: "No se pudo eliminar el producto." });
    }

    res.send({ status: "Success", message: "Producto eliminado." });
});

module.exports = router;
