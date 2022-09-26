const faker = require("./faker");
const { createAvatar } = require("@dicebear/avatars");
const style = require("@dicebear/adventurer");

const SET_SIZE = 2500;
const DATA_TYPES = {
  company: "company",
};

const generateAvatar = (seed) => {
  let svg = createAvatar(style, {
    seed,
    dataUri: true,
  });
  return svg;
};

const generateCompanies = () => {
  const companies = [];
  const useSecondaryAddressEvery = 4;
  const skipImgEvery = 6;

  for (let i = 0; i < SET_SIZE; i++) {
    const stateCode = faker.address.stateAbbr();
    const address = {
      address1: faker.address.streetAddress(),
      city: faker.address.city(),
      state: stateCode,
      postalCode: faker.address.zipCodeByState(stateCode),
    };
    const name = faker.company.companyName();
    if (i % useSecondaryAddressEvery === 0) {
      address.address2 = faker.address.secondaryAddress();
    }

    const company = {
      id: `${DATA_TYPES.company}.${i}`,
      starred: false,
      name,
      description: `${faker.company.bsAdjective()} ${faker.company.catchPhraseDescriptor()} ${faker.company.catchPhraseNoun()}`,
      address,
    };
    if (i % skipImgEvery !== 0) {
      company.image = generateAvatar(name);
    }

    companies.push(company);
  }
  return companies;
};

const generateMockData = () => {
  const companies = generateCompanies();

  return {
    companies,
    search: companies,
  };
};

module.exports = { ...generateMockData() };
