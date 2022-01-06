SELECT properties.*, AVG(property_reviews.rating) AS average_rating
FROM properties
JOIN property_reviews ON properties.id = property_id
WHERE city LIKE '%ancouv%'
GROUP BY properties.id
HAVING AVG(property_reviews.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;

-- SELECT properties.id,
--   owner_id,
--   title,
--   description,
--   thumbnail_photo_url,
--   cover_photo_url,
--   cost_per_night,
--   parking_spaces,
--   number_of_bathrooms,
--   number_of_bedrooms,
--   country,
--   street,
--   city,
--   province,
--   post_code,
--   active,
--   AVG(property_reviews.rating) AS average_rating
-- FROM properties
-- JOIN property_reviews ON property_reviews.property_id = properties.id
-- WHERE city = 'Vancouver'
-- GROUP BY properties.id
-- HAVING AVG(property_reviews.rating) >= 4
-- ORDER BY cost_per_night
-- LIMIT 10;