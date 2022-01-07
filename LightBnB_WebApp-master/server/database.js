const { Pool } = require('pg');
const properties = require('./json/properties.json');
const users = require('./json/users.json');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb',
  // port: '5432',
});

pool.connect().then(() => {
  console.log('We have connected to the database.');
}).catch((err) => {
  console.log('Error: ', err);
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = (email) => {
  const value = [email];
  // eslint-disable-next-line quotes
  const queryString = `SELECT * FROM users WHERE email = $1`;
  return pool
    .query(queryString, value)
    .then((result) => {
      if (result.rows.length === 1) {
        return result.rows[0];
      }
      return null;
    })
    .catch((err) => console.log('Error: ', err));
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = (id) => {
  // eslint-disable-next-line quotes
  const queryString = `SELECT * FROM users WHERE id = $1`;
  const value = [id];
  return pool
    .query(queryString, value)
    .then((result) => {
      if (result.rows.length > 0) {
        return result.rows[0];
      }
      return null;
    })
    .catch((err) => console.log('Error: ', err));
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = (user) => {
  // eslint-disable-next-line quotes
  const queryString = `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *`;
  const value = [user.name, user.email, user.password];
  return pool
    .query(queryString, value)
    .then((result) => result.rows[0])
    .catch((err) => console.log('Error: ', err));
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = (guest_id, limit = 10) => {
  // eslint-disable-next-line quotes
  const queryString = `
    SELECT *
    FROM properties
    JOIN reservations ON property_id = properties.id
    WHERE guest_id = $1
    LIMIT $2`;
  const value = [guest_id, limit];
  return pool
    .query(queryString, value)
    .then((result) => result.rows)
    .catch((err) => console.log('Error: ', err));
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  const queryParams = [];
  const andWhere = () => {
    if (queryParams.length > 1) {
      queryString += 'AND ';
    } else {
      queryString += 'WHERE ';
    }
  };

  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    andWhere();
    queryString += `city LIKE $${queryParams.length}
    `;
  }

  if (options.user_id) {
    queryParams.push(options.user_id);
    andWhere();
    queryString += `user_id = $${queryParams.length}
    `;
  }

  if (options.minimum_price_per_night) {
    queryParams.push(Number(options.minimum_price_per_night) * 100);
    andWhere();
    queryString += `properties.cost_per_night >= $${queryParams.length}
    `;
  }

  if (options.maximum_price_per_night) {
    queryParams.push(Number(options.maximum_price_per_night) * 100);
    andWhere();
    queryString += `properties.cost_per_night < $${queryParams.length}
    `;
  }

  queryString += `GROUP BY properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(Number(options.minimum_rating));
    queryString += `HAVING AVG(property_reviews.rating) >= $${queryParams.length}
    `;
  }

  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};`;

  console.log((options));

  console.log(queryString, queryParams);

  return pool
    .query(queryString, queryParams)
    .then((res) => res.rows)
    .catch((err) => console.log('Error: ', err));
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
