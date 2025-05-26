const express     = require('express');
const path        = require('path');
const grpc        = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const app  = express();
const PORT = 3000;

/* ---------- gRPC clients ---------- */
function loadProto(relativePath) {
  const def = protoLoader.loadSync(
    path.join(__dirname, relativePath),
    { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
  );
  return grpc.loadPackageDefinition(def);
}

const inventoryClient = new (loadProto('../../proto/inventory.proto')
  .inventory.InventoryService)(
  'localhost:3002',
  grpc.credentials.createInsecure()
);

const shippingClient = new (loadProto('../../proto/shipping.proto')
  .shipping.ShippingService)(
  'localhost:3001',
  grpc.credentials.createInsecure()
);
/* ---------------------------------- */

/* lista todos os produtos */
app.get('/products', (_req, res) => {
  inventoryClient.SearchAllProducts({}, (err, reply) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(reply);
  });
});

/* ---------- NOVO ENDPOINT ---------- */
app.get('/product/:id', (req, res) => {
  inventoryClient.SearchProductByID({ id: req.params.id }, (err, product) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(product);
  });
});
/* ---------------------------------- */

/* cálculo de frete */
app.get('/shipping/:cep', (req, res) => {
  shippingClient.GetShippingRate({ cep: req.params.cep }, (err, reply) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(reply);
  });
});

app.listen(PORT, () => console.log(`Controller listening on ${PORT}`));
