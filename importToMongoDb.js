// Uploading seed data from .csv files to MongoDB

// In requirement doc. ObjectId is shown for _id but string of UUID in seed data
// Using ObjectId for better indexing & querying in MongoDB

require("dotenv").config();
const mongoose = require("mongoose");
const csvtojson = require("csvtojson");

const Customer = require("./models/customer");
const Product = require("./models/product");
const Order = require("./models/order");

// Maps to store UUID-string and their corresponding new ObjectIds
const customerIdMap = new Map();
const productIdMap = new Map();

const genObjectId = () => new mongoose.Types.ObjectId();

async function importCustomers() {
  const customers = await csvtojson().fromFile("./seed_data/customers.csv");

  const transformedCustomers = customers.map(customer => {
    const newObjectId = genObjectId();
    customerIdMap.set(customer._id, newObjectId);
    return { ...customer, _id: newObjectId };
  });

  await Customer.insertMany(transformedCustomers);
  console.log("Customers Imported Successfully");
}

async function importProducts() {
  const products = await csvtojson().fromFile("./seed_data/products.csv");

  const transformedProducts = products.map(product => {
    const newObjectId = genObjectId();
    productIdMap.set(product._id, newObjectId);
    return { ...product, _id: newObjectId };
  });

  await Product.insertMany(transformedProducts);
  console.log("Products Imported Successfully");
}

async function importOrders() {
  const orders = await csvtojson().fromFile("./seed_data/orders.csv");

  const transformedOrders = orders.map(order => ({
    ...order,
    _id: genObjectId(order._id),
    customerId: customerIdMap.get(order.customerId),
    products: JSON.parse(order.products.replace(/'/g, '"')).map(product => ({
      ...product,
      productId: productIdMap.get(product.productId),
    })),
  }));

  await Order.insertMany(transformedOrders);
  console.log("Orders Imported Successfully");
}

async function importAllData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    const count = await Order.countDocuments(); // Check if data exists
    if (count === 0) {
        console.log("No data found, importing...");
        await importCustomers();
        await importProducts();
        await importOrders();
        console.log("All data imported successfully with updated references!");
    } else {
        console.log("Data already exists, skipping import.");
    }
  } catch (error) {
    console.error("Error importing data:", error);
  } finally {
    mongoose.connection.close();
  }
}

importAllData();
