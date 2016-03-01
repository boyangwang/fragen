-- phpMyAdmin SQL Dump
-- version 4.0.4.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 03, 2014 at 09:30 AM
-- Server version: 5.5.34-0ubuntu0.12.04.1
-- PHP Version: 5.4.25-1+sury.org~precise+2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `laughing_avenger`
--
CREATE DATABASE IF NOT EXISTS `laughing_avenger` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `laughing_avenger`;

-- --------------------------------------------------------

--
-- Table structure for table `comment`
--

CREATE TABLE IF NOT EXISTS `comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `post_id` int(10) unsigned NOT NULL,
  `content` text NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `anonymous` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '1 for anonymous, 0 for public',
  PRIMARY KEY (`id`),
  KEY `comment_post_id_id_idx` (`post_id`),
  KEY `comment_user_user_id_idx` (`user_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- Dumping data for table `comment`
--

INSERT INTO `comment` (`id`, `user_id`, `post_id`, `content`, `timestamp`, `anonymous`) VALUES
(1, 100001375167765, 1, 'I also dunno', '2014-01-26 03:22:28', 0);

-- --------------------------------------------------------

--
-- Table structure for table `enrollment`
--

CREATE TABLE IF NOT EXISTS `enrollment` (
  `user_id` bigint(20) unsigned NOT NULL,
  `module_id` int(10) unsigned NOT NULL,
  `is_manager` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 for normal enrollment, 1 for manager',
  PRIMARY KEY (`user_id`,`module_id`),
  KEY `enrollment_user_user_id_idx` (`user_id`),
  KEY `enrollment_module_mod_id_idx` (`module_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `module`
--

CREATE TABLE IF NOT EXISTS `module` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `module`
--

INSERT INTO `module` (`id`, `title`, `description`) VALUES
(1, 'CS3216', 'Software Development on Evolving Platforms'),
(2, 'CS2103', 'Software Engineering'),
(3, 'EE2020', 'Digital Fundamentals'),
(4, 'EE2021', 'Devices And Circuits'),
(5, 'CG2271', 'Real-Time Operating System');

-- --------------------------------------------------------

--
-- Table structure for table `post`
--

CREATE TABLE IF NOT EXISTS `post` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT COMMENT 'the primary key\n',
  `title` varchar(255) NOT NULL,
  `content` text,
  `owner_id` bigint(20) unsigned NOT NULL COMMENT 'ID of the user that posted this',
  `type` int(11) NOT NULL COMMENT '0 for question, 1 for answer',
  `parent_id` int(10) unsigned DEFAULT NULL COMMENT 'NULL for question, id of parent question for answers',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'time created',
  `module_id` int(10) unsigned DEFAULT NULL,
  `votecount` int(11) NOT NULL DEFAULT '0' COMMENT 'upvote minus downvote',
  `close_time` timestamp NULL DEFAULT NULL COMMENT 'NULL for open questions\n',
  `accepted_answer` int(10) unsigned DEFAULT NULL COMMENT 'id for the answer accepted',
  `anonymous` tinyint(4) NOT NULL DEFAULT '0' COMMENT '1 for anonymous, 0 for public',
  PRIMARY KEY (`id`),
  KEY `question_answer_postid_idx` (`parent_id`),
  KEY `post_accepted_answer_id_idx` (`accepted_answer`),
  KEY `post_user_user_id_idx` (`owner_id`),
  KEY `post_module_id_idx` (`module_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=5 ;

--
-- Dumping data for table `post`
--

INSERT INTO `post` (`id`, `title`, `content`, `owner_id`, `type`, `parent_id`, `timestamp`, `module_id`, `votecount`, `close_time`, `accepted_answer`, `anonymous`) VALUES
(1, 'What is the best module is the world? :D', 'I can''t figure it out.', 100001375167765, 0, NULL, '2013-12-01 00:31:55', 1, 0, NULL, NULL, 0),
(2, '', 'No matter what it is, it''s not CS3216. Meow~', 100001375167765, 1, 1, '2013-12-01 00:32:25', NULL, 0, NULL, NULL, 1),
(3, '', 'It''s CS3217. Go and take it!', 100001375167765, 1, 1, '2014-01-26 03:22:54', NULL, 0, NULL, NULL, 0),
(4, 'New question', 'New question', 620676394, 0, NULL, '2014-02-19 05:06:36', 1, 1, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `user_id` bigint(20) unsigned NOT NULL COMMENT 'fbid of the user',
  `fb_username` varchar(100) DEFAULT NULL,
  `fbpic_url` varchar(255) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `fb_username`, `fbpic_url`, `name`) VALUES
(620676394, 'li.guangda', 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash3/t5/41553_620676394_6161_n.jpg', 'Li GuangDa'),
(100000710245275, 'muhammad.muneer.71', 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash1/t5/371719_100000710245275_2022401136_n.jpg', 'Muhammad Muneer'),
(100001375167765, 'boyang.wang.372', 'https://fbcdn-profile-a.akamaihd.net/hprofile-ak-ash1/t5/211597_100001375167765_701200099_n.jpg', 'Boyang Wang');

-- --------------------------------------------------------

--
-- Table structure for table `vote`
--

CREATE TABLE IF NOT EXISTS `vote` (
  `user_id` bigint(20) unsigned NOT NULL,
  `post_id` int(10) unsigned NOT NULL,
  `type` tinyint(4) DEFAULT NULL COMMENT '1 for upvote, -1 for downvote',
  PRIMARY KEY (`user_id`,`post_id`),
  KEY `vote_post_id_id_idx` (`post_id`),
  KEY `vote_user_user_id_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `vote`
--

INSERT INTO `vote` (`user_id`, `post_id`, `type`) VALUES
(620676394, 4, 1);

--
-- Triggers `vote`
--
DROP TRIGGER IF EXISTS `vote_AINS`;
DELIMITER //
CREATE TRIGGER `vote_AINS` AFTER INSERT ON `vote`
 FOR EACH ROW -- Edit trigger body code below this line. Do not edit lines above this one
	UPDATE post p SET p.votecount=p.votecount + NEW.type
	WHERE p.id = NEW.post_id
//
DELIMITER ;
DROP TRIGGER IF EXISTS `vote_AUPD`;
DELIMITER //
CREATE TRIGGER `vote_AUPD` AFTER UPDATE ON `vote`
 FOR EACH ROW -- Edit trigger body code below this line. Do not edit lines above this one
	UPDATE post p SET p.votecount=p.votecount + NEW.type - OLD.type
	WHERE p.id = NEW.post_id
//
DELIMITER ;
DROP TRIGGER IF EXISTS `vote_BDEL`;
DELIMITER //
CREATE TRIGGER `vote_BDEL` BEFORE DELETE ON `vote`
 FOR EACH ROW -- Edit trigger body code below this line. Do not edit lines above this one
	UPDATE post p SET p.votecount=p.votecount - OLD.type
	WHERE p.id = OLD.post_id
//
DELIMITER ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comment`
--
ALTER TABLE `comment`
  ADD CONSTRAINT `comment_post_id_id` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `comment_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `enrollment`
--
ALTER TABLE `enrollment`
  ADD CONSTRAINT `enrollment_module_mod_id` FOREIGN KEY (`module_id`) REFERENCES `module` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `enrollment_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `post_accepted_answer_id` FOREIGN KEY (`accepted_answer`) REFERENCES `post` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `post_module_id` FOREIGN KEY (`module_id`) REFERENCES `module` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `post_parentid_id` FOREIGN KEY (`parent_id`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `post_user_user_id` FOREIGN KEY (`owner_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Constraints for table `vote`
--
ALTER TABLE `vote`
  ADD CONSTRAINT `vote_post_id_id` FOREIGN KEY (`post_id`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `vote_user_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE ON UPDATE NO ACTION;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
