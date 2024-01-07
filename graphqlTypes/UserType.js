const AdressType = require("./AdressType");
const CompanyType = require("./CompanyType");

module.exports = `
type User {
  id: Int
  name: String
  username: String
  email: String
  address: ${AdressType}
  phone: String
  website: String
  company: ${CompanyType}
}
`;
