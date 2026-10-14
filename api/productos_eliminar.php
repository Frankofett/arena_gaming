
<?php

header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

// Recoger el id
$id_producto = $_POST['id_producto'] ?? null;

// Validar
if (!$id_producto) {
    echo json_encode(['ok' => false, 'error' => 'Falta el id del producto']);
    exit;
}

try {
    // Verificar que el producto existe
    $stmt = $conn->prepare("SELECT id_producto FROM productos WHERE id_producto = ?");
    $stmt->execute([$id_producto]);

    if (!$stmt->fetch()) {
        echo json_encode(['ok' => false, 'error' => 'Producto no encontrado']);
        exit;
    }

    // Desactivar (no borrar)
    $stmt = $conn->prepare("UPDATE productos SET estado = 'inactivo' WHERE id_producto = ?");
    $stmt->execute([$id_producto]);

    echo json_encode(['ok' => true, 'mensaje' => 'Producto desactivado']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}