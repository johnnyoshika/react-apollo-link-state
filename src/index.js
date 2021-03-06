import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { withClientState } from 'apollo-link-state';
import { InMemoryCache } from 'apollo-cache-inmemory';
import './index.css';
import App, { GET_REPOSITORIES_OF_ORGANIZATION, GET_SELECTED_REPOSITORIES } from './App';
import * as serviceWorker from './serviceWorker';

const initialState = {
  selectedRepositoryIds: ['MDEwOlJlcG9zaXRvcnk2MzM1MjkwNw==']
};

const toggleSelectRepository = (_, { id, isSelected }, { cache }) => {
  let { selectedRepositoryIds } = cache.readQuery({
    query: GET_SELECTED_REPOSITORIES
  });

  selectedRepositoryIds = isSelected
    ? selectedRepositoryIds.filter(itemId => itemId !== id)
    : selectedRepositoryIds.concat(id);

  cache.writeQuery({
    query: GET_SELECTED_REPOSITORIES,
    data: { selectedRepositoryIds }
  });

  return { id, isSelected: !isSelected };
};

const selectAllRepositories = (_, __, { cache }) => {
  let { organization: { repositories: { edges } } } = cache.readQuery({
    query: GET_REPOSITORIES_OF_ORGANIZATION
  });

  cache.writeQuery({
    query: GET_SELECTED_REPOSITORIES,
    data: {
      selectedRepositoryIds: edges.map(edge => edge.node.id)
    }
  });
};

const unSelectAllRepositories = (_, __, { cache }) => {
  cache.writeQuery({
    query: GET_SELECTED_REPOSITORIES,
    data: {
      selectedRepositoryIds: []
    }
  });
};

const cache = new InMemoryCache();
const stateLink = withClientState({
  cache,
  defaults: initialState,
  resolvers: {
    Mutation: {
      toggleSelectRepository,
      selectAllRepositories,
      unSelectAllRepositories
    }
  }
});

const GITHUB_BASE_URL = 'https://api.github.com/graphql';
const httpLink = new HttpLink({
  uri: GITHUB_BASE_URL,
  headers: {
    authorization: `Bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
    }`,
  },
});

const link = ApolloLink.from([stateLink, httpLink]);

const client = new ApolloClient({
  link,
  cache,
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
