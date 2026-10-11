<?php
header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Falta el id de venta']);
    exit;
}

try {
    // Cabecera de la venta
    $stmt = $conn->prepare("
        SELECT v.id_venta, v.fecha_venta, v.total,
               COALESCE(c.nombre, 'Sin cliente') AS cliente
        FROM ventas v
        LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
        WHERE v.id_venta = ?
    ");
    $stmt->execute([$id]);
    $venta = $stmt->fetch();

    if (!$venta) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'error' => 'Venta no encontrada']);
        exit;
    }

    // Detalle
    $stmt = $conn->prepare("
        SELECT p.nombre_producto, d.cantidad, d.precio_unitario, d.subtotal
        FROM detalle_ventas d
        JOIN productos p ON p.id_producto = d.id_producto
        WHERE d.id_venta = ?
    ");
    $stmt->execute([$id]);
    $items = $stmt->fetchAll();

    $venta['items'] = $items;

    echo json_encode(['ok' => true, 'data' => $venta], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}