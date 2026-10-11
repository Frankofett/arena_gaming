const API = '../api';

// Cargar datos al abrir la página
document.addEventListener('DOMContentLoaded', cargarDashboard);

async function cargarDashboard() {
  try {
    const res = await fetch(`${API}/dashboard.php`);
    const json = await res.json();

    if (!json.ok) {
      console.error('Error:', json.error);
      return;
    }

    const d = json.data;

    // Tarjetas
    document.getElementById('ventas-hoy').textContent = `Bs. ${d.ventas_hoy.toFixed(2)}`;
    document.getElementById('sesiones-activas').textContent = d.sesiones_activas;
    document.getElementById('stock-total').textContent = d.stock_total;
    document.getElementById('stock-bajo-count').textContent = d.stock_bajo.length;

    // Tabla ventas
    pintarVentas(d.ultimas_ventas);

    // Tabla sesiones
    pintarSesiones(d.ultimas_sesiones);

    // Tabla stock bajo
    pintarStockBajo(d.stock_bajo);

  } catch (err) {
    console.error('Error cargando dashboard:', err);
  }
}

function pintarVentas(ventas) {
  const tbody = document.getElementById('tabla-ventas');
  tbody.innerHTML = '';

  if (ventas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay ventas</td></tr>';
    return;
  }

  ventas.forEach(v => {
    const tr = document.createElement('tr');
    tr.className = 'fila-venta';
    tr.innerHTML = `
      <td>#${v.id_venta}</td>
      <td>${v.cliente}</td>
      <td>Bs. ${parseFloat(v.total).toFixed(2)}</td>
      <td>${formatearFecha(v.fecha_venta)}</td>
    `;
    tr.addEventListener('click', () => abrirFactura(v.id_venta));
    tbody.appendChild(tr);
  });
}

function pintarSesiones(sesiones) {
  const tbody = document.getElementById('tabla-sesiones');
  tbody.innerHTML = '';

  if (sesiones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay sesiones</td></tr>';
    return;
  }

  sesiones.forEach(s => {
    const color = s.estado === 'En curso' ? 'success' : 'secondary';
    tbody.innerHTML += `
      <tr>
        <td>#${s.id_sesion}</td>
        <td>${s.cliente}</td>
        <td><span class="badge bg-${color}">${s.estado}</span></td>
        <td>${formatearFecha(s.fecha_hora_inicio)}</td>
      </tr>
    `;
  });
}

function pintarStockBajo(productos) {
  const tbody = document.getElementById('tabla-stock-bajo');
  tbody.innerHTML = '';

  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Todo el stock está bien</td></tr>';
    return;
  }

  productos.forEach(p => {
    tbody.innerHTML += `
      <tr>
        <td>${p.nombre_producto}</td>
        <td><span class="badge bg-danger">${p.cantidad_actual}</span></td>
      </tr>
    `;
  });
}

function formatearFecha(fecha) {
  if (!fecha) return '--';
  const d = new Date(fecha);
  return d.toLocaleString('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ============ MODAL DE FACTURA ============

async function abrirFactura(idVenta) {
  const modalBody = document.getElementById('modal-factura-body');
  modalBody.innerHTML = 'Cargando...';

  const modal = new bootstrap.Modal(document.getElementById('modalFactura'));
  modal.show();

  try {
    const res = await fetch(`${API}/venta_detalle.php?id=${idVenta}`);
    const json = await res.json();

    if (!json.ok) {
      modalBody.innerHTML = `<p class="text-danger">Error: ${json.error}</p>`;
      return;
    }

    const v = json.data;

    let filas = '';
    v.items.forEach(item => {
      filas += `
        <tr>
          <td>${item.nombre_producto}</td>
          <td>${item.cantidad}</td>
          <td>Bs. ${parseFloat(item.precio_unitario).toFixed(2)}</td>
          <td>Bs. ${parseFloat(item.subtotal).toFixed(2)}</td>
        </tr>
      `;
    });

    modalBody.innerHTML = `
      <p><strong>Venta #${v.id_venta}</strong></p>
      <p>Cliente: ${v.cliente}<br>
         Fecha: ${formatearFecha(v.fecha_venta)}</p>
      <table class="table table-sm">
        <thead>
          <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
      <h5 class="text-end">Total: Bs. ${parseFloat(v.total).toFixed(2)}</h5>
    `;

  } catch (err) {
    modalBody.innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
  }
}