const { Client } = require('@elastic/elasticsearch');
const UserEsMap = require('./elasticsearchMapping/UserESMap');

const client = new Client({
  node: 'http://localhost:9200'
})

const INDEX = 'users';

async function run () {
  await client.indices.create({
    index: INDEX,
    body: UserEsMap
  }, { ignore: [400] })

  const dataset = [];

  const response = await fetch('https://jsonplaceholder.typicode.com/users', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const users = await response.json();

  dataset.push(...users);

  const body = dataset.flatMap(doc => [{ index: { _index: INDEX } }, doc])
  console.log(body)

  const { body: bulkResponse } = await client.bulk({ refresh: true, body })

  if (bulkResponse.errors) {
    const erroredDocuments = []
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0]
      if (action[operation].error) {
        erroredDocuments.push({
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1]
        })
      }
    })
    console.log(erroredDocuments)
  }

  const { body: count } = await client.count({ index: INDEX })
  console.log(count)
}

run().catch(es => console.log(es.flatMap(e => e)))