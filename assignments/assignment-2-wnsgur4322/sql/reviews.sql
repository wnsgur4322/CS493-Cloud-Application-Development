SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

DROP TABLE IF EXISTS reviews;
CREATE TABLE IF NOT EXISTS reviews (
	id MEDIUMINT NOT NULL,
	userid MEDIUMINT NOT NULL,
	businessid MEDIUMINT NOT NULL,
	dollars MEDIUMINT NOT NULL,
	stars MEDIUMINT NOT NULL,
	review TEXT,
  INDEX idx_userid (userid),
	INDEX idx_businessid (businessid)
);
INSERT INTO reviews VALUES
    (0,7,8,1,4.5,'Cheap, delicious food.'),
    (1,25,2,1,4,'How many fasteners can one room hold?'),
    (2,26,1,1,5,'Joel, the owner, is super friendly and helpful.'),
    (3,21,14,2,4,NULL),
    (4,28,18,1,4,'Good beer, good food, though limited selection.'),
    (5,21,9,1,5,'A Corvallis gem.'),
    (6,26,8,1,5,'Yummmmmmm!'),
    (7,25,18,2,4.5,NULL),
    (8,20,2,2,4,NULL),
    (9,6,15,2,5,'Try the hazlenut torte.  It''s the best!');

ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `reviews`
  MODIFY `id` MEDIUMINT NOT NULL AUTO_INCREMENT;
