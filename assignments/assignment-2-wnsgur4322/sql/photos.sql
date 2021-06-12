SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

DROP TABLE IF EXISTS photos;
CREATE TABLE IF NOT EXISTS photos (
	id MEDIUMINT NOT NULL,
	userid MEDIUMINT NOT NULL,
	businessid MEDIUMINT NOT NULL,
	caption TEXT,
	INDEX idx_userid (userid),
	INDEX idx_businessid (businessid)
);
INSERT INTO photos VALUES
    (0,7,8,'This is my dinner.'),
    (1,25,2,NULL),
    (2,26,1,'Hops'),
    (3,21,14,NULL),
    (4,28,18,'Sticky Hands'),
    (5,21,9,'Popcorn!'),
    (6,26,8,NULL),
    (7,25,18,'Big fermentor'),
    (8,20,2,NULL),
    (9,6,15,'Cake!');

ALTER TABLE `photos`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `photos`
  MODIFY `id` MEDIUMINT NOT NULL AUTO_INCREMENT;