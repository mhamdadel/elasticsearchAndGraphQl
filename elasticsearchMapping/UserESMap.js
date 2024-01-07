const UserEsMap = {
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
};