<?php

header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

$id_cliente = $_POST['id_cliente'] ?? null;

if (!$id_cliente) {
    echo json_encode(['ok' => false, 'error' => 'Falta el id del cliente']);
    exit;
}

try {
    // Verificar que existe
    $stmt = $conn->prepare("SELECT id_cliente FROM clientes WHERE id_cliente = ?");
    $stmt->execute([$id_cliente]);

    if (!$stmt->fetch()) {
        echo json_encode(['ok' => false, 'error' => 'Cliente no encontrado']);
        exit;
    }

    // Eliminar
    $stmt = $conn->prepare("DELETE FROM clientes WHERE id_cliente = ?");
    $stmt->execute([$id_cliente]);

    echo json_encode(['ok' => true, 'mensaje' => 'Cliente eliminado']);

} catch (PDOException $e) {
    // Capturar el error de FK (si tiene ventas)
    if ($e->getCode() === '23503') {
        echo json_encode([
            'ok' => false,
            'error' => 'No se puede eliminar: el cliente tiene ventas u otros registros asociados.'
        ]);
        exit;
    }

    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}