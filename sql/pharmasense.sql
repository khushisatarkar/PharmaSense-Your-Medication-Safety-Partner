-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 05, 2026 at 08:59 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pharmasense`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `height` int(11) DEFAULT NULL,
  `weight` int(11) DEFAULT NULL,
  `conditions` text DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `current_meds` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `password`, `age`, `gender`, `height`, `weight`, `conditions`, `allergies`, `created_at`, `current_meds`) VALUES
(1, 'Khushi Satarkar', 'khushisatarkar24@gmail.com', '$2y$10$p6aqLQAyoSpcUGPcLTGSGuQciXvh0wzZCJNvrK7H4c/vCgKrwCvqe', 21, 'Female', 173, 52, 'hyperacidity', 'NSAID', '2026-03-16 15:16:27', NULL),
(2, 'Rajnandini Mulay', 'mulayrajnandini@gmail.com', '$2y$10$NEmnyK4gwZz6XSbt/AW7VOqA/TxKcHme88WxMqEpEvVC2YUj1kEUm', 24, 'Female', 168, 60, 'migraine,pcos', '', '2026-03-16 15:19:46', 'Neurobion Forte'),
(3, 'Ekta Salgar', 'ektasalgar@gmail.com', '$2y$10$5kwlk0GyYnrNwui0tyCcguAjV9jXrgTu/9t1rmw8cAsdlYGkXBn2W', 22, 'Female', 160, 60, 'hypertension,pcos', 'tree nuts', '2026-03-16 16:41:20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_history`
--

CREATE TABLE `user_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('drug','safety','home') NOT NULL,
  `input_data` text NOT NULL,
  `result` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_history`
--

INSERT INTO `user_history` (`id`, `user_id`, `type`, `input_data`, `result`, `created_at`) VALUES
(3, 2, 'safety', '{\"medicine\":\"crocin\",\"age\":\"24\",\"dosageAmount\":\"500\",\"allergies\":[],\"currentMeds\":[\"neurobion forte\"]}', '✅ Safe', '2026-03-29 14:26:18'),
(4, 2, 'drug', '[\"crocin\",\"corex\"]', '✅ Safe', '2026-03-29 14:36:20'),
(5, 2, 'drug', '[\"augmentin\",\"corex\"]', '✅ Safe', '2026-03-29 14:36:57'),
(6, 1, 'drug', '[\"crocin\",\"corex\"]', '✅ Safe', '2026-03-30 04:48:11'),
(7, 1, 'safety', '{\"medicine\":\"crocin\",\"age\":\"21\",\"dosageAmount\":\"500\",\"allergies\":[\"nsaid\"],\"currentMeds\":[]}', '⚠ Not Safe', '2026-03-30 04:49:12'),
(8, 1, 'drug', '[\"crocin\",\"augmentin\"]', '✅ Safe', '2026-04-02 06:05:02'),
(9, 1, 'safety', '{\"medicine\":\"crocin\",\"age\":\"21\",\"dosageAmount\":\"500\",\"allergies\":[\"nsaid\"],\"currentMeds\":[]}', '⚠ Not Safe', '2026-04-02 07:47:33'),
(10, 1, 'safety', '{\"medicine\":\"augmentin\",\"age\":\"21\",\"dosageAmount\":\"500\",\"allergies\":[\"nsaid\"],\"currentMeds\":[]}', '⚠ Not Safe', '2026-04-02 07:47:51');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_history`
--
ALTER TABLE `user_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user_history`
--
ALTER TABLE `user_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `user_history`
--
ALTER TABLE `user_history`
  ADD CONSTRAINT `user_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
