const geolocationType = require("./GeolocationType.js");

module.exports = `type Address {
  street: String
  suite: String
  city: String
  zipcode: String
  geo: ${geolocationType}
}`;
