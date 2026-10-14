<?php

header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

// Recoger datos
$id_producto     = $_POST['id_producto'] ?? null;
$nombre_producto = trim($_POST['nombre_producto'] ?? '');
$id_categoria    = $_POST['id_categoria'] ?? null;
$precio          = $_POST['precio'] ?? null;

// Validaciones
if ($nombre_producto === '' || $id_categoria === null || $precio === null) {
    echo json_encode(['ok' => false, 'error' => 'Faltan datos obligatorios']);
    exit;
}

if (!is_numeric($precio) || $precio < 0) {
    echo json_encode(['ok' => false, 'error' => 'El precio debe ser un número positivo']);
    exit;
}

try {
    if ($id_producto) {
        // EDITAR
        $stmt = $conn->prepare("
            UPDATE productos
            SET nombre_producto = ?, id_categoria = ?, precio = ?
            WHERE id_producto = ?
        ");
        $stmt->execute([$nombre_producto, $id_categoria, $precio, $id_producto]);

        echo json_encode(['ok' => true, 'accion' => 'actualizado']);

    } else {
        // CREAR
        $stmt = $conn->prepare("
            INSERT INTO productos (nombre_producto, id_categoria, precio, estado)
            VALUES (?, ?, ?, 'activo')
            RETURNING id_producto
        ");
        $stmt->execute([$nombre_producto, $id_categoria, $precio]);
        $nuevo_id = $stmt->fetchColumn();

        // Crear también el registro de stock en 0
        $stmt = $conn->prepare("
            INSERT INTO inventario_stock (id_producto, cantidad_actual)
            VALUES (?, 0)
        ");
        $stmt->execute([$nuevo_id]);

        echo json_encode(['ok' => true, 'accion' => 'creado', 'id' => $nuevo_id]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}