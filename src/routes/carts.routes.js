const express = require('express');
const router = express.Router();
const productsModule = require("./products.routes");
let products = productsModule.products;
let carts = [];

// Listar los productos de un carrito
router.get('/:cartId', (req, res) => {
    let cartId = parseInt(req.params.cartId);
    const cartPosition = carts.findIndex((c) => c.id === cartId);
    if (cartPosition < 0) {
        return res.status(404).send({ status: "error", error: "Carrito no encontrado" });
    }
    res.send(carts[cartPosition]);
});

// Agregar un carrito
router.post('/', (req, res) => {
    console.log(req.body);
    let cart = req.body;

    // Asignar un ID
    let newCartId = carts.length + 1;
    while (carts.some((cart) => cart.id === newCartId)) {
        newCartId++;
    }
    cart.id = newCartId;
    cart.products = [];

    carts.push(cart);
    res.send({ status: "Success", msg: 'Carrito agregado' });
});

// Agregar un producto al carrito
router.post('/:cartId/product/:productId', (req, res) => {
    const cartId = parseInt(req.params.cartId);
    const productId = parseInt(req.params.productId);

    const cartIndex = carts.findIndex((cart) => cart.id === cartId);
    if (cartIndex < 0) {
        return res.status(404).send({ status: "error", error: "Carrito no encontrado" });
    }

    const product = products.find((product) => product.id === productId);
    if (!product) {
        return res.status(404).send({ status: "error", error: "Producto no encontrado" });
    }

    const productIndex = carts[cartIndex].products.findIndex((item) => item.productId === productId);
    if (productIndex !== -1) {
        carts[cartIndex].products[productIndex].quantity++;
    } else {
        carts[cartIndex].products.push({ productId: productId, quantity: 1 });
    }

    res.status(201).send({ status: "Success", msg: "Producto agregado al carrito" });
});

// Eliminar un producto del carrito
router.delete('/:cartId/products/:productId', (req, res) => {
    const cartId = parseInt(req.params.cartId);
    const productId = parseInt(req.params.productId);

    const cartIndex = carts.findIndex((cart) => cart.id === cartId);
    if (cartIndex < 0) {
        return res.status(404).send({ status: "error", error: "Carrito no encontrado" });
    }

    const productIndex = carts[cartIndex].products.findIndex((item) => item.productId === productId);
    if (productIndex === -1) {
        return res.status(404).send({ status: "error", error: "Producto no encontrado en el carrito" });
    }

    carts[cartIndex].products.splice(productIndex, 1);
    res.send({ status: "Success", message: "Producto eliminado del carrito" });
});

// Actualizar el carrito con un arreglo de productos
router.put('/:cartId', (req, res) => {
    const cartId = parseInt(req.params.cartId);
    const updatedProducts = req.body.products;

    const cartIndex = carts.findIndex((cart) => cart.id === cartId);
    if (cartIndex === -1) {
        return res.status(404).send({ status: "error", error: "Carrito no encontrado" });
    }

    carts[cartIndex].products = updatedProducts;
    res.send({ status: "Success", message: "Carrito actualizado", data: carts[cartIndex] });
});

// Actualizar la cantidad de ejemplares del producto en el carrito
router.put('/:cartId/products/:productId', (req, res) => {
    const cartId = parseInt(req.params.cartId);
    const productId = parseInt(req.params.productId);
    const quantity = req.body.quantity;

    const cartIndex = carts.findIndex((cart) => cart.id === cartId);
    if (cartIndex === -1) {
        return res.status(404).send({ status: "error", error: "Carrito no encontrado" });
    }

    const productIndex = carts[cartIndex].products.findIndex((item) => item.productId === productId);
    if (productIndex === -1) {
        return res.status(404).send({ status: "error", error: "Producto no encontrado en el carrito" });
    }

    carts[cartIndex].products[productIndex].quantity = quantity;
    res.send({ status: "Success", message: "Cantidad de producto actualizada en el carrito" });
});

// Eliminar todos los productos del carrito
router.delete('/:cartId', (req, res) => {
    const cartId = parseInt(req.params.cartId);

    const cartIndex = carts.findIndex((cart) => cart.id === cartId);
    if (cartIndex === -1) {
        return res.status(404).send({ status: "error", error: "Carrito no encontrado" });
    }

    carts[cartIndex].products = [];
    res.send({ status: "Success", message: "Todos los productos eliminados del carrito" });
});

module.exports = router;
