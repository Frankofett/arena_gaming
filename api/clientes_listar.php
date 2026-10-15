<?php

    header('Content-Type: application/json; charset=utf-8');
    require 'conexion.php';

try {
    $stmt = $conn->query("
    
        SELECT
            c.id_cliente,
            c.nombre,
            c.correo,
	        c.telefono
        FROM clientes c
   
ORDER BY c.nombre ASC
    ");

    $clientes = $stmt->fetchAll();
    
    echo json_encode([
        'ok' => true,
        'data' => $clientes
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}