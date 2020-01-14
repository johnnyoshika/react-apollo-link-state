import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';

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

const App = () => {
  const { data, loading, error } = useQuery(GET_REPOSITORIES_OF_ORGANIZATION);

  if (loading && !data) return <div>Loading ...</div>;
  
  const { organization } = data;
  if (!organization) return <div>Loading ...</div>;

  return (
    <div>
      <RepositoryList repositories={organization.repositories} />
    </div>
  );
};

const RepositoryList = ({ repositories }) => (
  <ul>
    {repositories.edges.map(({ node }) => (
        <li key={node.id}>
          <a href={node.url}>{node.name}</a>
        </li>
     ))}
  </ul>
);

export default App;