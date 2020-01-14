import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/react-hooks';

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
    <RepositoryList repositories={organization.repositories} />
  );
};

const RepositoryList = ({ repositories }) => (
  <ul>
    {repositories.edges.map(({ node }) => (
      <li key={node.id}>
        <a href={node.url}>{node.name}</a>{' '}
        {!node.viewerHasStarred && <Star id={node.id} />}
      </li>
    ))}
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

export default App;