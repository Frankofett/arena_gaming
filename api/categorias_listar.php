<?php

    header('Content-Type: application/json; charset=utf-8');
    require 'conexion.php';

try {
    $stmt = $conn->query("
    
        SELECT
            c.id_categoria,
            c.nombre_categoria
        FROM categorias_productos c

        ORDER BY c.nombre_categoria ASC
    ");

    $categorias = $stmt->fetchAll();
    
    echo json_encode([
        'ok' => true,
        'data' => $categorias
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

