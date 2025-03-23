require("dotenv").config();
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");

const { redisConn } = require('./redis/client');

if (!process.env.MONGO_URI) {
  console.error("Missing MONGO_URI in .env file.");
  process.exit(1);
}

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    console.error(`GraphQL Error: ${err.message}`);
    return err;
  },
});

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    // MongoDB Connection 
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Redis Connection
    await redisConn();

    // starting Apollo Server
    await server.start();
    server.applyMiddleware({ app });

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/graphql`);
    });

  } catch (error) {
    console.error(`Error starting server: ${error.message}`);
    process.exit(1);
  }
}

startServer();

