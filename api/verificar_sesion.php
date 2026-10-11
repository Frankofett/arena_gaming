<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['id_usuario'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No autenticado']);
    exit;
}

echo json_encode([
    'ok' => true,
    'usuario' => [
        'id' => $_SESSION['id_usuario'],
        'username' => $_SESSION['username'],
        'rol' => $_SESSION['nombre_rol']
    ]
]);