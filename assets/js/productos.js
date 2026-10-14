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
  // ============ CATEGORÍAS ============

async function cargarCategorias() {
  const select = document.getElementById('input-categoria');
  select.innerHTML = '<option value="">Cargando...</option>';

  try {
    const res = await fetch(`${API}/categorias_listar.php`);
    const json = await res.json();

    if (!json.ok) {
      select.innerHTML = '<option value="">Error al cargar</option>';
      return;
    }

    select.innerHTML = '<option value="">-- Selecciona --</option>';
    json.data.forEach(c => {
      select.innerHTML += `<option value="${c.id_categoria}">${c.nombre_categoria}</option>`;
    });

  } catch (err) {
    select.innerHTML = '<option value="">Error de conexión</option>';
  }
}

// ============ MODAL DE PRODUCTO ============

function abrirModalNuevo() {
  // Limpiar formulario
  document.getElementById('formProducto').reset();
  document.getElementById('input-id').value = '';

  // Título
  document.getElementById('modal-titulo').textContent = 'Nuevo producto';

  // Llenar categorías
  cargarCategorias();

  // Abrir modal
  const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
  modal.show();
}

// ============ GUARDAR PRODUCTO ============

document.getElementById('formProducto').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const res = await fetch(`${API}/productos_guardar.php`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();

    if (!json.ok) {
      alert('Error: ' + json.error);
      return;
    }

    // Cerrar modal
    const modalEl = document.getElementById('modalProducto');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    // Recargar tabla
    listar();

  } catch (err) {
    alert('Error de conexión: ' + err.message);
  }
});

// ============ CONECTAR BOTÓN NUEVO ============

document.getElementById('btn-nuevo').addEventListener('click', abrirModalNuevo);
}