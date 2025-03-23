const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Customer {
    _id: ID!
    name: String!
    email: String!
    age: Int!
    location: String!
    gender: String!
  }

  type Product {
    _id: ID!
    name: String!
    category: String
    price: Float!
    stock: Int!
  }

  type ProductOrder {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
  }
  
  type Order {
    _id: ID!
    customerId: String!
    products: [ProductOrder!]!
    totalAmount: Float!
    orderDate: String!
    status: String!
  }

  type PaginatedCustomers {
    customers: [Customer!]!
    totalCount: Int!
  }

  type PaginatedOrders {
    orders: [Order!]!
    totalCount: Int!
  }

  type PaginatedProducts {
    products: [Product!]!
    totalCount: Int!
  }

  type CustomerSpending {
    customerId: ID!
    totalSpent: Float!
    averageOrderValue: Float!
    lastOrderDate: String!
  }
  
  type TopProduct {
    productId: ID!
    name: String!
    totalSold: Int!
  }
  
  type SalesCategory {
    category: String!
    revenue: Float!
  }
  
  type SalesAnalytics {
    totalRevenue: Float!
    completedOrders: Int!
    categoryBreakdown: [SalesCategory!]!
  }

  type Query {
    getCustomers(limit: Int = 10, offset: Int = 0): PaginatedCustomers
    getOrders(limit: Int = 10, offset: Int = 0): PaginatedOrders
    getProducts(limit: Int = 10, offset: Int = 0): PaginatedProducts

    getCustomerSpending(customerId: ID!): CustomerSpending
    getTopSellingProducts(limit: Int!): [TopProduct]
    getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics
    getCustomerOrders(customerId: ID!, limit: Int = 10, offset: Int = 0): PaginatedOrders
  }
  
  type Mutation {
    placeOrder(customerId: ID!, products: [ProductOrderInput!]!): Order
  }
  
  input ProductOrderInput {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
  }
`;

module.exports = typeDefs;