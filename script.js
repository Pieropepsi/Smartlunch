// 🛡️ 1. GUARDIÁN DE SEGURIDAD Y CONTROL DE ACCESO
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
let total = 0;
let carrito = [];

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

// OBTENER FECHA ACTUAL EN FORMATO LOCAL (AAAA-MM-DD) sin desfases horarios
function obtenerFechaLocal() {
  const d = new Date();
  const mes = '' + (d.getMonth() + 1);
  const dia = '' + d.getDate();
  const anio = d.getFullYear();
  return [anio, mes.padStart(2, '0'), dia.padStart(2, '0')].join('-');
}

// Variable para controlar qué día está viendo el administrador (por defecto hoy)
let fechaFiltroActual = obtenerFechaLocal();

// 🛒 CARRITO DE COMPRAS (SISTEMA PREMIUM MEJORADO)
function agregarProducto(nombre, precio) {
  carrito.push({ nombre: nombre, precio: parseFloat(precio) });
  total += parseFloat(precio);
  actualizarDiseñoCarrito();
}

function eliminarUnSoloItem(indice) {
  total -= carrito[indice].precio;
  if (total < 0) total = 0;
  carrito.splice(indice, 1);
  actualizarDiseñoCarrito();
}

function vaciarCarrito() {
  carrito = [];
  total = 0;
  actualizarDiseñoCarrito();
}

function actualizarDiseñoCarrito() {
  let lista = document.getElementById("listaPedidos");
  let totalTexto = document.getElementById("total");

  if (!lista) return;
  lista.innerHTML = "";

  if (carrito.length === 0) {
    lista.innerHTML = `
      <div style="text-align: center; padding: 20px 10px; color: #64748b; font-style: italic; font-size: 14px;">
        🛒 Tu pedido está vacío.
      </div>
    `;
    if (totalTexto) totalTexto.textContent = "0.00";
    return;
  }

  carrito.forEach((producto, indice) => {
    let item = document.createElement("li");
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";
    item.style.background = "#1e1e24"; 
    item.style.padding = "10px 12px";
    item.style.borderRadius = "10px";
    item.style.marginBottom = "8px";
    item.style.border = "1px solid #334155";
    item.style.listStyle = "none";

    item.innerHTML = `
      <div style="display: flex; flex-direction: column; text-align: left; gap: 2px;">
        <span style="color: #ffffff; font-weight: 500; font-size: 14px;">🍽️ ${producto.nombre}</span>
        <span style="color: #94a3b8; font-size: 13px;">S/ ${producto.precio.toFixed(2)}</span>
      </div>
      <button onclick="eliminarUnSoloItem(${indice})" class="btn-eliminar-tacho" title="Quitar este producto" style="
        background: transparent;
        border: none;
        color: #ef4444;
        font-size: 15px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
        transition: background 0.2s ease;
      ">
        🗑️
      </button>
    `;

    const btnTacho = item.querySelector(".btn-eliminar-tacho");
    btnTacho.addEventListener("mouseover", () => btnTacho.style.background = "rgba(239, 68, 68, 0.12)");
    btnTacho.addEventListener("mouseout", () => btnTacho.style.background = "transparent");

    lista.appendChild(item);
  });

  if (totalTexto) totalTexto.textContent = total.toFixed(2);
}

// 🚀 ENVIAR PEDIDO DESDE EL ALUMNO (CON HORA EXACTA INCLUYENDO SEGUNDOS)
function finalizarPedido() {
  if (total <= 0) {
    alert("⚠️ Debes agregar productos al carrito primero.");
    return;
  }

  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  let usuario = localStorage.getItem("usuarioActual") || "Estudiante";
  
  let nombresProductos = carrito.map(p => p.nombre);

  // Capturamos la hora exacta con segundos para evitar marcas repetidas
  const ahora = new Date();
  const horaExacta = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let nuevoPedido = {
    id: Date.now().toString(),
    usuario: usuario,
    productos: nombresProductos,
    total: total.toFixed(2),
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

// 👩‍🍳 INTERFAZ QUIOSCO: RENDERIZAR PEDIDOS Y RESUMEN DEL DÍA
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

// ACCIÓN: MOVER PEDIDO DE PENDIENTES A DESPACHADOS (RESUMEN)
function despacharPedido(id) {
  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  
  let pedidoIndex = historial.findIndex(p => p.id === id);
  if (pedidoIndex !== -1) {
    historial[pedidoIndex].estado = "Despachado";
    localStorage.setItem("historial", JSON.stringify(historial));
    alert("📦 Pedido despachado. ¡Se sumó al Resumen del Día!");
    cargarPedidosEnQuiosco();
  }
}

// CALCULAR TOTALES DE VENTAS DEL DÍA SELECCIONADO
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

// ⭐ FAVORITOS (VISTA ALUMNO)
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
  favoritos = favorites.filter(item => item !== nombre);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  cargarFavoritos();
}

// 📋 HISTORIAL (DISEÑO PREMIUM MODULAR CON TARJETAS)
function cargarHistorial() {
  let lista = document.getElementById("historialPedidos");
  if (!lista) return;

  let historial = JSON.parse(localStorage.getItem("historial")) || [];
  lista.innerHTML = "";

  let miUsuario = localStorage.getItem("usuarioActual");
  let misPedidos = historial.filter(p => p.usuario === miUsuario);

  if (misPedidos.length === 0) {
    lista.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #64748b; font-style: italic; font-size: 14px;">
        📋 No hay pedidos realizados aún.
      </div>
    `;
    return;
  }

  misPedidos.reverse().forEach(function (p) {
    let item = document.createElement("li");
    
    // Estilos de tarjeta modular premium alineados con el modo oscuro
    item.style.display = "flex";
    item.style.justifyContent = "space-between";
    item.style.alignItems = "center";
    item.style.background = "#1e1e24";
    item.style.padding = "14px 16px";
    item.style.borderRadius = "12px";
    item.style.marginBottom = "10px";
    item.style.border = "1px solid #334155";
    item.style.listStyle = "none";

    // Configuración visual del badge de estado
    let esEntregado = p.estado === "Despachado";
    let badgeColor = esEntregado ? "#2ecc71" : "#f1c40f";
    let badgeFondo = esEntregado ? "rgba(46, 204, 113, 0.15)" : "rgba(241, 196, 15, 0.15)";
    let badgeTexto = esEntregado ? "✅ Entregado" : "⏳ Pendiente";

    item.innerHTML = `
      <div style="display: flex; flex-direction: column; text-align: left; gap: 4px;">
        <span style="color: #ffffff; font-weight: 600; font-size: 14px;">
          📦 ${p.productos.join(", ")}
        </span>
        <div style="display: flex; align-items: center; gap: 12px; color: #94a3b8; font-size: 12px;">
          <span>🕒 ${p.hora}</span>
          <span style="color: #64748b;">•</span>
          <span>📅 ${p.fechaKey}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 15px;">
        <span style="color: #ffffff; font-weight: 700; font-size: 15px;">S/ ${p.total}</span>
        <span style="
          background: ${badgeFondo}; 
          color: ${badgeColor}; 
          padding: 4px 10px; 
          border-radius: 6px; 
          font-size: 12px; 
          font-weight: 600;
        ">
          ${badgeTexto}
        </span>
      </div>
    `;
    
    lista.appendChild(item);
  });
}

// 🛠️ MANTENIMIENTO DEL CATÁLOGO
function agregarNuevoProducto() {
  let nombre = prompt("✍️ Ingresa el NOMBRE del nuevo producto:");
  if (!nombre) return;
  let precio = prompt("💰 Ingresa el PRECIO (Ejemplo: 4.50):");
  if (!precio) return;
  let emoji = prompt("🍎 Ingresa un EMOJI para el producto:");
  if (!emoji) return;
  let categoria = prompt("📁 Ingresa la CATEGORÍA (sandwich, bebida, snack, fruta):").toLowerCase();

  let catalogo = JSON.parse(localStorage.getItem("catalogoProductos"));
  catalogo[nombre] = { emoji: emoji, categoria: categoria, precio: parseFloat(precio).toFixed(2) };
  localStorage.setItem("catalogoProductos", JSON.stringify(catalogo));
  alert(`✅ ¡"${nombre}" ha sido añadido al menú!`);
}

// FILTROS
function filtrar(tipo) {
  let productos = document.querySelectorAll(".productos-grid .card");
  productos.forEach(card => card.style.display = card.classList.contains(tipo) ? "block" : "none");
}

function mostrarTodos() {
  document.querySelectorAll(".productos-grid .card").forEach(card => card.style.display = "block");
}

// INICIALIZADOR GENERAL
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

  cargarFavoritos();
  cargarHistorial();
  cargarPedidosEnQuiosco();
  actualizarDiseñoCarrito();
});

function cerrarSesion() {
  localStorage.removeItem("tipoUsuario");
  localStorage.removeItem("usuarioActual");
  window.location.href = "login.html";
}

function activarModoOscuro() { document.body.classList.add("dark-mode"); localStorage.setItem("tema", "oscuro"); }
function activarModoClaro() { document.body.classList.remove("dark-mode"); localStorage.setItem("tema", "claro"); }
window.addEventListener("load", () => { if (localStorage.getItem("tema") === "oscuro") document.body.classList.add("dark-mode"); });
// =========================================================================
// 🔄 CONTROL DINÁMICO DE GRADOS (PRIMARIA 1-6 / SECUNDARIA 1-5)
// =========================================================================
function actualizarGrados() {
  const nivel = document.getElementById("regNivel").value;
  const comboGrado = document.getElementById("regGrado");
  
  if (!comboGrado) return;
  
  // Limpiamos las opciones previas dejando solo el marcador de posición
  comboGrado.innerHTML = '<option value="">Grado...</option>';
  
  let totalGrados = 0;
  
  if (nivel === "primaria") {
    totalGrados = 6; // Configura de 1° a 6° Primaria
  } else if (nivel === "secundaria") {
    totalGrados = 5; // Configura de 1° a 5° Secundaria
  } else {
    return; // Si no hay nivel seleccionado, termina la función
  }
  
  // Inyectamos las opciones numéricas dinámicamente
  for (let i = 1; i <= totalGrados; i++) {
    let opcion = document.createElement("option");
    opcion.value = i;
    opcion.textContent = `${i}°`;
    comboGrado.appendChild(opcion);
  }
}