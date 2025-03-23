const mongoose = require("mongoose");

const Customer = require("../models/customer");
const Product = require("../models/product");
const Order = require("../models/order");

const { getCachedData, setDataInCache } = require('../redis/redisLayer');

const resolvers = {
  Query: {
    // get queries to view mongoDB data:

    async getCustomers(_, { limit = 10, offset = 0 }) {
      const customers = await Customer.find().skip(offset).limit(limit);
      const totalCount = await Customer.countDocuments();
      return { customers, totalCount };
    },

    async getOrders(_, { limit = 10, offset = 0 }) {
      const orders = await Order.find().skip(offset).limit(limit);
      const totalCount = await Order.countDocuments();
      return { orders, totalCount };
    },

    async getProducts(_, { limit = 10, offset = 0 }) {
      const products = await Product.find().skip(offset).limit(limit);
      const totalCount = await Product.countDocuments();
      return { products, totalCount };
    },
    
    // feature queries:

    async getCustomerSpending(_, { customerId }) {
      console.log('getCustomerSpending, payload:', { customerId });
      try {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
          throw new Error("Invalid customer ID format.");
        }

        const result = await Order.aggregate([
          { $match: { customerId: new mongoose.Types.ObjectId(customerId) } },
          { $group: {
              _id: "$customerId",
              totalSpent: { $sum: "$totalAmount" },
              avgOrderValue: { $avg: "$totalAmount" },
              lastOrderDate: { $max: "$orderDate" }
            }
          }
        ]);

        if (!result.length) {
          console.log(`No spending data found for customer ID: ${customerId}`);
          return null;
        }

        return {
          customerId,
          totalSpent: result[0].totalSpent,
          averageOrderValue: result[0].avgOrderValue,
          lastOrderDate: result[0].lastOrderDate.toISOString()
        };
      } catch (error) {
        console.error(`Error in getCustomerSpending: ${error.message}`);
        throw new Error("Failed to fetch customer spending data.");
      }
    },

    async getTopSellingProducts(_, { limit }) {
      console.log('getTopSellingProducts, payload:', { limit });
      try {
        if (limit <= 0) throw new Error("Limit must be greater than 0.");

        const products = await Order.aggregate([
          { $unwind: "$products" },
          { $group: { _id: "$products.productId", totalSold: { $sum: "$products.quantity" } } },
          { $sort: { totalSold: -1 } },
          { $limit: limit },
          { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
          { $unwind: "$product" },
          { $project: { productId: "$_id", name: "$product.name", totalSold: 1 } }
        ]);

        return products;
      } catch (error) {
        console.error(`Error in getTopSellingProducts: ${error.message}`);
        throw new Error("Failed to fetch top-selling products.");
      }
    },

    async getSalesAnalytics(_, { startDate, endDate }) {
      console.log('getSalesAnalytics, payload:', { startDate, endDate });
      try {
        const cacheKey = `salesAnalytics:${startDate}:${endDate}`;

        // Check Redis cache first
        const cachedData = await getCachedData({key: cacheKey});
        if (cachedData) {
          console.log("Cache hit for sales analytics.");
          return JSON.parse(cachedData);
        }

        // Validate date inputs
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          throw new Error("Invalid date format.");
        }

        // Perform MongoDB aggregation if no cache
        let result = await Order.aggregate([
          { $match: { orderDate: { $gte: start, $lte: end }, status: "completed" } },
          { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" }, completedOrders: { $sum: 1 } } },
          { $project: { _id: 0, totalRevenue: 1, completedOrders: 1 } }
        ]);

        const categoryBreakdown = await Order.aggregate([
          { $unwind: "$products" },
          { $lookup: { from: "products", localField: "products.productId", foreignField: "_id", as: "productDetails" } },
          { $unwind: "$productDetails" },
          { $group: { _id: "$productDetails.category", revenue: { $sum: { $multiply: ["$products.quantity", "$products.priceAtPurchase"] } } } },
          { $project: { category: "$_id", revenue: 1 } }
        ]);

        if (!result.length) result = { totalRevenue: 0, completedOrders: 0, categoryBreakdown: [] };
        result = { ...result[0], categoryBreakdown };

        // Store result in Redis (expires in 5 minutes)
        await setDataInCache({key: cacheKey, value: JSON.stringify(result), expiryTime: 300 });

        return result;
      } catch (error) {
        console.error(`Error in getSalesAnalytics: ${error.message}`);
        throw new Error("Failed to fetch sales analytics.");
      }
    },

    async getCustomerOrders(_, { customerId, limit = 10, offset = 0 }) {
      console.log('getCustomerOrders, payload:', { customerId, limit, offset });
      try {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
          throw new Error("Invalid customer ID format.");
        }

        const orders = await Order.find({ customerId })
          .sort({ orderDate: -1 })
          .skip(offset)
          .limit(limit);
        
        const totalCount = await Order.countDocuments({ customerId });

        return {
          orders: orders.map(order => ({
            ...order._doc,
            orderDate: order.orderDate.toISOString()
          })),
          totalCount
        };
      } catch (error) {
        console.error(`Error in getCustomerOrders: ${error.message}`);
        throw new Error("Failed to fetch customer orders.");
      }
    }
  },

  Mutation: {
    async placeOrder(_, { customerId, products }) {
      console.log('placeOrder, payload:', { customerId, products });
      try {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
          throw new Error("Invalid customer ID format.");
        }

        // Check if customer exists
        const customerExists = await Customer.findById(customerId);
        if (!customerExists) {
          throw new Error(`Customer with ID ${customerId} does not exist.`);
        }
        
        if (!Array.isArray(products) || products.length === 0) {
          throw new Error("Products array cannot be empty.");
        }

        let totalAmount = 0;
        for (const item of products) {
          const product = await Product.findById(item.productId);
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found.`);
          }
          totalAmount += item.quantity * item.priceAtPurchase;
        }

        const newOrder = new Order({
          _id: new mongoose.Types.ObjectId(),
          customerId,
          products,
          totalAmount,
          orderDate: new Date(),
          status: "pending"
        });

        await newOrder.save();

        return {
          ...newOrder._doc,
          orderDate: newOrder.orderDate.toISOString()
        };
      } catch (error) {
        console.error(`Error in placeOrder: ${error.message}`);
        throw new Error("Failed to place order.");
      }
    }
  }
};

module.exports = resolvers;
