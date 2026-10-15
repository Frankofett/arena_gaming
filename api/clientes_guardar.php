<?php

header('Content-Type: application/json; charset=utf-8');
require 'conexion.php';

// Recoger datos
$id_cliente = $_POST['id_cliente'] ?? null;
$nombre     = trim($_POST['nombre'] ?? '');
$correo     = trim($_POST['correo'] ?? '');
$telefono   = trim($_POST['telefono'] ?? '');

// Validaciones
if ($nombre === '') {
    echo json_encode(['ok' => false, 'error' => 'El nombre es obligatorio']);
    exit;
}

// Si viene correo vacío, guardar NULL
$correo   = $correo   === '' ? null : $correo;
$telefono = $telefono === '' ? null : $telefono;

try {
    if ($id_cliente) {
        // EDITAR
        $stmt = $conn->prepare("
            UPDATE clientes
            SET nombre = ?, correo = ?, telefono = ?
            WHERE id_cliente = ?
        ");
        $stmt->execute([$nombre, $correo, $telefono, $id_cliente]);

        echo json_encode(['ok' => true, 'accion' => 'actualizado']);

    } else {
        // CREAR
        $stmt = $conn->prepare("
            INSERT INTO clientes (nombre, correo, telefono)
            VALUES (?, ?, ?)
            RETURNING id_cliente
        ");
        $stmt->execute([$nombre, $correo, $telefono]);
        $nuevo_id = $stmt->fetchColumn();

        echo json_encode(['ok' => true, 'accion' => 'creado', 'id' => $nuevo_id]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}