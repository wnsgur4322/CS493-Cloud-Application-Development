const express = require('express');
const { ApolloServer } = require('apollo-server-express');

const typeDefs = require('./schema');
const UsersAPI = require('./datasources/users');
const PostsAPI = require('./datasources/posts');
const CommentsAPI = require('./datasources/comments');
const resolvers = require('./resolvers');

const userData = require('./data/users');
const postData = require('./data/posts');
const commentData = require('./data/comments');

const app = express();
const port = process.env.PORT || 8000;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    usersAPI: new UsersAPI({ data: userData }),
    postsAPI: new PostsAPI({ data: postData }),
    commentsAPI: new CommentsAPI({ data: commentData })
  })
 });
server.applyMiddleware({ app });

app.listen(port, () => {
  console.log("== Server listening on port", port);
});
