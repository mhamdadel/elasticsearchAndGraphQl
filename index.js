const express = require("express");
const { ApolloServer, gql } = require("apollo-server-express");
const { Client } = require("@elastic/elasticsearch");

const app = express();

// Use a more descriptive index name
const INDEX_NAME = "articles";

const esClient = new Client({
  node: "http://localhost:9200",
  log: "trace",
  headers: {
      "Content-Type": "application/json",
  },
});


// Generate a unique and deterministic ID for each document
const generateUniqueId = () => {
    return Date.now().toString(); // You may want to use a more robust method for production
};

const createSampleData = async () => {
    await createIndexMapping();
    const sampleData = [
        {
            title: "Sample Title 1",
            content: "Sample content for article 1.",
            keywords: ["keyword1", "keyword2"],
            author: {
                id: "author1",
                name: "Author Name 1",
            },
        },
        {
            title: "Sample Title 9",
            content: "Sample content for article 9.",
            keywords: ["keyword88", "keyword99"],
            author: {
                id: "author9",
                name: "Author Name 9",
            },
        },
    ];

    const bulkRequestBody = sampleData.map((doc) => ({
        index: {
            _index: INDEX_NAME,
            _id: generateUniqueId(),
        },
        document: doc,
    }));

    try {
        const response = await esClient.bulk(
            {
                index: INDEX_NAME,
                body: bulkRequestBody,
                refresh: "wait_for",
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Sample data inserted:", response.body);
    } catch (error) {
        console.error("Error inserting sample data:", error);
    }
};

const createIndexMapping = async () => {
  try {
      const indexExists = await esClient.indices.exists({
          index: INDEX_NAME,
      });

      if (!indexExists.body) { 
          const response = await esClient.indices.create({
              index: INDEX_NAME,
              body: {
                  mappings: {
                      properties: {
                          title: { type: "text" },
                          content: { type: "text" },
                          keywords: { type: "keyword" },
                          author: {
                              properties: {
                                  id: { type: "keyword" },
                                  name: { type: "text" },
                              },
                          },
                      },
                  },
              }
          }, {
            
            headers: {
              "Content-Type": "application/json",
          },
          });

          console.log("Index created:", response.body);
      } else {
          console.log("Index already exists.");
      }
  } catch (error) {
      console.error("Error creating index:", error.meta.body, error?.meta?.body?.root_cause);
  }
};


createSampleData();

const typeDefs = gql`
    type Author {
        id: ID!
        name: String!
    }

    type Article {
        id: ID!
        title: String!
        content: String!
        keywords: [String!]!
        author: Author!
    }

    type Query {
        searchArticles(query: String!): [Article]!
    }
`;

const resolvers = {
    Query: {
        searchArticles: async (_, { query }) => {
            try {
                /*
              {
                "query": {
                    "multi_match": {
                      "query": "sample search",
                      "fields": ["title", "content", "keywords"],
                      "type": "cross_fields",
                      "operator": "and"
                    }
                  }
              }

              */
                const response = await esClient.search({
                    index: INDEX_NAME,
                    body: {
                        query: {
                            multi_match: {
                                query,
                                fields: ["title^4", "content", "keywords", "author.id"],
                                type: "cross_fields",
                                operator: "or",
                            },
                        }
                    },
                });
                return response.body.hits.hits.map((hit) => hit._source);
            } catch (error) {
                console.error("Error searching articles:", error);
                return [];
            }
        },
    },
};


async function startServer() {
    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    server.applyMiddleware({ app });
}

startServer()
    .then(() => {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(
                `Server is running on http://localhost:${PORT}/graphql`
            );
        });
    })
    .catch(console.error);
