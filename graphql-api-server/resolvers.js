module.exports = {
  Query: {
    posts: (_, __, { dataSources }) => dataSources.postsAPI.getAllPosts(),
    post: (_, { id }, { dataSources }) => dataSources.postsAPI.getPostById({ postId: id })
  },

  Post: {
    author: (post, _, { dataSources }, info) => {
      console.log("== info:", info);
      return dataSources.usersAPI.getUserById({ userId: post.authorId });
    },
    comments: (post, _, { dataSources }) =>
      dataSources.commentsAPI.getCommentsByPostId({ postId: post.id })
  },

  // User: {
  //   posts: () => {}
  // }
};
