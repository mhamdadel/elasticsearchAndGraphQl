const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: 'http://localhost:9200'
})

async function run () {
  await client.indices.create({
    index: 'users',
    body: {
      "mappings": {
        "properties": {
          "id": {
            "type": "integer"
          },
          "name": {
            "type": "text"
          },
          "username": {
            "type": "keyword"
          },
          "email": {
            "type": "text"
          },
          "address": {
            "type": "nested",
            "properties": {
              "street": { "type": "text" },
              "suite": { "type": "text" },
              "city": { "type": "text" },
              "zipcode": { "type": "keyword" },
              "geo": {
                "type": "geo_point"
              }
            }
          },
          "phone": {
            "type": "text"
          },
          "website": {
            "type": "text"
          },
          "company": {
            "type": "nested",
            "properties": {
              "name": { "type": "text" },
              "catchPhrase": { "type": "text" },
              "bs": { "type": "text" }
            }
          }
        }
      }
    }
  }, { ignore: [400] })

  const dataset = [];

  (async () => {
    
  })();

  const body = dataset.flatMap(doc => [{ index: { _index: 'tweets' } }, doc])

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

  const { body: count } = await client.count({ index: 'users' })
  console.log(count)
}

run().catch(console.log)