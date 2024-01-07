const postElasticsearchMapping = {
  "mappings": {
    "properties": {
      "userId": { "type": "integer" },
      "id": { "type": "integer" },
      "title": { "type": "text" },
      "body": { "type": "text" }
    }
  }
};

module.exports = postESMapping;