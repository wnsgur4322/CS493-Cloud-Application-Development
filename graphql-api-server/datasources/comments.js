const { DataSource } = require('apollo-datasource');

class CommentsAPI extends DataSource {
        constrcutor({ data }) {
                super();
                this.data = data;
        }

        getCommentsByPostId({ postId }) {
                return this.data.filter(comment => comment.postId === postId);
        }
}

module.exports = CommentsAPI;