const API = '../api';


document.addEventListener('DOMContentLoaded', listar);

async function listar() {
  const tbody = document.getElementById('tabla-productos');
  tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">Cargando...</td></tr>';

  try {
    const res = await fetch(`${API}/productos_listar.php`);
    const json = await res.json();

    if (!json.ok) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error: ${json.error}</td></tr>`;
      return;
    }

    pintarTabla(json.data);

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error de conexión: ${err.message}</td></tr>`;
  }
}

function pintarTabla(productos) {
  const tbody = document.getElementById('tabla-productos');
  tbody.innerHTML = '';

  if (productos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay productos registrados</td></tr>';
    return;
  }

  productos.forEach(p => {
    const estadoBadge = p.estado === 'activo'
      ? '<span class="badge bg-success">activo</span>'
      : '<span class="badge bg-secondary">inactivo</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id_producto}</td>
      <td>${p.nombre_producto}</td>
      <td>${p.nombre_categoria}</td>
      <td>Bs. ${parseFloat(p.precio).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>${estadoBadge}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-warning" data-id="${p.id_producto}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger" data-id="${p.id_producto}">
          <i class="bi bi-x-lg"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}