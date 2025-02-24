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
  `user_id` INT NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(45) NOT NULL,
  `created_on` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE INDEX `idUsers_UNIQUE` (`user_id` ASC) VISIBLE,
  UNIQUE INDEX `uuid_UNIQUE` (`uuid` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `misa_db`.`Facts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `misa_db`.`Facts` (
  `facts_id` INT NOT NULL AUTO_INCREMENT,
  `father` INT NOT NULL DEFAULT 0,
  `mother` INT NOT NULL DEFAULT 0,
  `brothers` INT NOT NULL DEFAULT 0,
  `sisters` INT NOT NULL DEFAULT 0,
  `grandsons` INT NOT NULL DEFAULT 0,
  `granddaughters` INT NOT NULL DEFAULT 0,
  `paternal_grandfather` INT NOT NULL DEFAULT 0,
  `paternal_grandmother` INT NOT NULL DEFAULT 0,
  `maternal_grandfather` INT NOT NULL DEFAULT 0,
  `maternal_grandmother` INT NOT NULL DEFAULT 0,
  `husband` INT NOT NULL DEFAULT 0,
  `wife` INT NOT NULL DEFAULT 0,
  `networth` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `will_amount` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `Users_user_id` INT NOT NULL,
  PRIMARY KEY (`facts_id`),
  UNIQUE INDEX `idBeneficiaries_UNIQUE` (`facts_id` ASC) VISIBLE,
  INDEX `fk_Facts_Users1_idx` (`Users_user_id` ASC) VISIBLE,
  UNIQUE INDEX `Users_user_id_UNIQUE` (`Users_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_Facts_Users1`
    FOREIGN KEY (`Users_user_id`)
    REFERENCES `misa_db`.`Users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `misa_db`.`InheritanceSystem`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `misa_db`.`InheritanceSystem` (
  `idInheritanceSystem` INT NOT NULL AUTO_INCREMENT,
  `system_name` VARCHAR(45) NOT NULL,
  `system_script` LONGTEXT NOT NULL,
  PRIMARY KEY (`idInheritanceSystem`),
  UNIQUE INDEX `idInheritanceSystem_UNIQUE` (`idInheritanceSystem` ASC) VISIBLE,
  UNIQUE INDEX `system_name_UNIQUE` (`system_name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `misa_db`.`InheritanceResults`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `misa_db`.`InheritanceResults` (
  `idResult` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `json_result` TEXT NOT NULL,
  `detailed_result` TEXT NOT NULL,
  `InheritanceSystem_idInheritanceSystem` INT NOT NULL,
  `Facts_id` INT NOT NULL,
  `Users_user_id` INT NOT NULL,
  PRIMARY KEY (`idResult`),
  UNIQUE INDEX `idResult_UNIQUE` (`idResult` ASC) VISIBLE,
  INDEX `fk_InheritanceResults_InheritanceSystem_idx` (`InheritanceSystem_idInheritanceSystem` ASC) VISIBLE,
  INDEX `fk_InheritanceResults_Facts1_idx` (`Facts_id` ASC) VISIBLE,
  INDEX `fk_InheritanceResults_Users1_idx` (`Users_user_id` ASC) VISIBLE,
  CONSTRAINT `fk_InheritanceResults_InheritanceSystem`
    FOREIGN KEY (`InheritanceSystem_idInheritanceSystem`)
    REFERENCES `misa_db`.`InheritanceSystem` (`idInheritanceSystem`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_InheritanceResults_Facts1`
    FOREIGN KEY (`Facts_id`)
    REFERENCES `misa_db`.`Facts` (`facts_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_InheritanceResults_Users1`
    FOREIGN KEY (`Users_user_id`)
    REFERENCES `misa_db`.`Users` (`user_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
