
(function verificarAcceso() {
  const paginaActual = window.location.pathname.split("/").pop();
  if (paginaActual === "login.html" || paginaActual === "") return;

  const tipoUsuario = localStorage.getItem("tipoUsuario");
  if (!tipoUsuario) {
    window.location.href = "login.html";
    return;
  }

  if (paginaActual === "quiosco.html" && tipoUsuario !== "quiosco") {
    alert("❌ Acceso denegado. Esta zona es solo para la administración del quiosco.");
    window.location.href = "index.html";
  }
})();

// VARIABLES GLOBALES
let carrito = []; 
let verTodo = false; // Controla si mostramos los 4 primeros o todo
let fechaFiltroActual = obtenerFechaLocal();

// Catálogo por defecto
const catalogoInicial = {
  "Sándwich de pollo": { emoji: "🥪", categoria: "sandwich", precio: "6.00" },
  "Hot Dog": { emoji: "🌭", categoria: "sandwich", precio: "4.50" },
  "Sándwich Mixto": { emoji: "🥪", categoria: "sandwich", precio: "5.00" },
  "Jugo de naranja": { emoji: "🧃", categoria: "bebida", precio: "3.00" },
  "Gaseosa": { emoji: "🥤", categoria: "bebida", precio: "3.50" },
  "Yogurt": { emoji: "🥛", categoria: "bebida", precio: "3.00" },
  "Pizza personal": { emoji: "🍕", categoria: "snack", precio: "5.00" },
  "Empanada": { emoji: "🥟", categoria: "snack", precio: "4.00" },
  "Galletas": { emoji: "🍪", categoria: "snack", precio: "2.50" },
  "Manzana": { emoji: "🍎", categoria: "fruta", precio: "2.00" },
  "Plátano": { emoji: "🍌", categoria: "fruta", precio: "1.50" },
  "Naranja": { emoji: "🍊", categoria: "fruta", precio: "2.00" }
};

if (!localStorage.getItem("catalogoProductos")) {
  localStorage.setItem("catalogoProductos", JSON.stringify(catalogoInicial));
}

function obtenerFechaLocal() {
  const d = new Date();
  const mes = '' + (d.getMonth() + 1);
  const dia = '' + d.getDate();
  const anio = d.getFullYear();
  return [anio, mes.padStart(2, '0'), dia.padStart(2, '0')].join('-');
}

// 🛒 CARRITO DE COMPRAS (SISTEMA MEJORADO)
function agregarProducto(nombre, precio) {
  let productoExistente = carrito.find(item => item.nombre === nombre);
  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    carrito.push({ nombre: nombre, precio: parseFloat(precio), cantidad: 1 });
  }
  actualizarDiseñoCarrito();
}

function restarProducto(nombre) {
  let item = carrito.find(p => p.nombre === nombre);
  if (item) {
    item.cantidad--;
    if (item.cantidad <= 0) {
      carrito = carrito.filter(p => p.nombre !== nombre);
    }
  }
  actualizarDiseñoCarrito();
}

function eliminarTotalProducto(nombre) {
  carrito = carrito.filter(p => p.nombre !== nombre);
  actualizarDiseñoCarrito();
}

function vaciarCarrito() {
  carrito = [];
  verTodo = false;
  actualizarDiseñoCarrito();
}

function actualizarDiseñoCarrito() {
  let lista = document.getElementById("listaPedidos");
  let totalTexto = document.getElementById("total");
  if (!lista) return;

  lista.innerHTML = "";
  
  // Calcular total real
  let totalCalculado = carrito.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  if (totalTexto) totalTexto.textContent = totalCalculado.toFixed(2);

  // Lógica de "Ver más"
  let productosAMostrar = verTodo ? carrito : carrito.slice(0, 4);

  if (carrito.length === 0) {
    lista.innerHTML = `<li style="text-align:center; padding: 20px 10px; color: #64748b; font-style: italic; font-size: 14px;">🛒 Tu pedido está vacío.</li>`;
    return;
  }

  productosAMostrar.forEach((producto) => {
    let item = document.createElement("li");
    item.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #1e1e24; padding: 10px 12px; border-radius: 10px; margin-bottom: 8px; border: 1px solid #334155; list-style: none;";

    item.innerHTML = `
      <div style="display: flex; flex-direction: column; text-align: left; gap: 2px;">
        <span style="color: #ffffff; font-weight: 500; font-size: 14px;">🍽️ ${producto.nombre}</span>
        <span style="color: #94a3b8; font-size: 13px;">S/ ${(producto.precio * producto.cantidad).toFixed(2)}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button onclick="restarProducto('${producto.nombre}')" style="background:#475569; border:none; color:white; padding: 2px 8px; border-radius:4px; cursor:pointer;">-</button>
        <span style="color:white; min-width: 20px; text-align: center;">${producto.cantidad}</span>
        <button onclick="agregarProducto('${producto.nombre}', ${producto.precio})" style="background:#2563eb; border:none; color:white; padding: 2px 8px; border-radius:4px; cursor:pointer;">+</button>
        <button onclick="eliminarTotalProducto('${producto.nombre}')" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size: 14px;">🗑️</button>
      </div>
    `;
    lista.appendChild(item);
  });

  // Botón "Ver más" si hay más de 4 productos
  if (carrito.length > 4) {
    let btnVerMas = document.createElement("button");
    btnVerMas.textContent = verTodo ? "Ver menos" : "Ver más...";
    btnVerMas.style.cssText = "width: 100%; background: transparent; border: 1px solid #334155; color: #94a3b8; padding: 5px; cursor: pointer; border-radius: 5px; font-size: 12px; margin-top: 5px;";
    btnVerMas.onclick = () => {
      verTodo = !verTodo;
      actualizarDiseñoCarrito();
    };
    lista.appendChild(btnVerMas);
  }
}

// 🚀 ENVIAR PEDIDO
function finalizarPedido() {
  if (carrito.length <= 0) {
    alert("⚠️ Debes agregar productos al carrito primero.");
    return;
  }

  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  let usuario = localStorage.getItem("usuarioActual") || "Estudiante";
  
  let productosDetallados = carrito.map(p => `${p.nombre} (x${p.cantidad})`);
  const ahora = new Date();
  const horaExacta = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let nuevoPedido = {
    id: Date.now().toString(),
    usuario: usuario,
    productos: productosDetallados,
    total: document.getElementById("total").textContent,
    hora: horaExacta,
    fechaKey: obtenerFechaLocal(),
    estado: "Pendiente"
  };

  historial.push(nuevoPedido);
  localStorage.setItem("historial", JSON.stringify(historial));
  
  alert("✅ ¡Pedido enviado al Quiosco con éxito!");
  vaciarCarrito();
  cargarHistorial();
}

// 📅 CAMBIO DE FILTRO EN EL CALENDARIO
function cambiarFechaFiltro() {
  let inputFecha = document.getElementById("filtroFecha");
  if (inputFecha && inputFecha.value) {
    fechaFiltroActual = inputFecha.value;
    let tituloFecha = document.getElementById("fecha-actual-pedidos");
    if (tituloFecha) tituloFecha.textContent = fechaFiltroActual;
    cargarPedidosEnQuiosco();
  }
}

// 👩‍🍳 INTERFAZ QUIOSCO
function cargarPedidosEnQuiosco() {
  let listaQuiosco = document.getElementById("pedidosQuiosco");
  if (!listaQuiosco) return;

  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  listaQuiosco.innerHTML = "";

  let pedidosFiltrados = historial.filter(p => p.fechaKey === fechaFiltroActual && p.estado === "Pendiente");

  if (pedidosFiltrados.length === 0) {
    listaQuiosco.innerHTML = "<li>📋 No hay pedidos pendientes para esta fecha.</li>";
  } else {
    pedidosFiltrados.reverse().forEach(function (pedido) {
      let item = document.createElement("li");
      item.style.padding = "12px";
      item.style.borderBottom = "1px solid #ddd";
      item.style.listStyle = "none";
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <strong>👤 ${pedido.usuario}</strong> - <span style="color:#2b7fff;">${pedido.hora}</span><br>
            <small style="color:#888;">🍔 ${pedido.productos.join(", ")}</small>
          </div>
          <div>
            <span style="font-weight:bold; margin-right:15px;">S/ ${pedido.total}</span>
            <button onclick="despacharPedido('${pedido.id}')" style="background:#2ecc71; padding:5px 10px; font-size:12px; color:white; border:none; border-radius:5px; cursor:pointer;">✅ Despachar</button>
          </div>
        </div>
      `;
      listaQuiosco.appendChild(item);
    });
  }
  actualizarResumenDelDia();
}

function despacharPedido(id) {
  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  let pedidoIndex = historial.findIndex(p => p.id === id);
  if (pedidoIndex !== -1) {
    historial[pedidoIndex].estado = "Despachado";
    localStorage.setItem("historial", JSON.stringify(historial));
    alert("📦 Pedido despachado.");
    cargarPedidosEnQuiosco();
  }
}

function actualizarResumenDelDia() {
  let resumenTotal = document.getElementById("resumenTotal");
  let resumenDespachados = document.getElementById("resumenDespachados");
  let resumenProductos = document.getElementById("resumenProductos");
  if (!resumenTotal) return;

  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  let despachadosDelDia = historial.filter(p => p.fechaKey === fechaFiltroActual && p.estado === "Despachado");

  let dineroTotal = 0;
  let conteoProductos = {};
  despachadosDelDia.forEach(pedido => {
    dineroTotal += parseFloat(pedido.total);
    pedido.productos.forEach(prod => {
      conteoProductos[prod] = (conteoProductos[prod] || 0) + 1;
    });
  });

  resumenTotal.textContent = dineroTotal.toFixed(2);
  resumenDespachados.textContent = despachadosDelDia.length;
  let productosListaHtml = [];
  for (let prod in conteoProductos) {
    productosListaHtml.push(`${prod} (${conteoProductos[prod]})`);
  }
  resumenProductos.textContent = productosListaHtml.length > 0 ? productosListaHtml.join(", ") : "Ninguno aún";
}

// ⭐ FAVORITOS
function agregarFavorito(nombre) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  if (favoritos.includes(nombre)) {
    alert("⭐ Este producto ya está en tus favoritos.");
    return;
  }
  favoritos.push(nombre);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  alert("⭐ " + nombre + " agregado a favoritos.");
}

function cargarFavoritos() {
  let listaSandwich = document.getElementById("lista-sandwich");
  if (!listaSandwich) return;

  let listaBebida = document.getElementById("lista-bebida");
  let listaSnack = document.getElementById("lista-snack");
  let listaFruta = document.getElementById("lista-fruta");
  let msgVacio = document.getElementById("fav-vacio");

  listaSandwich.innerHTML = ""; listaBebida.innerHTML = ""; listaSnack.innerHTML = ""; listaFruta.innerHTML = "";
  document.getElementById("sec-sandwich").style.display = "none";
  document.getElementById("sec-bebida").style.display = "none";
  document.getElementById("sec-snack").style.display = "none";
  document.getElementById("sec-fruta").style.display = "none";
  msgVacio.style.display = "block";

  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  if (favoritos.length > 0) msgVacio.style.display = "none";

  const catalogo = JSON.parse(localStorage.getItem("catalogoProductos"));

  favoritos.forEach(function (nombre) {
    let producto = catalogo[nombre];
    if (!producto) return;

    let card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="estrella" onclick="eliminarFavorito('${nombre}')">❌</div>
      <div class="emoji">${producto.emoji}</div>
      <h3>${nombre}</h3>
      <p>S/ ${producto.precio}</p>
      <button onclick="agregarProducto('${nombre}', ${parseFloat(producto.precio)})">Agregar</button>
    `;

    if (producto.categoria === "sandwich") {
      listaSandwich.appendChild(card); document.getElementById("sec-sandwich").style.display = "block";
    } else if (producto.categoria === "bebida") {
      listaBebida.appendChild(card); document.getElementById("sec-bebida").style.display = "block";
    } else if (producto.categoria === "snack") {
      listaSnack.appendChild(card); document.getElementById("sec-snack").style.display = "block";
    } else if (producto.categoria === "fruta") {
      listaFruta.appendChild(card); document.getElementById("sec-fruta").style.display = "block";
    }
  });
}

function eliminarFavorito(nombre) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  favoritos = favoritos.filter(item => item !== nombre);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  cargarFavoritos();
}

// 📋 HISTORIAL
function cargarHistorial() {
  let lista = document.getElementById("historialPedidos");
  if (!lista) return;

  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  lista.innerHTML = "";

  let miUsuario = localStorage.getItem("usuarioActual");
  let misPedidos = historial.filter(p => p.usuario === miUsuario);

  if (misPedidos.length === 0) {
    lista.innerHTML = `<div style="text-align: center; padding: 20px; color: #64748b; font-style: italic; font-size: 14px;">📋 No hay pedidos realizados aún.</div>`;
    return;
  }

  misPedidos.reverse().forEach(function (p) {
    let item = document.createElement("li");
    item.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #1e1e24; padding: 14px 16px; borderRadius: 12px; marginBottom: 10px; border: 1px solid #334155; list-style: none;";
    let esEntregado = p.estado === "Despachado";
    let badgeColor = esEntregado ? "#2ecc71" : "#f1c40f";
    let badgeFondo = esEntregado ? "rgba(46, 204, 113, 0.15)" : "rgba(241, 196, 15, 0.15)";
    let badgeTexto = esEntregado ? "✅ Entregado" : "⏳ Pendiente";

    item.innerHTML = `
      <div style="display: flex; flex-direction: column; text-align: left; gap: 4px;">
        <span style="color: #ffffff; font-weight: 600; font-size: 14px;">📦 ${p.productos.join(", ")}</span>
        <div style="display: flex; align-items: center; gap: 12px; color: #94a3b8; font-size: 12px;">
          <span>🕒 ${p.hora}</span><span style="color: #64748b;">•</span><span>📅 ${p.fechaKey}</span>
        </div>
      </div>
      <span style="background: ${badgeFondo}; color: ${badgeColor}; padding: 4px 10px; border-radius: 6px; font-size: 12px;">${badgeTexto}</span>
    `;
    lista.appendChild(item);
  });
}

// 🛠️ MANTENIMIENTO
// [TU CÓDIGO ORIGINAL SE MANTIENE AQUÍ...]
// ... (He omitido el bloque completo para brevedad, pero conserva todas tus líneas originales) ...

// NUEVAS FUNCIONES PARA INTERFAZ VISUAL DEL QUIOSCO
function renderizarInventario() {
  let lista = document.getElementById("listaInventario");
  if (!lista) return;

  let catalogo = JSON.parse(localStorage.getItem("catalogoProductos")) || {};
  lista.innerHTML = "";

  for (let nombre in catalogo) {
    let p = catalogo[nombre];
    let li = document.createElement("li");
    li.style.cssText = "display:flex; justify-content:space-between; padding: 10px; border-bottom: 1px solid #334155; align-items: center; background: #1e1e24; margin-bottom: 5px; border-radius: 5px;";
    
    li.innerHTML = `
      <span style="color: white;"><strong>${p.emoji} ${nombre}</strong> - S/ ${p.precio}</span>
      <button onclick="eliminarProductoAdmin('${nombre}')" style="background:#ef4444; color:white; border:none; padding: 5px 10px; border-radius: 4px; cursor:pointer;">🗑️</button>
    `;
    lista.appendChild(li);
  }
}

function guardarProducto() {
  let nombre = document.getElementById("nuevoNombre").value;
  let precio = document.getElementById("nuevoPrecio").value;
  let categoria = document.getElementById("nuevaCategoria").value;

  if (!nombre || !precio) {
    alert("⚠️ Completa nombre y precio.");
    return;
  }

  let catalogo = JSON.parse(localStorage.getItem("catalogoProductos")) || {};
  catalogo[nombre] = { 
    emoji: "🍴", 
    categoria: categoria, 
    precio: parseFloat(precio).toFixed(2) 
  };
  
  localStorage.setItem("catalogoProductos", JSON.stringify(catalogo));
  document.getElementById("nuevoNombre").value = "";
  document.getElementById("nuevoPrecio").value = "";
  renderizarInventario();
}

function eliminarProductoAdmin(nombre) {
  if (confirm(`¿Eliminar ${nombre}?`)) {
    let catalogo = JSON.parse(localStorage.getItem("catalogoProductos"));
    delete catalogo[nombre];
    localStorage.setItem("catalogoProductos", JSON.stringify(catalogo));
    renderizarInventario();
  }
}

// ACTUALIZACIÓN DEL INICIALIZADOR
document.addEventListener("DOMContentLoaded", function () {
  // [TU CÓDIGO ORIGINAL...]
  
  // AÑADIDO:
  if (document.getElementById("listaInventario")) {
    renderizarInventario();
  }
});
document.addEventListener("DOMContentLoaded", function () {
  let buscador = document.getElementById("buscador");
  if (buscador) {
    buscador.addEventListener("keyup", function () {
      let texto = this.value.toLowerCase();
      document.querySelectorAll(".productos-grid .card").forEach(function (card) {
        let nombre = card.querySelector("h3").textContent.toLowerCase();
        card.style.display = nombre.includes(texto) ? "block" : "none";
      });
    });
  }
  let inputFecha = document.getElementById("filtroFecha");
  if (inputFecha) inputFecha.value = fechaFiltroActual;
  cargarFavoritos(); cargarHistorial(); cargarPedidosEnQuiosco(); actualizarDiseñoCarrito();
});

function cerrarSesion() {
  localStorage.removeItem("tipoUsuario");
  localStorage.removeItem("usuarioActual");
  window.location.href = "login.html";
}

function activarModoOscuro() { document.body.classList.add("dark-mode"); localStorage.setItem("tema", "oscuro"); }
function activarModoClaro() { document.body.classList.remove("dark-mode"); localStorage.setItem("tema", "claro"); }

function actualizarGrados() {
  const nivel = document.getElementById("regNivel").value;
  const comboGrado = document.getElementById("regGrado");
  if (!comboGrado) return;
  comboGrado.innerHTML = '<option value="">Grado...</option>';
  let totalGrados = nivel === "primaria" ? 6 : (nivel === "secundaria" ? 5 : 0);
  for (let i = 1; i <= totalGrados; i++) {
    let opcion = document.createElement("option");
    opcion.value = i; opcion.textContent = `${i}°`; comboGrado.appendChild(opcion);
  }
}
// Recuperar el tema guardado al cargar la página
window.addEventListener("load", () => {
  if (localStorage.getItem("tema") === "oscuro") {
    document.body.classList.add("dark-mode");
  }
});
// ========================================================
// 🚀 INTEGRACIÓN CON FIREBASE (NUBE)
// ========================================================

// 1. ESCUCHAR CAMBIOS EN LA NUBE Y ACTUALIZAR LOCALSTORAGE
// Esto se ejecutará cada vez que alguien guarde o borre un producto en la nube
function iniciarSincronizacionFirebase() {
    if (!window.db) {
        console.log("⚠️ Firebase no conectado, usando modo local.");
        return;
    }

    window.db.collection("productos").onSnapshot((snapshot) => {
        let nuevoCatalogo = {};
        snapshot.forEach((doc) => {
            nuevoCatalogo[doc.id] = doc.data();
        });

        // Guardamos la versión "maestra" de la nube en el localStorage del usuario
        localStorage.setItem("catalogoProductos", JSON.stringify(nuevoCatalogo));
        
        console.log("☁️ Catálogo sincronizado desde la nube.");

        // Refrescar interfaces si existen en la página actual
        if (typeof renderizarInventario === 'function') renderizarInventario();
        if (typeof cargarFavoritos === 'function') cargarFavoritos();
        
        // Si estamos en la página de inicio, recargamos para ver los cambios
        if (document.querySelector(".productos-grid")) {
             // Esto es opcional, pero asegura que el usuario vea los cambios al instante
             location.reload(); 
        }
    });
}

// 2. MODIFICAR GUARDAR PRODUCTO PARA QUE ESCRIBA EN LA NUBE
// Reemplaza tu función guardarProducto antigua por esta:
function guardarProducto() {
    let nombre = document.getElementById("nuevoNombre").value;
    let precio = document.getElementById("nuevoPrecio").value;
    let categoria = document.getElementById("nuevaCategoria").value;

    if (!nombre || !precio) {
        alert("⚠️ Completa nombre y precio.");
        return;
    }

    if (window.db) {
        window.db.collection("productos").doc(nombre).set({
            emoji: "🍴", 
            categoria: categoria, 
            precio: parseFloat(precio).toFixed(2) 
        }).then(() => {
            alert("✅ Producto guardado en la nube.");
            document.getElementById("nuevoNombre").value = "";
            document.getElementById("nuevoPrecio").value = "";
        }).catch(err => alert("Error: " + err));
    }
}

// 3. MODIFICAR ELIMINAR PRODUCTO PARA LA NUBE
// Reemplaza tu función eliminarProductoAdmin antigua por esta:
function eliminarProductoAdmin(nombre) {
    if (confirm(`¿Eliminar ${nombre} de la nube?`)) {
        console.log("Intentando eliminar:", nombre); // Veremos esto en la consola
        
        if (window.db) {
            window.db.collection("productos").doc(nombre).delete()
            .then(() => {
                console.log("✅ Eliminado con éxito de Firebase");
                alert("🗑️ Producto eliminado de la nube.");
            })
            .catch((error) => {
                console.error("❌ Error al eliminar en Firebase:", error);
                alert("Error al eliminar: " + error.message);
            });
        } else {
            console.error("❌ window.db no está definido");
            alert("Error: La base de datos no está conectada.");
        }
    }
}
