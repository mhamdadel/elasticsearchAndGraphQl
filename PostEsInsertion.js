const { Client } = require('@elastic/elasticsearch');
const postESMapping = require('./elasticsearchMapping/UserESMap');

const client = new Client({
  node: 'http://localhost:9200'
});

const INDEX = 'posts';

async function createIndex() {
  await client.indices.create({
    index: INDEX,
    body: postESMapping
  }, { ignore: [400] });
}

async function fetchDataAndInsert() {
  

  const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
    method: "GET",
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const posts = await response.json();

  const body = posts.flatMap(doc => [{ index: { _index: INDEX } }, doc]);

  const { body: bulkResponse } = await client.bulk({ refresh: true, body });

  if (bulkResponse.errors) {
    console.error('Error in bulk insert:', bulkResponse.errors);
  }

  const { body: count } = await client.count({ index: INDEX });
  console.log('Total documents in index:', count);
}

async function run() {
  try {
    await createIndex();
    await fetchDataAndInsert();
  } catch (error) {
    console.error('Error:', error);
  }
}

run().catch(e => console.log(e))
