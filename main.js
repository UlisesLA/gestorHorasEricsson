// Constantes para obtener elementos del DOM
const projectName = document.getElementById('projectName');
const network = document.getElementById('network');
const activity = document.getElementById('activity');
const hoursWorked = document.getElementById('hoursWorked');
const calendarEl = document.getElementById('calendar');
const fechasP = document.getElementById('fechasDeCorte');
const tableBody = document.getElementById('projectData').getElementsByTagName('tbody')[0];

var calendar; // Variable global para el calendario
var eventos = []; // Arreglo global de eventos
var fechasImportantes = []; // Arreglo global para almacenar fechas importantes

// Inicialización del documento
document.addEventListener('DOMContentLoaded', function() {
    cargarDatosEventos(() => {
        configurarCalendario();
        mostrarFechasCorte();
    });
});

// Función para generar colores aleatorios oscuros
function generarColorAleatorio() {
    const maximo = 200; // Máximo para asegurar colores oscuros
    const generarComponente = () => Math.floor(Math.random() * maximo);

    let rojo, verde, azul, luminosidad;
    do {
        rojo = generarComponente();
        verde = generarComponente();
        azul = generarComponente();
        luminosidad = 0.2126 * rojo + 0.7152 * verde + 0.0722 * azul;
    } while (luminosidad > 160);

    return `#${rojo.toString(16).padStart(2, '0')}${verde.toString(16).padStart(2, '0')}${azul.toString(16).padStart(2, '0')}`;
}

// Función para cargar datos de eventos desde un archivo JSON
function cargarDatosEventos(callback) {
    fetch('eventos.json')
        .then(response => response.ok ? response.json() : Promise.reject('Network response was not ok'))
        .then(eventos => {
            fechasImportantes = eventos;
            callback();
        })
        .catch(error => console.error("Error al cargar el archivo JSON:", error));
}

// Función para obtener y mostrar fechas de corte
function mostrarFechasCorte() {
    const fechasDeCorte = obtenerFechasCorte();
    if (fechasDeCorte.length >= 2) {
        fechasP.textContent = `${fechasDeCorte[0]} hasta el ${fechasDeCorte[1]}`;
    } else if (fechasDeCorte.length === 1) {
        fechasP.textContent = `Fecha de corte del mes pasado: ${fechasDeCorte[0]}`;
    } else {
        fechasP.textContent = 'No se encontraron fechas de corte para los meses actual y anterior.';
    }
}

// Función para obtener fechas de corte
function obtenerFechasCorte() {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    let fechasDeCorte = fechasImportantes.filter(evento => 
        evento.class === 'cierre-de-horas' &&
        new Date(evento.date).getFullYear() === añoActual &&
        (new Date(evento.date).getMonth() === mesActual || new Date(evento.date).getMonth() === mesActual - 1)
    ).sort((a, b) => new Date(a.date) - new Date(b.date));

    return fechasDeCorte.map((evento, index) => {
        const date = new Date(evento.date + 'T00:00:00Z');
        if (index === 0) date.setDate(date.getDate() + 1);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
    });
}

// Función para configurar y renderizar el calendario
function configurarCalendario() {
    let diasEspeciales = {};
    fechasImportantes.forEach(evento => diasEspeciales[evento.date] = evento.class);

    calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid'],
        defaultView: 'dayGridMonth',
        locale: 'es',
        dayRender: function(dayRenderInfo) {
            let fechaStr = dayRenderInfo.date.toISOString().slice(0, 10);
            if (diasEspeciales[fechaStr]) dayRenderInfo.el.classList.add(diasEspeciales[fechaStr]);
            if ([0, 6].includes(dayRenderInfo.date.getDay())) dayRenderInfo.el.classList.add('fin-de-semana');
        }
    });

    calendar.render();
}

// Función para validar el formulario
function validarFormulario() {
    const campos = [projectName, network, activity, hoursWorked];
    const colorInvalido = 'rgb(246, 218, 203)';
    let esValido = true;

    campos.forEach(input => {
        input.style.borderColor = '';
        input.style.background = '';
        if (!input.value.trim() || (input === hoursWorked && parseFloat(input.value) === 0)) {
            input.style.background = colorInvalido;
            esValido = false;
        }
    });

    return esValido;
}

// Función para agregar un nuevo evento
function agregarEvento(color) {
    let nombre = projectName.value;
    let horas = parseFloat(hoursWorked.value);

    let fechaActual = new Date();
    let horasRestantes = horas;
    let horasPorFecha = new Map();

    while (horasRestantes > 0) {
        let fechaStr = fechaActual.toISOString().split('T')[0];

        while ([0, 6].includes(fechaActual.getDay())) {
            fechaActual.setDate(fechaActual.getDate() + 1);
            fechaStr = fechaActual.toISOString().split('T')[0];
        }

        let horasAsignadasHoy = horasPorFecha.get(fechaStr) || 0;
        let horasDisponibles = 8.25 - horasAsignadasHoy;

        if (horasDisponibles > 0) {
            let horasParaEsteDia = Math.min(horasDisponibles, horasRestantes);
            eventos.push({
                title: `${nombre} - ${horasParaEsteDia.toFixed(2)} horas`,
                start: fechaStr,
                end: fechaStr,
                color: color,
                textColor: '#ffffff'
            });

            horasPorFecha.set(fechaStr, horasAsignadasHoy + horasParaEsteDia);
            horasRestantes -= horasParaEsteDia;
        }

        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    if (calendar) {
        calendar.refetchEvents();
    } else {
        console.error('El objeto calendar no está definido.');
    }
}

// Función para actualizar los eventos en el calendario
function actualizarEventos() {
    if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(eventos);
        calendar.refetchEvents();
    }
}

// Función para agregar una nueva fila a la tabla
function agregarNuevaFila(color) {
    const newRow = tableBody.insertRow();
    newRow.style.color = '#fff';
    newRow.style.backgroundColor = color;

    const campos = [projectName.value, network.value, activity.value, hoursWorked.value];
    campos.forEach((valor, index) => newRow.insertCell(index).textContent = valor);
}

// Función para limpiar el formulario
function limpiarFormulario() {
    [projectName, network, activity, hoursWorked].forEach(input => input.value = '');
}

// Función para cargar horas en el calendario y la tabla
function cargarHoras() {
    if (!validarFormulario()) return;

    const colorActividad = generarColorAleatorio();
    agregarNuevaFila(colorActividad);
    agregarEvento(colorActividad);
    actualizarEventos();
    limpiarFormulario();
}
