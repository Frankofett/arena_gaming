<?php
/**
 * dashboard.php
 * Devuelve todos los datos del dashboard en un solo JSON
 */

header('Content-Type: application/json; charset=utf-8');

require 'conexion.php';

try {
    $data = [];

    // 1. Ventas del día
    $stmt = $conn->query("
        SELECT COALESCE(SUM(total), 0) AS total
        FROM ventas
        WHERE DATE(fecha_venta) = CURRENT_DATE
    ");
    $data['ventas_hoy'] = (float) $stmt->fetch()['total'];

    // 2. Sesiones activas
    $stmt = $conn->query("
        SELECT COUNT(*) AS total
        FROM sesiones_juego
        WHERE estado = 'En curso'
    ");
    $data['sesiones_activas'] = (int) $stmt->fetch()['total'];

    // 3. Stock total
    $stmt = $conn->query("
        SELECT COALESCE(SUM(cantidad_actual), 0) AS total
        FROM inventario_stock
    ");
    $data['stock_total'] = (int) $stmt->fetch()['total'];

    // 4. Stock bajo (<= 5 unidades)
    $stmt = $conn->query("
        SELECT p.nombre_producto, i.cantidad_actual
        FROM inventario_stock i
        JOIN productos p ON p.id_producto = i.id_producto
        WHERE i.cantidad_actual <= 5
        ORDER BY i.cantidad_actual ASC
        LIMIT 10
    ");
    $data['stock_bajo'] = $stmt->fetchAll();

    // 5. Últimas 5 ventas
    $stmt = $conn->query("
        SELECT v.id_venta, v.fecha_venta, v.total,
               COALESCE(c.nombre, 'Sin cliente') AS cliente
        FROM ventas v
        LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
        ORDER BY v.fecha_venta DESC
        LIMIT 5
    ");
    $data['ultimas_ventas'] = $stmt->fetchAll();

    // 6. Últimas 5 sesiones
    $stmt = $conn->query("
        SELECT s.id_sesion, s.fecha_hora_inicio, s.fecha_hora_fin,
               s.costo_total, s.estado,
               COALESCE(c.nombre, 'Sin cliente') AS cliente
        FROM sesiones_juego s
        LEFT JOIN clientes c ON c.id_cliente = s.id_cliente
        ORDER BY s.fecha_hora_inicio DESC
        LIMIT 5
    ");
    $data['ultimas_sesiones'] = $stmt->fetchAll();

    // Respuesta final
    echo json_encode([
        'ok' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}