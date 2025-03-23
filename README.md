## Overview
This project provides GraphQL API to analyze revenue, customer spending behavior, and product sales trends using **MongoDB, GraphQL, Node.js, Redis**. GraphQL queries and aggregations that efficiently retrieve the required insights. It allows querying customers, orders, and products with pagination, along with analytical queries such as top-selling products and customer spending. The API is containerized using **Docker** for easy deployment.

---

## Features
- **GraphQL APIs**
  - to fetch customers, orders, products with pagination (limit, offset)
  - Analytics: Top-selling products, customer spending, sales analytics
  - get customer orders with pagination
  - mutation for placing an order with validations
- **Caching** using Redis for performance optimization
- **MongoDB Aggregations** for efficient queries, indexes where necessary
- **Dockerized Setup**: To manage without manuall setup - MongoDB, Redis, GraphQL service & one time Import-data containers
- Provided sample GraphQL Queries for testing in a queries.graphql file

---

## Demo Video
[Demo Video Link](https://drive.google.com/file/d/101Mkfjb38R7AxrrN-iOet6mN0PWu2Ggo/view?usp=sharing)

---

## Prerequisites
Ensure you have the following installed:
- for no manuall setup of MongoDB, Redis, one-time seed data import:
  - [Docker](https://www.docker.com/get-started)
- if running manually:
  - [Node.js](https://nodejs.org/)
  - [MongoDB](https://www.mongodb.com/) - can use Cloud MongoDB Atlas
  - Start Redis server locally
  - need to add .env file variables

---

## Setup Instructions
### 1. Clone the Repository
```sh
# Clone the project
git clone https://github.com/Rachit-Goel/mongo_graphql_service.git
cd mongo_graphql_service
```
---

### 2. Running with Docker (Recommended)
This method ensures MongoDB, Redis, and the GraphQL server run in isolated containers without manuall setup for Redis & MongoDB. Also I have added a one time script for importing seed data into MongoDb.

if port 6379 already in use in local, then either kill local process or change redis external port in docker-compose.yml file
  - check with ```ps aux | grep redis```
  - kill with ```kill -9 <p_id> ```

```sh
docker compose up --build
```
This will:
- Start **MongoDB**, **Redis**, and **GraphQL server**
- Automatically import seed data into MongoDB

---

#### Stopping Docker Services
To stop the running containers:
```sh
docker compose down
```

---

### 2. Running Manually (Without Docker)

#### 2a. Install Dependencies
```sh
npm install
```

#### 2b. Start MongoDB & Redis (Locally)
- Start **MongoDB** Server: Can create cloud MongoDb Atlas DB
- Start **Redis**: Ensure Redis is running on `localhost:6379`

#### 2c. Environment Configuration
- Create a `.env` file in the root directory and set environment variables:
    ```env
    MONGO_URI=mongodb://<username>:<password>@<host_url>
    REDIS_HOST=localhost
    REDIS_PORT=6379
    PORT=4000
    ```
    
#### 2d. To manually import MongoDB Data from seed data in .csv files
Run
```sh
node importToMongoDb.js
```

#### 2e. Start Service
Run
```sh
node start
```

---

### 3. Access the API
Open GraphQL Playground:
```
http://localhost:4000/graphql
```
Then from UI you can click to open apollo graphql studio to run query.

Available all sample queries in queries.graphql file, change variables as required.

---

## Note

In requirement doc. ObjectId is shown for _id but in seed data string of UUID for _id.

I have used ObjectId as it provides better indexing & querying in MongoDB.
So in importing seed data to MongoDB script, i have converted _id from uuid string to ObjectId. So all _id will be different from seed data. To see _id for query variable inputs, get queries are available for all collections.

