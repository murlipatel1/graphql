const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// In-memory data store (replace with a database in a real-world scenario)
let users = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

// GraphQL schema
const schema = buildSchema(`
  type User {
    id: ID!
    name: String!
    email: String!
  }

  type Query {
    getUser(id: ID!): User
    getUsers: [User]
  }

  type Mutation {
    addUser(name: String!, email: String!): User
    updateUser(id: ID!, name: String, email: String): User
    deleteUser(id: ID!): User
  }
`);

// GraphQL resolvers
const root = {
  getUser: ({ id }) => users.find(user => user.id === id),
  getUsers: () => users,
  addUser: ({ name, email }) => {
    const newUser = { id: String(users.length + 1), name, email };
    users.push(newUser);
    return newUser;
  },
  updateUser: ({ id, name, email }) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = { ...users[userIndex], name, email };
    users[userIndex] = updatedUser;
    return updatedUser;
  },
  deleteUser: ({ id }) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const deletedUser = users[userIndex];
    users = users.filter(user => user.id !== id);
    return deletedUser;
  },
};

// Create an express application
const app = express();

// GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true, // Enable the GraphiQL UI for testing in the browser
  })
);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}/graphql`);
});
