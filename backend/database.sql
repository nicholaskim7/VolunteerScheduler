CREATE DATABASE volunteer_management;

USE volunteer_management;

CREATE TABLE `usercredentials` (
  `user_id` integer AUTO_INCREMENT PRIMARY KEY,
  `email` varchar(255) UNIQUE NOT NULL,
  `password` varchar(255),
  `role` ENUM('volunteer', 'admin') DEFAULT 'volunteer'
);

CREATE TABLE `userprofile` (
  `user_id` integer AUTO_INCREMENT PRIMARY KEY,
  `username` varchar(255) NOT NULL,
  `full_name` varchar(50) NOT NULL,
  `address1` varchar(100) NOT NULL,
  `address2` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(2) NOT NULL,
  `zipcode` varchar(9) NOT NULL,
  `skills` text NOT NULL DEFAULT 'Critical', 
  `preferences` text NOT NULL,
  `availability` text NOT NULL,
  `profile_picture` varchar(255) NOT NULL
);

CREATE TABLE `eventdetails` (
  `event_id` integer AUTO_INCREMENT PRIMARY KEY,
  `event_name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `required_skills` text NOT NULL,
  `urgency` varchar(10) NOT NULL,
  `event_date` datetime NOT NULL
);

CREATE TABLE `volunteerhistory` (
  `volunteer_event_id` int AUTO_INCREMENT PRIMARY KEY,
  `user_id` int,
  `event_id` int,
  `participation` varchar(255),
  FOREIGN KEY (user_id) REFERENCES usercredentials(user_id),
  FOREIGN KEY (event_id) REFERENCES eventdetails(event_id)
);

CREATE TABLE `notifications` (
    `notification_id` int AUTO_INCREMENT PRIMARY KEY,
    `user_id` int,
    `message` TEXT,
    `created_at` timestamp DEFAULT current_timestamp,
    FOREIGN KEY (user_id) REFERENCES usercredentials(user_id)
);

CREATE TABLE `states` (
  `state` char,
  `state_code` int
);
