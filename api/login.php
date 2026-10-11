<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (!$username || !$password) {
    echo json_encode(['ok' => false, 'error' => 'Faltan datos']);
    exit;
}

try {
    $stmt = $conn->prepare("
        SELECT u.id_usuario, u.username, u.password_hash,
               u.id_rol, r.nombre_rol
        FROM usuarios u
        JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.username = ?
    ");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user) {
        echo json_encode(['ok' => false, 'error' => 'Usuario no encontrado']);
        exit;
    }

    if (!password_verify($password, $user['password_hash'])) {
        echo json_encode(['ok' => false, 'error' => 'Contraseña incorrecta']);
        exit;
    }

    // Login exitoso
    $_SESSION['id_usuario'] = $user['id_usuario'];
    $_SESSION['username']   = $user['username'];
    $_SESSION['id_rol']     = $user['id_rol'];
    $_SESSION['nombre_rol'] = $user['nombre_rol'];

    echo json_encode([
        'ok' => true,
        'usuario' => [
            'id' => $user['id_usuario'],
            'username' => $user['username'],
            'rol' => $user['nombre_rol']
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}