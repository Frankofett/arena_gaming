<?php

    header('Content-Type: application/json; charset=utf-8');
    require 'conexion.php';

try {
    $stmt = $conn->query("
    
        SELECT
            p.id_producto,
            p.nombre_producto,
            p.precio,
            p.estado,
            COALESCE(c.nombre_categoria, 'Sin categoria') AS nombre_categoria,
            COALESCE(i.cantidad_actual, 0 ) AS stock
        FROM productos p
        LEFT JOIN categorias_productos c ON c.id_categoria = p.id_categoria
        LEFT JOIN inventario_stock i ON i.id_producto = p.id_producto
        WHERE p.estado = 'activo'
        ORDER BY p.nombre_producto ASC
    ");

    $productos = $stmt->fetchAll();
    
    echo json_encode([
        'ok' => true,
        'data' => $productos
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

