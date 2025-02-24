-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema misa_db
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema misa_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `misa_db` DEFAULT CHARACTER SET utf8 ;
USE `misa_db` ;

-- -----------------------------------------------------
-- Table `misa_db`.`Users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `misa_db`.`Users` (
  `iduser` INT NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(45) NOT NULL,
  `created_at` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`iduser`),
  UNIQUE INDEX `iduser_UNIQUE` (`iduser` ASC) VISIBLE,
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `misa_db`.`InheritanceSystems`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `misa_db`.`InheritanceSystems` (
  `idInheritanceSystems` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `script` LONGTEXT NULL,
  PRIMARY KEY (`idInheritanceSystems`),
  UNIQUE INDEX `idInheritanceSystems_UNIQUE` (`idInheritanceSystems` ASC) VISIBLE,
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `misa_db`.`Cases`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `misa_db`.`Cases` (
  `idCases` INT NOT NULL AUTO_INCREMENT,
  `created_at` TIMESTAMP NOT NULL,
  `title` VARCHAR(45) NOT NULL,
  `Users_iduser` INT NOT NULL,
  `InheritanceSystems_idInheritanceSystems` INT NOT NULL,
  PRIMARY KEY (`idCases`),
  INDEX `fk_Cases_Users_idx` (`Users_iduser` ASC) VISIBLE,
  INDEX `fk_Cases_InheritanceSystems1_idx` (`InheritanceSystems_idInheritanceSystems` ASC) VISIBLE,
  CONSTRAINT `fk_Cases_Users`
    FOREIGN KEY (`Users_iduser`)
    REFERENCES `misa_db`.`Users` (`iduser`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Cases_InheritanceSystems1`
    FOREIGN KEY (`InheritanceSystems_idInheritanceSystems`)
    REFERENCES `misa_db`.`InheritanceSystems` (`idInheritanceSystems`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `misa_db`.`Beneficiaries`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `misa_db`.`Beneficiaries` (
  `idbeneficiaries` INT NOT NULL AUTO_INCREMENT,
  `father` INT NOT NULL DEFAULT 0,
  `mother` INT NOT NULL DEFAULT 0,
  `sisters` INT NOT NULL DEFAULT 0,
  `brothers` INT NOT NULL DEFAULT 0,
  `sons` INT NOT NULL DEFAULT 0,
  `daughters` INT NOT NULL DEFAULT 0,
  `paternal_grandfather` INT NOT NULL DEFAULT 0,
  `paternal_grandmother` INT NOT NULL DEFAULT 0,
  `maternal_grandfather` INT NOT NULL DEFAULT 0,
  `maternal_grandmother` INT NOT NULL DEFAULT 0,
  `grandsons` INT NOT NULL DEFAULT 0,
  `granddaughters` INT NOT NULL DEFAULT 0,
  `Cases_idCases` INT NOT NULL,
  `husband` INT NOT NULL,
  `wife` INT NOT NULL,
  PRIMARY KEY (`idbeneficiaries`),
  INDEX `fk_Beneficiaries_Cases1_idx` (`Cases_idCases` ASC) VISIBLE,
  CONSTRAINT `fk_Beneficiaries_Cases1`
    FOREIGN KEY (`Cases_idCases`)
    REFERENCES `misa_db`.`Cases` (`idCases`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `misa_db`.`Results`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `misa_db`.`Results` (
  `idResults` INT NOT NULL,
  `share_percentage` DECIMAL(5,2) NOT NULL,
  `amount` DECIMAL(15,2) NOT NULL,
  `breakdown` TEXT(255) NULL,
  `InheritanceSystems_idInheritanceSystems` INT NOT NULL,
  PRIMARY KEY (`idResults`),
  INDEX `fk_Results_InheritanceSystems1_idx` (`InheritanceSystems_idInheritanceSystems` ASC) VISIBLE,
  CONSTRAINT `fk_Results_InheritanceSystems1`
    FOREIGN KEY (`InheritanceSystems_idInheritanceSystems`)
    REFERENCES `misa_db`.`InheritanceSystems` (`idInheritanceSystems`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `misa_db`.`finances`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `misa_db`.`finances` (
  `idfinances` INT NOT NULL AUTO_INCREMENT,
  `networth` INT NOT NULL DEFAULT 0,
  `will_amount` INT NOT NULL DEFAULT 0,
  `Cases_idCases` INT NOT NULL,
  PRIMARY KEY (`idfinances`),
  UNIQUE INDEX `idfinances_UNIQUE` (`idfinances` ASC) VISIBLE,
  INDEX `fk_finances_Cases1_idx` (`Cases_idCases` ASC) VISIBLE,
  CONSTRAINT `fk_finances_Cases1`
    FOREIGN KEY (`Cases_idCases`)
    REFERENCES `misa_db`.`Cases` (`idCases`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
