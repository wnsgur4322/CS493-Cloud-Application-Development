const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');

const app = express();
const port = process.env.PORT || 8000;

const server = new ApolloServer({ typeDefs });
server.applyMiddleware({ app });

app.listen(port, () => {
  console.log("== Server listening on port", port);
})
