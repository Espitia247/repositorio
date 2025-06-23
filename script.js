// Variables globales
let proveedores = [];
let pedidos = [];

function guardarEnLocalStorage() {
    localStorage.setItem('proveedores', JSON.stringify(proveedores));
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
}

function cargarDesdeLocalStorage() {
    proveedores = JSON.parse(localStorage.getItem('proveedores')) || [];
    pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    console.log("Datos cargados desde Local Storage:", { proveedores, pedidos }); // Para depuración
}

// --- Proveedores ---

function agregarProductoInput() {
    const contenedor = document.getElementById('productos-container');
    if (!contenedor) return;

    const div = document.createElement('div');
    div.className = 'form-group producto-item';
    div.innerHTML = `
        <input type="text" class="producto-nombre" placeholder="Nombre del producto" required />
        <input type="number" class="producto-precio" placeholder="Precio unitario" min="0" step="0.01" required />
        <button type="button" class="btn-eliminar-producto" title="Eliminar producto">X</button>
    `;
    contenedor.appendChild(div);

    div.querySelector('.btn-eliminar-producto').addEventListener('click', () => {
        div.remove();
    });
}

function renderListaProveedores() {
    const lista = document.getElementById('listaProveedores');
    if (!lista) {
        console.error("No se encontró el elemento con ID 'listaProveedores'");
        return;
    }
    lista.innerHTML = '';
    console.log("Renderizando lista de proveedores:", proveedores); // Para depuración

    proveedores.forEach((prov, index) => {
        const productosTexto = Array.isArray(prov.productos)
            ? prov.productos.map(p => `${p.nombre} ($${p.precio.toFixed(2)})`).join(', ')
            : 'Sin productos'; // Manejamos el caso undefined o no array

        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${prov.nombreEmpresa}</strong> (ID: ${prov.idProveedor})<br/>
                Correo: ${prov.correo} | Tel: ${prov.telefono} | Dirección: ${prov.direccion}<br/>
                Productos: ${productosTexto}
            </div>
            <div class="proveedor-actions">
                <button class="editar" onclick="editarProveedor(${index})">Editar</button>
                <button class="eliminar" onclick="eliminarProveedor(${index})">Eliminar</button>
            </div>
        `;
        lista.appendChild(li);
    });
}

// Cargar proveedor en formulario para editar
function cargarProveedorEnFormulario(index) {
    const prov = proveedores[index];
    document.getElementById('idProveedor').value = prov.idProveedor;
    document.getElementById('nombreEmpresa').value = prov.nombreEmpresa;
    document.getElementById('correo').value = prov.correo;
    document.getElementById('telefono').value = prov.telefono;
    document.getElementById('direccion').value = prov.direccion;

    const contenedor = document.getElementById('productos-container');
    contenedor.innerHTML = '';
    prov.productos.forEach(producto => {
        const div = document.createElement('div');
        div.className = 'form-group producto-item';
        div.innerHTML = `
            <input type="text" class="producto-nombre" value="${producto.nombre}" placeholder="Nombre del producto" required />
            <input type="number" class="producto-precio" value="${producto.precio}" placeholder="Precio unitario" min="0" step="0.01" required />
            <button type="button" class="btn-eliminar-producto" title="Eliminar producto">X</button>
        `;
        contenedor.appendChild(div);
        div.querySelector('.btn-eliminar-producto').addEventListener('click', () => div.remove());
    });

    document.getElementById('btnAgregarProducto').style.display = 'inline-block';
    document.getElementById('btn-guardar-proveedor').textContent = 'Actualizar Proveedor';
    document.getElementById('btn-guardar-proveedor').dataset.editIndex = index;
}

// Guardar o actualizar proveedor
function guardarProveedor(event) {
    event.preventDefault();
    const idProveedor = document.getElementById('idProveedor').value.trim();
    const nombreEmpresa = document.getElementById('nombreEmpresa').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();

    const productos = [];
    const productosDivs = document.querySelectorAll('.producto-item');
    for (const div of productosDivs) {
        const nombre = div.querySelector('.producto-nombre').value.trim();
        const precio = parseFloat(div.querySelector('.producto-precio').value);
        if (nombre && !isNaN(precio)) {
            productos.push({ nombre, precio });
        }
    }
    if (productos.length === 0) {
        alert('Debe agregar al menos un producto válido.');
        return;
    }

    if (!idProveedor || !nombreEmpresa || !correo || !telefono || !direccion) {
        alert('Por favor complete todos los campos del proveedor.');
        return;
    }

    const nuevoProveedor = { idProveedor, nombreEmpresa, correo, telefono, direccion, productos };

    const editarIndex = document.getElementById('btn-guardar-proveedor').dataset.editIndex;
    if (editarIndex !== undefined) {
        proveedores[editarIndex] = nuevoProveedor;
        delete document.getElementById('btn-guardar-proveedor').dataset.editIndex;
        document.getElementById('btn-guardar-proveedor').textContent = 'Actualizar Proveedor';
    } else {
        if (proveedores.some(p => p.idProveedor === idProveedor)) {
            alert('Ya existe un proveedor con esa identificación.');
            return;
        }
        proveedores.push(nuevoProveedor);
    }

    guardarEnLocalStorage();
    console.log("Proveedores después de guardar:", proveedores); // Para depuración
    renderListaProveedores();
    actualizarSelectProveedores();
    limpiarFormularioProveedor();
}

// Limpiar formulario proveedor
function limpiarFormularioProveedor() {
    document.getElementById('formProveedor').reset();
    document.getElementById('productos-container').innerHTML = `<div class="form-group producto-item">
        <input type="text" class="producto-nombre" placeholder="Nombre del producto" required />
        <input type="number" class="producto-precio" placeholder="Precio unitario" min="0" step="0.01" required />
        <button type="button" class="btn-eliminar-producto" title="Eliminar producto">X</button>
    </div>`;
    document.getElementById('btnAgregarProducto').style.display = 'inline-block';
}

// Actualizar select de proveedores en el formulario de pedido
function actualizarSelectProveedores() {
    const select = document.getElementById('selectProveedor');
    if (!select) return;
    select.innerHTML = '<option value="" disabled selected>Seleccione proveedor</option>';
    proveedores.forEach((prov, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = prov.nombreEmpresa;
        select.appendChild(option);
    });
    actualizarSelectProductos();
}

// Actualizar select de productos según proveedor seleccionado
function actualizarSelectProductos() {
    const selectProv = document.getElementById('selectProveedor');
    const selectProd = document.getElementById('selectProducto');
    if (!selectProd) return;
    selectProd.innerHTML = '<option value="" disabled selected>Seleccione producto</option>';
    if (!selectProv) return;
    const selectedIndex = selectProv.value;
    if (selectedIndex === '') return;
    const productosProv = proveedores[selectedIndex].productos;
    productosProv.forEach((prod, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${prod.nombre} ($${prod.precio.toFixed(2)})`;
        selectProd.appendChild(option);
    });
}

// Guardar o actualizar pedido
function guardarPedido(event) {
    event.preventDefault();

    const proveedorIndex = document.getElementById('selectProveedor').value;
    const productoIndex = document.getElementById('selectProducto').value;
    const cantidad = parseInt(document.getElementById('cantidadPedido').value);

    if (proveedorIndex === '' || productoIndex === '' || isNaN(cantidad) || cantidad <= 0) {
        alert('Por favor complete todos los campos correctamente.');
        return;
    }

    const proveedor = proveedores[proveedorIndex];
    const producto = proveedor.productos[productoIndex];
    const fecha = new Date().toLocaleString(); // <-- MODIFICACIÓN AQUÍ

    const nuevoPedido = {
        proveedorIndex: parseInt(proveedorIndex),
        productoIndex: parseInt(productoIndex),
        cantidad,
        fecha
    };

    const editarIndex = document.querySelector('#formPedido button[type="submit"]')?.dataset?.editIndex;
    if (editarIndex !== undefined) {
        pedidos[editarIndex] = nuevoPedido;
        delete document.querySelector('#formPedido button[type="submit"]').dataset.editIndex;
        document.querySelector('#formPedido button[type="submit"]').textContent = 'Guardar Pedido';
    } else {
        pedidos.push(nuevoPedido);
    }

    guardarEnLocalStorage();
    renderTablaPedidos();
    limpiarFormularioPedido();
}

// Limpiar formulario pedido
function limpiarFormularioPedido() {
    const formPedido = document.getElementById('formPedido');
    if (formPedido) {
        formPedido.reset();
    }
    const productoSelect = document.getElementById('selectProducto');
    if (productoSelect) {
        productoSelect.innerHTML = '<option value="" disabled selected>Seleccione producto</option>';
    }
}

// Mostrar tabla de pedidos
function renderTablaPedidos() {
    const tbody = document.querySelector('#tablaPedidos tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    pedidos.forEach((pedido, index) => {
        const proveedor = proveedores[pedido.proveedorIndex];

        // Verificamos si el proveedor existe
        if (proveedor) {
            const producto = proveedor.productos[pedido.productoIndex];

            // Verificamos si el producto existe
            if (producto) {
                const total = producto.precio * pedido.cantidad;

                const tr = document.createElement('tr');

                tr.innerHTML = `
                    <td>${proveedor.nombreEmpresa}</td>
                    <td>${producto.nombre}</td>
                    <td>${pedido.cantidad}</td>
                    <td>$${producto.precio.toFixed(2)}</td>
                    <td>$${total.toFixed(2)}</td>
                    <td>${pedido.fecha}</td>
                    <td>
                        <button class="editar" onclick="editarPedido(${index})">Editar</button>
                        <button class="eliminar" onclick="eliminarPedido(${index})">Eliminar</button>
                    </td>
                `;
                tbody.appendChild(tr);
            } else {
                console.warn(`Producto no encontrado para el pedido con índice ${index}`);
                // Puedes optar por no mostrar la fila o mostrar un mensaje de error
            }
        } else {
            console.warn(`Proveedor no encontrado para el pedido con índice ${index}`);
            // Puedes optar por no mostrar la fila o mostrar un mensaje de error
        }
    });
}

// Editar pedido
function editarPedido(index) {
    const pedido = pedidos[index];
    document.getElementById('selectProveedor').value = pedido.proveedorIndex;
    actualizarSelectProductos();
    document.getElementById('selectProducto').value = pedido.productoIndex;
    document.getElementById('cantidadPedido').value = pedido.cantidad;

    const guardarPedidoButton = document.querySelector('#formPedido button[type="submit"]');
    if (guardarPedidoButton) {
        guardarPedidoButton.textContent = 'Actualizar Pedido';
        guardarPedidoButton.dataset.editIndex = index;
    }
}

// Eliminar pedido
function eliminarPedido(index) {
    if (confirm('¿Está seguro de eliminar este pedido?')) {
        pedidos.splice(index, 1);
        guardarEnLocalStorage();
        renderTablaPedidos();
    }
}

// Eliminar proveedor (y sus pedidos)
function eliminarProveedor(index) {
    if (confirm('¿Está seguro de eliminar este proveedor? Se eliminarán también sus pedidos asociados.')) {
        proveedores.splice(index, 1);
        pedidos = pedidos.filter(pedido => pedido.proveedorIndex !== index);
        pedidos.forEach(pedido => {
            if (pedido.proveedorIndex > index) {
                pedido.proveedorIndex--;
            }
        });
        guardarEnLocalStorage();
        renderListaProveedores();
        actualizarSelectProveedores();
        renderTablaPedidos();
    }
}

// Editar proveedor (llama a la función ya definida)
function editarProveedor(index) {
    cargarProveedorEnFormulario(index);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarDesdeLocalStorage();

    // Inicialización específica para la página de registro de proveedores
    if (document.getElementById('registro-page')) {
        document.getElementById('btnAgregarProducto').addEventListener('click', agregarProductoInput);
        const formProveedor = document.getElementById('formProveedor');
        if (formProveedor) {
            formProveedor.addEventListener('submit', guardarProveedor);
        }
        renderListaProveedores(); // Aseguramos que la lista se renderice al cargar la página
    }

    // Inicialización específica para la página de gestión de pedidos
    if (!document.getElementById('registro-page')) {
        console.log("Proveedores cargados en index.html:", proveedores); // Para depuración
        renderTablaPedidos();
        actualizarSelectProveedores();
        const selectProveedor = document.getElementById('selectProveedor');
        if (selectProveedor) {
            selectProveedor.addEventListener('change', actualizarSelectProductos);
        }
        const formPedido = document.getElementById('formPedido');
        if (formPedido) {
            formPedido.addEventListener('submit', guardarPedido);
        }
    }
});