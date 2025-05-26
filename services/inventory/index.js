const path        = require('path');
const grpc        = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const products    = require('./products.json');

// carrega a definição .proto
const packageDef = protoLoader.loadSync(
  path.join(__dirname, '../../proto/inventory.proto'),
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const inventoryProto = grpc.loadPackageDefinition(packageDef).inventory;

const server = new grpc.Server();

server.addService(inventoryProto.InventoryService.service, {
  // operação já existente
  SearchAllProducts: (_, callback) => {
    callback(null, { products });
  },

  // ---------- NOVA OPERAÇÃO ----------
  SearchProductByID: (payload, callback) => {
    const id      = Number(payload.request.id);
    const product = products.find(p => p.id === id);

    if (!product) {
      return callback({
        code: grpc.status.NOT_FOUND,
        details: 'Product not found',
      });
    }
    callback(null, product);
  }
  // -----------------------------------
});

server.bindAsync(
  '0.0.0.0:3002',
  grpc.ServerCredentials.createInsecure(),
  () => {
    console.log('Inventory Service running');
    server.start();
  }
);
