const API = '../api';
let clientesCache = [];

document.addEventListener('DOMContentLoaded', listar);

async function listar() {
  const tbody = document.getElementById('tabla-clientes');
  tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Cargando...</td></tr>';

  try {
    const res = await fetch(`${API}/clientes_listar.php`);
    const json = await res.json();

    if (!json.ok) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${json.error}</td></tr>`;
      return;
    }

    pintarTabla(json.data);

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error de conexión: ${err.message}</td></tr>`;
  }
}

function pintarTabla(clientes) {
  clientesCache = clientes;

  const tbody = document.getElementById('tabla-clientes');
  tbody.innerHTML = '';

  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No hay clientes registrados</td></tr>';
    return;
  }

  clientes.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${c.id_cliente}</td>
      <td>${c.nombre}</td>
      <td>${c.correo || '--'}</td>
      <td>${c.telefono || '--'}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-warning btn-editar" data-id="${c.id_cliente}">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${c.id_cliente}">
          <i class="bi bi-x-lg"></i>
        </button>
      </td>
    `;

    tr.querySelector('.btn-editar').addEventListener('click', () => abrirModalEditar(parseInt(c.id_cliente)));
    tr.querySelector('.btn-eliminar').addEventListener('click', () => confirmarEliminar(parseInt(c.id_cliente)));

    tbody.appendChild(tr);
  });
}


function abrirModalNuevo() {
  document.getElementById('formClientes').reset();
  document.getElementById('input-id').value = '';
  document.getElementById('modal-titulo').textContent = 'Nuevo Cliente';

  

  const modal = new bootstrap.Modal(document.getElementById('modalClientes'));
  modal.show();
}

function abrirModalEditar(id) {
  const cliente = clientesCache.find(c => parseInt(c.id_cliente) === id);
  if (!cliente) return;

  document.getElementById('input-id').value = cliente.id_cliente;
  document.getElementById('input-nombre').value = cliente.nombre;
  document.getElementById('input-correo').value = cliente.correo;
  document.getElementById('input-telefono').value = cliente.telefono || '';
  document.getElementById('modal-titulo').textContent = 'Editar cliente';


  const modal = new bootstrap.Modal(document.getElementById('modalClientes'));
  modal.show();
}

// ============ GUARDAR PRODUCTO ============

document.getElementById('formClientes').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const res = await fetch(`${API}/clientes_guardar.php`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();

    if (!json.ok) {
      alert('Error: ' + json.error);
      return;
    }

    const modalEl = document.getElementById('modalClientes');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    listar();

  } catch (err) {
    alert('Error de conexión: ' + err.message);
  }
});

// ============ ELIMINAR (placeholder) ============

async function confirmarEliminar(id) {
  // Buscar el producto para mostrar su nombre en el confirm
  const cliente = clientesCache.find(c => parseInt(c.id_cliente) === id);
  const nombre = cliente ? cliente.nombre : 'este cliente';

  // Pedir confirmación
  if (!confirm(`¿Desactivar "${nombre}"?\n\nNo se borra de la base de datos, solo se oculta de la lista.`)) {
    return;
  }

  try {
    const formData = new FormData();
    formData.append('id_cliente', id);

    const res = await fetch(`${API}/clientes_eliminar.php`, {
      method: 'POST',
      body: formData
    });
    const json = await res.json();

    if (!json.ok) {
      alert('Error: ' + json.error);
      return;
    }

    // Recargar tabla
    listar();

  } catch (err) {
    alert('Error de conexión: ' + err.message);
  }
}

// ============ CONECTAR BOTÓN NUEVO ============

document.getElementById('btn-nuevo').addEventListener('click', abrirModalNuevo);