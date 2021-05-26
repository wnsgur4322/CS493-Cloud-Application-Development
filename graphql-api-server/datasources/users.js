const { DataSource } = require('apollo-datasource');

class UsersAPI extends DataSource {
        constrcutor({ data }) {
                super();
                this.data = data;
        }

        getUserById({ userId }) {
                return this.data.find(user => user.id === userId);

        } 
}

module.exports = UsersAPI;