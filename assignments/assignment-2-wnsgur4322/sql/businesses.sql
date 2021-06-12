SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
DROP TABLE IF EXISTS businesses;
CREATE TABLE IF NOT EXISTS businesses (
	id MEDIUMINT NOT NULL,
	ownerid MEDIUMINT NOT NULL,
	name VARCHAR(255) NOT NULL,
	address VARCHAR(255) NOT NULL,
	city VARCHAR(255) NOT NULL,
	state CHAR(2) NOT NULL,
	zip CHAR(5) NOT NULL,
	phone VARCHAR(255) NOT NULL,
	category VARCHAR(255) NOT NULL,
	subcategory VARCHAR(255) NOT NULL,
	website TEXT,
	INDEX idx_ownerid (ownerid)
);
INSERT INTO businesses VALUES
    (0,0,'Block 15','300 SW Jefferson Ave.','Corvallis','OR',97333,'541-758-2077','Restaurant','Brewpub','http://block15.com'),
    (1,1,'Corvallis Brewing Supply','119 SW 4th St.','Corvallis','OR',97333,'541-758-1674','Shopping','Brewing Supply','http://www.lickspigot.com'),
    (2,2,'Robnett''s Hardware','400 SW 2nd St.','Corvallis','OR',97333,'541-753-5531','Shopping','Hardware',NULL),
    (3,3,'First Alternative Co-op North Store','2855 NW Grant Ave.','Corvallis','OR',97330,'541-452-3115','Shopping','Groceries',NULL),
    (4,4,'WinCo Foods','2335 NW Kings Blvd.','Corvallis','OR',97330,'541-753-7002','Shopping','Groceries',NULL),
    (5,5,'Fred Meyer','777 NW Kings Blvd.','Corvallis','OR',97330,'541-753-9116','Shopping','Groceries',NULL),
    (6,6,'Interzone','1563 NW Monroe Ave.','Corvallis','OR',97330,'541-754-5965','Restaurant','Coffee Shop',NULL),
    (7,7,'The Beanery Downtown','500 SW 2nd St.','Corvallis','OR',97333,'541-753-7442','Restaurant','Coffee Shop',NULL),
    (8,8,'Local Boyz','1425 NW Monroe Ave.','Corvallis','OR',97330,'541-754-5338','Restaurant','Hawaiian',NULL),
    (9,9,'Darkside Cinema','215 SW 4th St.','Corvallis','OR',97333,'541-752-4161','Entertainment','Movie Theater','http://darksidecinema.com'),
    (10,10,'The Book Bin','215 SW 4th St.','Corvallis','OR',97333,'541-752-0040','Shopping','Book Store',NULL),
    (11,11,'Cyclotopia','435 SW 2nd St.','Corvallis','OR',97333,'541-757-9694','Shopping','Bicycle Shop',NULL),
    (12,12,'Corvallis Cyclery','344 SW 2nd St.','Corvallis','OR',97333,'541-752-5952','Shopping','Bicycle Shop',NULL),
    (13,13,'Oregon Coffee & Tea','215 NW Monroe Ave.','Corvallis','OR',97333,'541-752-2421','Shopping','Tea House','http://www.oregoncoffeeandtea.com'),
    (14,14,'Spaeth Lumber','1585 NW 9th St.','Corvallis','OR',97330,'541-752-1930','Shopping','Hardware',NULL),
    (15,15,'New Morning Bakery','219 SW 2nd St.','Corvallis','OR',97333,'541-754-0181','Restaurant','Bakery',NULL),
    (16,3,'First Alternative Co-op South Store','1007 SE 3rd St.','Corvallis','OR',97333,'541-753-3115','Shopping','Groceries',NULL),
    (17,7,'The Beanery Monroe','2541 NW Monroe Ave.','Corvallis','OR',97330,'541-757-0828','Restaurant','Coffee Shop',NULL),
    (18,0,'Block 15 Brewery & Tap Room','3415 SW Deschutes St.','Corvallis','OR',97333,'541-752-2337','Restaurant','Brewpub','http://block15.com');

ALTER TABLE `businesses`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `businesses`
  MODIFY `id` MEDIUMINT NOT NULL AUTO_INCREMENT;

