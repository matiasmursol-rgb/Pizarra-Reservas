/* =========================================================
   PIZARRA DIGITAL DE RESERVAS
   VERSIÓN SUPABASE
   SIN LIBRES
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://ygfirzypncpkvrxjuyka.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_mFJd6UdKVuXOiScJugCCgQ_6tq0PFYN";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


/* =========================================================
   CONFIGURACIÓN
========================================================= */

const DIAS = [
  "LUNES",
  "MARTES",
  "MIÉRCOLES",
  "JUEVES",
  "VIERNES",
  "SÁBADO",
  "DOMINGO"
];


/* =========================================================
   DATOS EN MEMORIA
========================================================= */

let reservas = [];

let notas = [];

let fechaSemana = new Date();

let reservaEditando = null;

let cargandoDatos = false;


/* =========================================================
   ELEMENTOS
========================================================= */

const pizarra =
  document.getElementById("pizarra");

const rangoSemana =
  document.getElementById("rangoSemana");

const modal =
  document.getElementById("modalReserva");

const tipoReserva =
  document.getElementById("tipoReserva");

const grupoHora =
  document.getElementById("grupoHora");

const modoHora =
  document.getElementById("modoHora");

const horaFija =
  document.getElementById("horaFija");

const horasVariable =
  document.getElementById("horasVariable");


/* =========================================================
   FECHAS
========================================================= */

function obtenerLunes(fecha) {

  const copia =
    new Date(fecha);

  let dia =
    copia.getDay();

  if (dia === 0) {
    dia = 7;
  }

  copia.setDate(
    copia.getDate() - dia + 1
  );

  copia.setHours(
    0,
    0,
    0,
    0
  );

  return copia;
}


function fechaTexto(fecha) {

  const año =
    fecha.getFullYear();

  const mes =
    String(
      fecha.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      fecha.getDate()
    ).padStart(2, "0");

  return `${año}-${mes}-${dia}`;
}


function fechaBonita(fecha) {

  const dia =
    String(
      fecha.getDate()
    ).padStart(2, "0");

  const mes =
    String(
      fecha.getMonth() + 1
    ).padStart(2, "0");

  const año =
    fecha.getFullYear();

  return `${dia}/${mes}/${año}`;
}


/* =========================================================
   HORA AM / PM
========================================================= */

function convertirHora(hora) {

  if (!hora) {
    return "";
  }

  const partes =
    String(hora).split(":");

  let horas =
    parseInt(partes[0], 10);

  const minutos =
    partes[1] || "00";

  const ampm =
    horas >= 12
      ? "PM"
      : "AM";

  horas =
    horas % 12 || 12;

  return `${horas}:${minutos} ${ampm}`;
}


/* =========================================================
   ESCAPAR TEXTO
========================================================= */

function escapar(texto) {

  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   CONVERTIR RESERVA DESDE SUPABASE
========================================================= */

function convertirReservaDesdeSupabase(fila) {

  return {

    id:
      fila.id,

    fecha:
      fila.fecha,

    propiedad:
      fila.propiedad || "",

    cliente:
      fila.cliente || "",

    personas:
      Number(fila.personas || 1),

    noches:
      Number(fila.noches || 1),

    tipo:
      fila.tipo || "SELF",

    /* HORA FIJA */

    hora:
      fila.hora || "",

    /* RANGO */

    horaInicio:
      fila.hora_inicio || "",

    horaFin:
      fila.hora_fin || "",

    ventaPorCobrar:
      Boolean(fila.cobro),

    nota:
      fila.nota || "",

    completado:
      Boolean(fila.completada)

  };
}


/* =========================================================
   CONVERTIR NOTA
========================================================= */

function convertirNotaDesdeSupabase(fila) {

  return {

    id:
      fila.id,

    texto:
      fila.texto || "",

    created_at:
      fila.created_at || ""

  };
}


/* =========================================================
   CARGAR DATOS
========================================================= */

async function cargarDatos() {

  if (cargandoDatos) {
    return;
  }

  cargandoDatos = true;

  try {

    const [
      resultadoReservas,
      resultadoNotas
    ] = await Promise.all([

      supabaseClient
        .from("reservas")
        .select("*")
        .order(
          "fecha",
          {
            ascending: true
          }
        ),

      supabaseClient
        .from("notas")
        .select("*")
        .order(
          "created_at",
          {
            ascending: true
          }
        )

    ]);


    if (resultadoReservas.error) {

      console.error(
        "Error cargando reservas:",
        resultadoReservas.error
      );

      mostrarErrorSupabase(
        "No se pudieron cargar las reservas.",
        resultadoReservas.error
      );

      return;

    }


    if (resultadoNotas.error) {

      console.error(
        "Error cargando notas:",
        resultadoNotas.error
      );

      mostrarErrorSupabase(
        "No se pudieron cargar las notas.",
        resultadoNotas.error
      );

      return;

    }


    reservas =
      (resultadoReservas.data || [])
        .map(
          convertirReservaDesdeSupabase
        );


    notas =
      (resultadoNotas.data || [])
        .map(
          convertirNotaDesdeSupabase
        );


    mostrarSemana();

    mostrarNotas();

  }

  catch (error) {

    console.error(
      "Error general:",
      error
    );

    alert(
      "No se pudo conectar con Supabase.\n\n" +
      "Revisa la consola del navegador para ver el detalle."
    );

  }

  finally {

    cargandoDatos = false;

  }

}


/* =========================================================
   MENSAJE DE ERROR
========================================================= */

function mostrarErrorSupabase(
  mensaje,
  error
) {

  let detalle = "";

  if (error) {

    detalle =
      error.message ||
      error.details ||
      error.hint ||
      "";

  }

  console.error(
    mensaje,
    error
  );

  alert(
    mensaje +
    (
      detalle
        ? "\n\nDetalle:\n" + detalle
        : ""
    )
  );

}


/* =========================================================
   MIGRAR DATOS ANTIGUOS
========================================================= */

async function migrarLocalStorage() {

  try {

    const [
      reservasSupabase,
      notasSupabase
    ] = await Promise.all([

      supabaseClient
        .from("reservas")
        .select("id")
        .limit(1),

      supabaseClient
        .from("notas")
        .select("id")
        .limit(1)

    ]);


    if (
      reservasSupabase.error ||
      notasSupabase.error
    ) {

      return;

    }


    /* RESERVAS ANTIGUAS */

    if (
      !reservasSupabase.data ||
      reservasSupabase.data.length === 0
    ) {

      const reservasViejas =
        JSON.parse(
          localStorage.getItem(
            "reservas"
          ) || "[]"
        );


      if (
        Array.isArray(reservasViejas) &&
        reservasViejas.length > 0
      ) {

        const filas =
          reservasViejas.map(
            reserva => ({

              fecha:
                reserva.fecha,

              propiedad:
                reserva.propiedad || "",

              cliente:
                reserva.cliente || "",

              personas:
                Number(
                  reserva.personas || 1
                ),

              noches:
                Number(
                  reserva.noches || 1
                ),

              tipo:
                reserva.tipo || "SELF",

              hora:
                reserva.hora || "",

              hora_inicio:
                reserva.horaInicio || null,

              hora_fin:
                reserva.horaFin || null,

              cobro:
                Boolean(
                  reserva.ventaPorCobrar
                ),

              nota:
                reserva.nota || "",

              completada:
                Boolean(
                  reserva.completado
                )

            })
          );


        const { error } =
          await supabaseClient
            .from("reservas")
            .insert(filas);


        if (error) {

          console.error(
            "No se pudieron migrar las reservas:",
            error
          );

        }

      }

    }


    /* NOTAS ANTIGUAS */

    if (
      !notasSupabase.data ||
      notasSupabase.data.length === 0
    ) {

      const notasViejas =
        JSON.parse(
          localStorage.getItem(
            "notas"
          ) || "[]"
        );


      if (
        Array.isArray(notasViejas) &&
        notasViejas.length > 0
      ) {

        const filas =
          notasViejas
            .filter(
              nota =>
                typeof nota === "string" &&
                nota.trim()
            )
            .map(
              nota => ({
                texto:
                  nota.trim()
              })
            );


        if (filas.length > 0) {

          const { error } =
            await supabaseClient
              .from("notas")
              .insert(filas);


          if (error) {

            console.error(
              "No se pudieron migrar las notas:",
              error
            );

          }

        }

      }

    }

  }

  catch (error) {

    console.error(
      "Error durante migración:",
      error
    );

  }

}


/* =========================================================
   MOSTRAR SEMANA
========================================================= */

function mostrarSemana() {

  const lunes =
    obtenerLunes(
      fechaSemana
    );


  const domingo =
    new Date(lunes);

  domingo.setDate(
    domingo.getDate() + 6
  );


  rangoSemana.textContent =
    `${fechaBonita(lunes)} → ${fechaBonita(domingo)}`;


  pizarra.innerHTML = "";


  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const fecha =
      new Date(lunes);

    fecha.setDate(
      lunes.getDate() + i
    );


    const fechaActual =
      fechaTexto(fecha);


    const columna =
      document.createElement(
        "div"
      );

    columna.className =
      "dia";


    const encabezado =
      document.createElement(
        "div"
      );

    encabezado.className =
      "dia-header";


    encabezado.innerHTML = `

      <div class="nombre-dia">
        ${DIAS[i]}
      </div>

      <div class="numero-dia">
        ${fechaBonita(fecha)}
      </div>

    `;


    columna.appendChild(
      encabezado
    );


    const contenedor =
      document.createElement(
        "div"
      );

    contenedor.className =
      "reservas";


    const reservasDelDia =
      reservas.filter(
        reserva =>
          reserva.fecha === fechaActual
      );


    reservasDelDia.forEach(
      reserva => {

        contenedor.appendChild(
          crearReserva(reserva)
        );

      }
    );


    columna.appendChild(
      contenedor
    );


    pizarra.appendChild(
      columna
    );

  }

}


/* =========================================================
   CREAR RESERVA VISUAL
========================================================= */

function crearReserva(reserva) {


  /* =====================================================
     SELF CHECK-IN
  ===================================================== */

  if (
    reserva.tipo === "SELF"
  ) {

    const div =
      document.createElement(
        "div"
      );

    div.className =
      "reserva-self";


    const dinero =
      reserva.ventaPorCobrar
        ? `<span class="dinero">$$</span>`
        : "";


    div.innerHTML = `

      <span class="flecha">
        ➜
      </span>

      <span class="propiedad">
        ${escapar(reserva.propiedad)}
      </span>

      &nbsp;&nbsp;

      <span>
        ${escapar(reserva.cliente)}
      </span>

      &nbsp;&nbsp;

      <span class="datos">
        ${reserva.personas}P - ${reserva.noches}N
      </span>

      &nbsp;&nbsp;

      ${dinero}

      <div class="acciones">

        <button
          class="btn-principal"
          onclick="editarReserva(${reserva.id})"
        >
          Editar
        </button>

        <button
          class="btn-rojo"
          onclick="eliminarReserva(${reserva.id})"
        >
          Eliminar
        </button>

      </div>

    `;


    return div;

  }


  /* =====================================================
     CHECK-IN REGULAR
  ===================================================== */

  const div =
    document.createElement(
      "div"
    );

  div.className =
    "reserva-checkin";


  let estado;


  if (
    reserva.completado
  ) {

    estado = `

      <div class="hora hora-completada">
        X
      </div>

    `;

  }

  else {

    let textoHora =
      "⏰ Sin hora";


    /* RANGO */

    if (
      reserva.horaInicio &&
      reserva.horaFin
    ) {

      textoHora =
        `⏰ ${convertirHora(reserva.horaInicio)} - ${convertirHora(reserva.horaFin)}`;

    }

    /* HORA FIJA */

    else if (
      reserva.hora
    ) {

      textoHora =
        `⏰ ${convertirHora(reserva.hora)}`;

    }


    estado = `

      <div class="hora">
        ${textoHora}
      </div>

    `;

  }


  const dinero =
    reserva.ventaPorCobrar
      ? `<span class="dinero">$$</span>`
      : "";


  const nota =
    reserva.nota
      ? `

        <div class="nota">
          📝 ${escapar(reserva.nota)}
        </div>

      `
      : "";


  div.innerHTML = `

    <div class="propiedad">
      ${escapar(reserva.propiedad)}
    </div>

    <div class="cliente">
      ${escapar(reserva.cliente)}
    </div>

    <div class="datos">
      ${reserva.personas}P - ${reserva.noches}N
    </div>

    ${estado}

    ${dinero}

    ${nota}

    <div class="acciones">

      ${
        reserva.completado

          ?

        `

          <button
            class="btn-gris"
            onclick="deshacerCheckIn(${reserva.id})"
          >
            ↩ Deshacer X
          </button>

        `

          :

        `

          <button
            class="btn-verde"
            onclick="completarCheckIn(${reserva.id})"
          >
            ✓ Completar
          </button>

        `
      }


      <button
        class="btn-principal"
        onclick="editarReserva(${reserva.id})"
      >
        Editar
      </button>


      <button
        class="btn-rojo"
        onclick="eliminarReserva(${reserva.id})"
      >
        Eliminar
      </button>

    </div>

  `;


  return div;

}


/* =========================================================
   ABRIR MODAL
========================================================= */

function abrirModal() {

  reservaEditando =
    null;


  document.getElementById(
    "tituloModal"
  ).textContent =
    "Nueva Reserva";


  document.getElementById(
    "reservaId"
  ).value =
    "";


  document.getElementById(
    "propiedad"
  ).value =
    "";


  document.getElementById(
    "cliente"
  ).value =
    "";


  document.getElementById(
    "personas"
  ).value =
    1;


  document.getElementById(
    "noches"
  ).value =
    1;


  document.getElementById(
    "tipoReserva"
  ).value =
    "SELF";


  /* HORA FIJA */

  document.getElementById(
    "hora"
  ).value =
    "";


  /* RANGO */

  document.getElementById(
    "horaInicio"
  ).value =
    "";

  document.getElementById(
    "horaFin"
  ).value =
    "";


  /* MODO */

  modoHora.value =
    "FIJA";


  document.getElementById(
    "ventaPorCobrar"
  ).checked =
    false;


  document.getElementById(
    "notaReserva"
  ).value =
    "";


  llenarDias();


  const hoy =
    fechaTexto(
      new Date()
    );


  const select =
    document.getElementById(
      "fechaReserva"
    );


  const opcionHoy =
    Array.from(
      select.options
    ).find(
      opcion =>
        opcion.value === hoy
    );


  if (opcionHoy) {

    select.value =
      hoy;

  }


  actualizarTipo();


  modal.classList.add(
    "visible"
  );

}


/* =========================================================
   CERRAR MODAL
========================================================= */

function cerrarModal() {

  modal.classList.remove(
    "visible"
  );

  reservaEditando =
    null;

}


/* =========================================================
   LLENAR DÍAS
========================================================= */

function llenarDias() {

  const select =
    document.getElementById(
      "fechaReserva"
    );


  select.innerHTML =
    "";


  const lunes =
    obtenerLunes(
      fechaSemana
    );


  for (
    let i = 0;
    i < 7;
    i++
  ) {

    const fecha =
      new Date(lunes);

    fecha.setDate(
      lunes.getDate() + i
    );


    const opcion =
      document.createElement(
        "option"
      );


    opcion.value =
      fechaTexto(fecha);


    opcion.textContent =
      `${DIAS[i]} - ${fechaBonita(fecha)}`;


    select.appendChild(
      opcion
    );

  }

}


/* =========================================================
   CAMBIAR TIPO DE RESERVA
========================================================= */

function actualizarTipo() {

  if (
    tipoReserva.value === "CHECKIN"
  ) {

    grupoHora.style.display =
      "block";

    actualizarModoHora();

  }

  else {

    grupoHora.style.display =
      "none";

    document.getElementById(
      "hora"
    ).value =
      "";

    document.getElementById(
      "horaInicio"
    ).value =
      "";

    document.getElementById(
      "horaFin"
    ).value =
      "";

  }

}


/* =========================================================
   CAMBIAR ENTRE HORA FIJA Y VARIABLE
========================================================= */

function actualizarModoHora() {

  if (
    tipoReserva.value !== "CHECKIN"
  ) {

    horaFija.style.display =
      "none";

    horasVariable.style.display =
      "none";

    return;

  }


  if (
    modoHora.value === "VARIABLE"
  ) {

    horaFija.style.display =
      "none";

    horasVariable.style.display =
      "block";

  }

  else {

    horaFija.style.display =
      "block";

    horasVariable.style.display =
      "none";

  }

}


/* =========================================================
   GUARDAR RESERVA
========================================================= */

async function guardarReserva() {

  const propiedad =
    document.getElementById(
      "propiedad"
    ).value.trim();


  const cliente =
    document.getElementById(
      "cliente"
    ).value.trim();


  const personas =
    Number(
      document.getElementById(
        "personas"
      ).value
    );


  const noches =
    Number(
      document.getElementById(
        "noches"
      ).value
    );


  const tipo =
    tipoReserva.value;


  const modo =
    modoHora.value;


  const hora =
    document.getElementById(
      "hora"
    ).value;


  const horaInicio =
    document.getElementById(
      "horaInicio"
    ).value;


  const horaFin =
    document.getElementById(
      "horaFin"
    ).value;


  const venta =
    document.getElementById(
      "ventaPorCobrar"
    ).checked;


  const nota =
    document.getElementById(
      "notaReserva"
    ).value.trim();


  const fecha =
    document.getElementById(
      "fechaReserva"
    ).value;


  /* =====================================================
     VALIDACIONES
  ===================================================== */

  if (!fecha) {

    alert(
      "Selecciona el día de entrada."
    );

    return;

  }


  if (!propiedad) {

    alert(
      "Por favor coloca la propiedad."
    );

    return;

  }


  if (!cliente) {

    alert(
      "Por favor coloca el cliente."
    );

    return;

  }


  if (
    !Number.isFinite(personas) ||
    personas < 1
  ) {

    alert(
      "La cantidad de personas debe ser válida."
    );

    return;

  }


  if (
    !Number.isFinite(noches) ||
    noches < 1
  ) {

    alert(
      "La cantidad de noches debe ser válida."
    );

    return;

  }


  /* =====================================================
     VALIDACIÓN DE HORA FIJA
  ===================================================== */

  if (
    tipo === "CHECKIN" &&
    modo === "FIJA" &&
    !hora
  ) {

    alert(
      "Coloca la hora de llegada."
    );

    return;

  }


  /* =====================================================
     VALIDACIÓN DE RANGO
  ===================================================== */

  if (
    tipo === "CHECKIN" &&
    modo === "VARIABLE"
  ) {

    if (
      !horaInicio ||
      !horaFin
    ) {

      alert(
        "Coloca la hora inicial y la hora final."
      );

      return;

    }


    if (
      horaInicio >= horaFin
    ) {

      alert(
        "La hora 'Desde' debe ser anterior a la hora 'Hasta'."
      );

      return;

    }

  }


  /* =====================================================
     DATOS PARA SUPABASE
  ===================================================== */

  const datos = {

    fecha:
      fecha,

    propiedad:
      propiedad,

    cliente:
      cliente,

    personas:
      personas,

    noches:
      noches,

    tipo:
      tipo,

    /* HORA FIJA */

    hora:
      (
        tipo === "CHECKIN" &&
        modo === "FIJA"
      )
        ? hora
        : null,

    /* RANGO */

    hora_inicio:
      (
        tipo === "CHECKIN" &&
        modo === "VARIABLE"
      )
        ? horaInicio
        : null,

    hora_fin:
      (
        tipo === "CHECKIN" &&
        modo === "VARIABLE"
      )
        ? horaFin
        : null,

    cobro:
      venta,

    nota:
      nota || null

  };


  /* =====================================================
     EDITAR
  ===================================================== */

  if (
    reservaEditando !== null
  ) {

    const reservaActual =
      reservas.find(
        reserva =>
          Number(reserva.id) ===
          Number(reservaEditando)
      );


    if (!reservaActual) {

      alert(
        "No se encontró la reserva."
      );

      return;

    }


    const {
      data,
      error
    } =
      await supabaseClient
        .from("reservas")
        .update(datos)
        .eq(
          "id",
          reservaEditando
        )
        .select()
        .single();


    if (error) {

      mostrarErrorSupabase(
        "No se pudo actualizar la reserva.",
        error
      );

      return;

    }


    const indice =
      reservas.findIndex(
        reserva =>
          Number(reserva.id) ===
          Number(reservaEditando)
      );


    if (indice !== -1) {

      reservas[indice] =
        convertirReservaDesdeSupabase(
          data
        );

    }

  }


  /* =====================================================
     NUEVA RESERVA
  ===================================================== */

  else {

    const {
      data,
      error
    } =
      await supabaseClient
        .from("reservas")
        .insert(datos)
        .select()
        .single();


    if (error) {

      mostrarErrorSupabase(
        "No se pudo guardar la reserva.",
        error
      );

      return;

    }


    reservas.push(
      convertirReservaDesdeSupabase(
        data
      )
    );

  }


  cerrarModal();

  mostrarSemana();

}


/* =========================================================
   EDITAR RESERVA
========================================================= */

function editarReserva(id) {

  const reserva =
    reservas.find(
      item =>
        Number(item.id) ===
        Number(id)
    );


  if (!reserva) {

    alert(
      "No se encontró la reserva."
    );

    return;

  }


  reservaEditando =
    id;


  document.getElementById(
    "tituloModal"
  ).textContent =
    "Editar Reserva";


  llenarDias();


  document.getElementById(
    "fechaReserva"
  ).value =
    reserva.fecha;


  document.getElementById(
    "propiedad"
  ).value =
    reserva.propiedad;


  document.getElementById(
    "cliente"
  ).value =
    reserva.cliente;


  document.getElementById(
    "personas"
  ).value =
    reserva.personas;


  document.getElementById(
    "noches"
  ).value =
    reserva.noches;


  document.getElementById(
    "tipoReserva"
  ).value =
    reserva.tipo;


  /* =====================================================
     CARGAR HORA FIJA O VARIABLE
  ===================================================== */

  if (
    reserva.horaInicio &&
    reserva.horaFin
  ) {

    modoHora.value =
      "VARIABLE";


    document.getElementById(
      "horaInicio"
    ).value =
      reserva.horaInicio;


    document.getElementById(
      "horaFin"
    ).value =
      reserva.horaFin;


    document.getElementById(
      "hora"
    ).value =
      "";

  }

  else {

    modoHora.value =
      "FIJA";


    document.getElementById(
      "hora"
    ).value =
      reserva.hora || "";


    document.getElementById(
      "horaInicio"
    ).value =
      "";


    document.getElementById(
      "horaFin"
    ).value =
      "";

  }


  document.getElementById(
    "ventaPorCobrar"
  ).checked =
    Boolean(
      reserva.ventaPorCobrar
    );


  document.getElementById(
    "notaReserva"
  ).value =
    reserva.nota || "";


  actualizarTipo();


  modal.classList.add(
    "visible"
  );

}


/* =========================================================
   COMPLETAR CHECK-IN
========================================================= */

async function completarCheckIn(id) {

  const reserva =
    reservas.find(
      item =>
        Number(item.id) ===
        Number(id)
    );


  if (!reserva) {
    return;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("reservas")
      .update({
        completada: true
      })
      .eq(
        "id",
        id
      )
      .select()
      .single();


  if (error) {

    mostrarErrorSupabase(
      "No se pudo completar el Check-In.",
      error
    );

    return;

  }


  const indice =
    reservas.findIndex(
      item =>
        Number(item.id) ===
        Number(id)
    );


  if (indice !== -1) {

    reservas[indice] =
      convertirReservaDesdeSupabase(
        data
      );

  }


  mostrarSemana();

}


/* =========================================================
   DESHACER CHECK-IN
========================================================= */

async function deshacerCheckIn(id) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("reservas")
      .update({
        completada: false
      })
      .eq(
        "id",
        id
      )
      .select()
      .single();


  if (error) {

    mostrarErrorSupabase(
      "No se pudo deshacer el Check-In.",
      error
    );

    return;

  }


  const indice =
    reservas.findIndex(
      item =>
        Number(item.id) ===
        Number(id)
    );


  if (indice !== -1) {

    reservas[indice] =
      convertirReservaDesdeSupabase(
        data
      );

  }


  mostrarSemana();

}


/* =========================================================
   ELIMINAR RESERVA
========================================================= */

async function eliminarReserva(id) {

  const confirmar =
    confirm(
      "¿Quieres eliminar esta reserva?"
    );


  if (!confirmar) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("reservas")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    mostrarErrorSupabase(
      "No se pudo eliminar la reserva.",
      error
    );

    return;

  }


  reservas =
    reservas.filter(
      reserva =>
        Number(reserva.id) !==
        Number(id)
    );


  mostrarSemana();

}


/* =========================================================
   MOSTRAR NOTAS
========================================================= */

function mostrarNotas() {

  const contenedor =
    document.getElementById(
      "notas"
    );


  contenedor.innerHTML =
    "";


  if (
    notas.length === 0
  ) {

    contenedor.innerHTML =
      "<p>No hay notas.</p>";

    return;

  }


  notas.forEach(
    nota => {

      const div =
        document.createElement(
          "div"
        );


      div.className =
        "nota-item";


      div.innerHTML = `

        <span>
          ${escapar(nota.texto)}
        </span>

        <button
          class="btn-rojo"
          onclick="eliminarNota(${nota.id})"
        >
          X
        </button>

      `;


      contenedor.appendChild(
        div
      );

    }
  );

}


/* =========================================================
   AGREGAR NOTA
========================================================= */

async function agregarNota() {

  const texto =
    prompt(
      "Escribe la nota:"
    );


  if (
    !texto ||
    !texto.trim()
  ) {

    return;

  }


  const textoLimpio =
    texto.trim();


  const {
    data,
    error
  } =
    await supabaseClient
      .from("notas")
      .insert({
        texto:
          textoLimpio
      })
      .select()
      .single();


  if (error) {

    mostrarErrorSupabase(
      "No se pudo guardar la nota.",
      error
    );

    return;

  }


  notas.push(
    convertirNotaDesdeSupabase(
      data
    )
  );


  mostrarNotas();

}


/* =========================================================
   ELIMINAR NOTA
========================================================= */

async function eliminarNota(id) {

  const confirmar =
    confirm(
      "¿Eliminar esta nota?"
    );


  if (!confirmar) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("notas")
      .delete()
      .eq(
        "id",
        id
      );


  if (error) {

    mostrarErrorSupabase(
      "No se pudo eliminar la nota.",
      error
    );

    return;

  }


  notas =
    notas.filter(
      nota =>
        Number(nota.id) !==
        Number(id)
    );


  mostrarNotas();

}


/* =========================================================
   SEMANA ANTERIOR
========================================================= */

function irSemanaAnterior() {

  fechaSemana.setDate(
    fechaSemana.getDate() - 7
  );

  mostrarSemana();

}


/* =========================================================
   SEMANA SIGUIENTE
========================================================= */

function irSemanaSiguiente() {

  fechaSemana.setDate(
    fechaSemana.getDate() + 7
  );

  mostrarSemana();

}


/* =========================================================
   SEMANA ACTUAL
========================================================= */

function irHoy() {

  fechaSemana =
    new Date();

  mostrarSemana();

}


/* =========================================================
   CERRAR MODAL AL HACER CLIC AFUERA
========================================================= */

modal.addEventListener(
  "click",
  function(event) {

    if (
      event.target === modal
    ) {

      cerrarModal();

    }

  }
);


/* =========================================================
   EVENTOS
========================================================= */

document
  .getElementById(
    "nuevaReserva"
  )
  .addEventListener(
    "click",
    abrirModal
  );


document
  .getElementById(
    "cerrarModal"
  )
  .addEventListener(
    "click",
    cerrarModal
  );


document
  .getElementById(
    "cancelarReserva"
  )
  .addEventListener(
    "click",
    cerrarModal
  );


document
  .getElementById(
    "guardarReserva"
  )
  .addEventListener(
    "click",
    guardarReserva
  );


document
  .getElementById(
    "nuevaNota"
  )
  .addEventListener(
    "click",
    agregarNota
  );


document
  .getElementById(
    "semanaAnterior"
  )
  .addEventListener(
    "click",
    irSemanaAnterior
  );


document
  .getElementById(
    "semanaSiguiente"
  )
  .addEventListener(
    "click",
    irSemanaSiguiente
  );


document
  .getElementById(
    "hoy"
  )
  .addEventListener(
    "click",
    irHoy
  );


tipoReserva.addEventListener(
  "change",
  actualizarTipo
);


modoHora.addEventListener(
  "change",
  actualizarModoHora
);


/* =========================================================
   INICIAR SISTEMA
========================================================= */

async function iniciarPizarra() {

  mostrarSemana();

  mostrarNotas();


  await migrarLocalStorage();


  await cargarDatos();

}


/* =========================================================
   INICIAR
========================================================= */

iniciarPizarra();