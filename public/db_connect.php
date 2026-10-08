<?php
/**
 * Hostinger MySQL Database Connection Checker
 * Database: u328293805_7R01z
 * User: u328293805_mn6Ce
 */

header('Content-Type: application/json');

$host = 'localhost'; // In Hostinger, localhost is used when script runs on the same server
$db   = 'u328293805_7R01z';
$user = 'u328293805_mn6Ce';
$pass = getenv('MYSQL_PASSWORD') ?: ''; // Set your database password here

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Successfully connected to MySQL database: ' . $db,
        'user' => $user,
        'server' => $host,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage(),
        'database' => $db,
        'user' => $user,
        'hostinger_solution' => 'Make sure the MySQL password is correct and Remote MySQL is enabled in Hostinger hPanel if connecting externally.',
    ]);
}
