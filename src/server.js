require("dotenv").config();
const { ApolloServer } = require("apollo-server-express");
const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

const modules = require("./modules");
const contextMiddleware = require("./utils/contextMiddleware");
const PORT = process.env.PORT || 8000;

const server = new ApolloServer({
  modules,
  context: contextMiddleware,
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  console.log(`http://localhost:${PORT}` + server.graphqlPath);
  console.log(`ws://localhost:${PORT}` + server.graphqlPath);
});
