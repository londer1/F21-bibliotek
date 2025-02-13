-- MySQL dump 10.13  Distrib 8.0.40, for Linux (x86_64)
--
-- Host: localhost    Database: f21
-- ------------------------------------------------------
-- Server version	8.0.40-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Biblioteksbøker`
--

DROP TABLE IF EXISTS `Biblioteksbøker`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Biblioteksbøker` (
  `BokID` int NOT NULL AUTO_INCREMENT,
  `Tittel` varchar(255) DEFAULT NULL,
  `Forfatter` varchar(255) DEFAULT NULL,
  `ISBN` varchar(13) DEFAULT NULL,
  PRIMARY KEY (`BokID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Biblioteksbøker`
--

LOCK TABLES `Biblioteksbøker` WRITE;
/*!40000 ALTER TABLE `Biblioteksbøker` DISABLE KEYS */;
INSERT INTO `Biblioteksbøker` VALUES (1,'Borgars sugebok','Borgar Faldin Brynjarsson','1234567890123'),(2,'Historien om T-town','Erling Eple','9780747532699'),(3,'The Great Adventure','John Doe','9781234567890'),(4,'The Last Chapter','Jane Smith','9780987654321');
/*!40000 ALTER TABLE `Biblioteksbøker` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Brukere`
--

DROP TABLE IF EXISTS `Brukere`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Brukere` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('bibliotekar','bruker') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Brukere`
--

LOCK TABLES `Brukere` WRITE;
/*!40000 ALTER TABLE `Brukere` DISABLE KEYS */;
INSERT INTO `Brukere` VALUES (2,'admin','$2a$10$PViTimkNe5cXQU0O1/umpuLfmVE.C5Vv6FUu1p1PYROHCEuPO8T8i','bibliotekar');
/*!40000 ALTER TABLE `Brukere` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Elev`
--

DROP TABLE IF EXISTS `Elev`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Elev` (
  `ElevID` int NOT NULL AUTO_INCREMENT,
  `Fornavn` varchar(50) DEFAULT NULL,
  `Etternavn` varchar(50) DEFAULT NULL,
  `Kjønn` char(2) DEFAULT NULL,
  `Klassetrinn` varchar(10) DEFAULT NULL,
  `Programfag` varchar(50) DEFAULT NULL,
  `Programkode` varchar(10) DEFAULT NULL,
  `Fødselsdato` date DEFAULT NULL,
  PRIMARY KEY (`ElevID`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Elev`
--

LOCK TABLES `Elev` WRITE;
/*!40000 ALTER TABLE `Elev` DISABLE KEYS */;
INSERT INTO `Elev` VALUES (1,'Erling','Eple','XY','VG1','Informasjonsteknologi og medieproduksjon','IM','2008-07-07'),(2,'Maria','Syltetøy','XX','VG1','Informasjonsteknologi og medieproduksjon','IM','2008-03-30'),(3,'Per','Mus','XY','VG2','Medieproduksjon','MP','2007-08-01'),(4,'Emilie','Larsen','XX','VG2','Medieproduksjon','MP','2007-12-30'),(5,'Borgar','Raspeballer','XY','VG2','Medieproduksjon','MP','2007-05-26'),(6,'Line','Lim','XX','VG1','Informasjonsteknologi og medieproduksjon','IM','2008-06-10'),(8,'Sofie','Lockert','XX','VG2','Medieproduksjon','MP','2007-02-11'),(9,'Thomas','Guatti','XY','VG2','Medieproduksjon','MP','2007-09-02'),(10,'Endre','Svensen','XY','VG1','Informasjonsteknologi og medieproduksjon','IM','2008-06-17'),(11,'Jakob','Sandkasse','XY','VG1','Studiespesialisering','STD','2008-09-26'),(12,'Eva','Enorm','XX','VG1','Studiespesialisering','STD','2008-05-28'),(13,'Mikkel','Gyatt','XY','VG2','Studiespesialisering','STD','2007-11-06'),(14,'Endra','Sviddsen','XX','VG3','Studiespesialisering','STD','2006-11-22'),(15,'Andreas','Fleinsoppsvingen','XY','VG3','Studiespesialisering','STD','2006-05-13');
/*!40000 ALTER TABLE `Elev` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Klasse`
--

DROP TABLE IF EXISTS `Klasse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Klasse` (
  `StudentID` int NOT NULL AUTO_INCREMENT,
  `Fornavn` varchar(50) DEFAULT NULL,
  `Etternavn` varchar(50) DEFAULT NULL,
  `Klasse` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`StudentID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Klasse`
--

LOCK TABLES `Klasse` WRITE;
/*!40000 ALTER TABLE `Klasse` DISABLE KEYS */;
/*!40000 ALTER TABLE `Klasse` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Utlånsoversikt`
--

DROP TABLE IF EXISTS `Utlånsoversikt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Utlånsoversikt` (
  `UtlånsID` int NOT NULL AUTO_INCREMENT,
  `BokID` int DEFAULT NULL,
  `ElevID` int DEFAULT NULL,
  `Utlånsdato` date DEFAULT NULL,
  `Returdato` date DEFAULT NULL,
  PRIMARY KEY (`UtlånsID`),
  KEY `BokID` (`BokID`),
  KEY `ElevID` (`ElevID`),
  CONSTRAINT `fk_elev` FOREIGN KEY (`ElevID`) REFERENCES `Elev` (`ElevID`),
  CONSTRAINT `Utlånsoversikt_ibfk_1` FOREIGN KEY (`BokID`) REFERENCES `Biblioteksbøker` (`BokID`),
  CONSTRAINT `Utlånsoversikt_ibfk_2` FOREIGN KEY (`BokID`) REFERENCES `Biblioteksbøker` (`BokID`),
  CONSTRAINT `Utlånsoversikt_ibfk_3` FOREIGN KEY (`ElevID`) REFERENCES `Elev` (`ElevID`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Utlånsoversikt`
--

LOCK TABLES `Utlånsoversikt` WRITE;
/*!40000 ALTER TABLE `Utlånsoversikt` DISABLE KEYS */;
INSERT INTO `Utlånsoversikt` VALUES (34,2,1,'2025-01-16','2025-01-23'),(35,1,11,'2025-01-16','2025-01-23'),(36,2,13,'2025-01-17',NULL),(37,2,12,'2025-01-17',NULL),(38,2,5,'2025-02-13',NULL);
/*!40000 ALTER TABLE `Utlånsoversikt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'f21'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-13 10:07:58
