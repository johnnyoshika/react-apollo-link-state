import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';

import './App.css';

const GET_REPOSITORIES_OF_ORGANIZATION = gql`
  {
    organization(login: "the-road-to-learn-react") {
      repositories(first: 20) {
        edges {
          node {
            id
            name
            url
            viewerHasStarred
          }
        }
      }
    }
  }
`;

const STAR_REPOSITORY = gql`
  mutation($id: ID!) {
    addStar(input: { starrableId: $id }) {
      starrable {
        id
        viewerHasStarred
      }
    }
  }
`;


const App = () => {
  const { data, loading } = useQuery(GET_REPOSITORIES_OF_ORGANIZATION);

  if (loading && !data) return <div>Loading ...</div>;

  const { organization } = data;
  if (!organization) return <div>Loading ...</div>;

  return (
    <Repositories repositories={organization.repositories} />
  );
};

const RepositoryList = ({
  repositories,
  selectedRepositoryIds
}) => (
  <ul>
    {repositories.edges.map(({ node }) => {
      const isSelected = selectedRepositoryIds.includes(node.id);
      const rowClassName = ['row'];
      if (isSelected)
        rowClassName.push('row_selected');

      return (
        <li className={rowClassName.join(' ')} key={node.id}>
          <Select
            id={node.id}
            isSelected={isSelected}
          />{' '}
          <a href={node.url}>{node.name}</a>{' '}
          {!node.viewerHasStarred && <Star id={node.id} />}
        </li>
      );
    })}
  </ul>
);

const Star = ({ id }) => {
  const [addStar] = useMutation(STAR_REPOSITORY, {
    variables: {
      id
    }
  });

  return (
    <button type="button" onClick={addStar}>
      Star
    </button>
  );
};

export const GET_SELECTED_REPOSITORIES = gql`
  query {
    selectedRepositoryIds @client
  }
`;

const Repositories = ({ repositories }) => {
  const { data: { selectedRepositoryIds } } = useQuery(GET_SELECTED_REPOSITORIES);

  return (
    <RepositoryList
      repositories={repositories}
      selectedRepositoryIds={selectedRepositoryIds}
    />
  );
};

const SELECT_REPOSITORY = gql`
  mutation($id: ID!, $isSelected: Boolean!) {
    toggleSelectRepository(id: $id, isSelected: $isSelected) @client {
      id
      isSelected
    }
  }
`;

const Select = ({ id, isSelected }) => {
  const [toggleSelectRepository] = useMutation(SELECT_REPOSITORY, {
    variables: {
      id,
      isSelected
    }
  });

  return (
    <button
      type="button"
      onClick={toggleSelectRepository}
    >
      {isSelected ? 'Unselect' : 'Select'}
    </button>
  );
};

export default App;