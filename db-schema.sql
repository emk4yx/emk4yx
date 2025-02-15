CREATE TABLE `channels` (
  `id` INT(11) AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(25) UNIQUE,
  `login` VARCHAR(50),
  `prefix` VARCHAR(25),
  `added` TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  `mode` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `conduits` (
  `id` VARCHAR(255) NOT NULL PRIMARY KEY
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `commandStats` (
  `command` VARCHAR(255) NOT NULL PRIMARY KEY,
  `count` INT(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `permissions` (
  `userId` VARCHAR(25) NOT NULL PRIMARY KEY,
  `permission` INT(2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `subscriptions` (
  `id` VARCHAR(50) NOT NULL PRIMARY KEY,
  `type` VARCHAR(50),
  `version` INT(2),
  `channelId` VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tokens` (
  `name` VARCHAR(255) NOT NULL PRIMARY KEY,
  `accessToken` VARCHAR(255) NOT NULL,
  `refreshToken` VARCHAR(255) DEFAULT NULL,
  `expiresAt` VARCHAR(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `users` (
  `userId` VARCHAR(11) NOT NULL PRIMARY KEY,
  `username` VARCHAR(25),
  INDEX `idx_username` (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
