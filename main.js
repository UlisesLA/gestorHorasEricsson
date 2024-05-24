//Constantes
const projectName = document.getElementById('projectName');
const network = document.getElementById('network');
const activity = document.getElementById('activity');
const hoursWorked = document.getElementById('hoursWorked');

// Calendario
var calendar; // Variable global para el calendario
var eventos = []; // Arreglo global de eventos

//Genra los colores aleatoreos para los eventos
function generarColorAleatorio() {
    // Definir un máximo para cada componente para evitar colores demasiado claros.
    // Establecer un límite superior para cada componente RGB para garantizar colores más oscuros
    const maximo = 200;  // Un valor menor a 255 asegura que los colores no sean demasiado claros
    const rojo = Math.floor(Math.random() * maximo); // 0 a 199
    const verde = Math.floor(Math.random() * maximo); // 0 a 199
    const azul = Math.floor(Math.random() * maximo); // 0 a 199

    // Comprobar la luminosidad para asegurar que el color no es demasiado claro
    const luminosidad = 0.2126 * rojo + 0.7152 * verde + 0.0722 * azul; // Fórmula aproximada de luminosidad
    if (luminosidad > 160) { // Si es demasiado claro, recalcular los componentes
        return generarColorAleatorio();
    }

    // Convertir los componentes en una cadena hexadecimal
    const colorHex = `#${rojo.toString(16).padStart(2, '0')}${verde.toString(16).padStart(2, '0')}${azul.toString(16).padStart(2, '0')}`;
    return colorHex;
}

//leer el Json
//var fechasImportantes = []; // Variable global para almacenar las fechas importantes

function cargarDatosEventos(callback) {
    fetch('eventos.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(eventos => {
            fechasImportantes = eventos;
            //console.log("Datos cargados del archivo JSON y almacenados en 'fechasImportantes':", fechasImportantes);
            if (typeof callback === 'function') {  // Asegúrate de que callback es una función
                callback();  // Ejecuta la función callback sin pasar los eventos
            } else {
                console.error('Error: callback is not a function');
            }
        })
        .catch(error => {
            console.error("Error al cargar el archivo JSON:", error);
        });
}


//Fecha de corte
function obtenerFechasCorte() {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    let fechasDeCorte = fechasImportantes.filter(evento => 
        evento.class === 'cierre-de-horas' &&
        new Date(evento.date).getFullYear() === añoActual &&
        (new Date(evento.date).getMonth() === mesActual || new Date(evento.date).getMonth() === mesActual - 1)
    );

    
    // Ordenar las fechas para asegurarnos de que estén en orden cronológico
    fechasDeCorte.sort((a, b) => new Date(a.date) - new Date(b.date));
    

    // Extraer y formatear las fechas del mes actual y del mes anterior
    const resultado = fechasDeCorte.map((evento, index) => {
        // Crear la fecha y ajustarla a UTC para evitar problemas de zona horaria.
        const date = new Date(evento.date + 'T00:00:00Z');
    
        // Si es el primer elemento, adelantamos un día.
        if (index === 0) {
            date.setDate(date.getDate() + 1); // Añade un día al primer elemento.
        }

        // Convertir la fecha ajustada a formato local con la zona horaria UTC.
        return date.toLocaleDateString('en-GB', {
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',  // Cambiado de '2-digit' a 'numeric' para mostrar el año completo
            timeZone: 'UTC'
        });
                
    });  

    // Imprimir las fechas en un elemento <p> con el ID 'fechasDeCorte'
    const fechasP = document.getElementById('fechasDeCorte');

    if (resultado.length >= 2) {
        fechasP.textContent = `${resultado[0]} hasta el ${resultado[1]}`;
    } else if (resultado.length === 1) {
        fechasP.textContent = `Fecha de corte del mes pasado: ${resultado[0]}`;
    } else {
        fechasP.textContent = 'No se encontraron fechas de corte para los meses actual y anterior.';
    }

    return resultado;
}

document.addEventListener('DOMContentLoaded', function() {
    cargarDatosEventos(() => {
        const fechasDeCorte = obtenerFechasCorte();
        console.log('Fechas de corte:', fechasDeCorte);
    });
});


// Función que se llamará tras cargar los datos
function configurarCalendario() {
    var calendarEl = document.getElementById('calendar');
    var diasEspeciales = {};

    fechasImportantes.forEach(evento => {
        diasEspeciales[evento.date] = evento.class; // Clasifica los días especiales
    });

    // Inicializa el calendario con configuraciones apropiadas
    calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid'],
        defaultView: 'dayGridMonth',
        locale: 'es',

        dayRender: function(dayRenderInfo) {
            var fechaStr = dayRenderInfo.date.toISOString().slice(0, 10);
            if (diasEspeciales[fechaStr] === 'dia-festivo') {
                dayRenderInfo.el.classList.add('dia-festivo');
            } else if (diasEspeciales[fechaStr] === 'cierre-de-horas') {
                dayRenderInfo.el.classList.add('cierre-de-horas');
            }

            // Agregar clase a los fines de semana
            if (dayRenderInfo.date.getDay() === 0 || dayRenderInfo.date.getDay() === 6) {
                dayRenderInfo.el.classList.add('fin-de-semana');
            }
        }
    });

    calendar.render(); // Renderiza el calendario
}

document.addEventListener('DOMContentLoaded', function() {
    cargarDatosEventos(configurarCalendario); // Asegúrate de que configurarCalendario es una función definida
});


// Supongamos que obtienes datos de evento de alguna parte
function agregarEvento(color) {
    let Nombre = document.getElementById('projectName').value;
    let horas = parseFloat(document.getElementById('hoursWorked').value); // Convertir string a float  

    let fechaActual = new Date(); // Comenzar desde hoy
    let horasRestantes = horas;
    let horasPorFecha = new Map(); // Mapa para seguir las horas por fecha

    while (horasRestantes > 0) {
        let fechaStr = fechaActual.toISOString().split('T')[0]; // Formato yyyy-mm-dd

        // Si es sábado o domingo, incrementa la fecha y continúa con el siguiente día.
        while (fechaActual.getDay() === 0 || fechaActual.getDay() === 6) {
            fechaActual.setDate(fechaActual.getDate() + 1);
            fechaStr = fechaActual.toISOString().split('T')[0];
        }

        let horasAsignadasHoy = horasPorFecha.get(fechaStr) || 0; // Obtener las horas ya asignadas a esta fecha
        let horasDisponibles = 8.25 - horasAsignadasHoy; // Calcular las horas disponibles para este día

        if (horasDisponibles > 0) {
            let horasParaEsteDia = Math.min(horasDisponibles, horasRestantes);
            let fechaInicioEvento = new Date(fechaActual);
            let fechaFinEvento = new Date(fechaActual);

            // Crear el evento para el día actual
            eventos.push({
                title: `${Nombre} - ${horasParaEsteDia.toFixed(2)} horas`,
                start: fechaInicioEvento.toISOString().split('T')[0],
                end: fechaFinEvento.toISOString().split('T')[0],
                color: color,
                textColor: '#ffffff'
            });

            // Actualizar el mapa de horas por fecha
            horasPorFecha.set(fechaStr, horasAsignadasHoy + horasParaEsteDia);
            horasRestantes -= horasParaEsteDia;
        }

        fechaActual.setDate(fechaActual.getDate() + 1); // Pasar al siguiente día
    }

    // Refrescar los eventos en el calendario
    if (calendar) {
        calendar.refetchEvents();
    } else {
        console.error('El objeto calendar no está definido.');
    }

    console.log(eventos); // Mostrar eventos para depuración
}


//Validamos que el formulario este llenado de manera correcta para cargar horas
function validarFormulario() {
    const colorInvalido = 'rgb(246, 218, 203)';
    let esValido = true;

    // Reiniciar colores a estado original
    [projectName, network, activity, hoursWorked].forEach(input => {
        input.style.borderColor = '';
        input.style.background = ''; // Asegurar que el fondo también se reinicie
    });

    if (!projectName.value.trim()) {
        projectName.style.background = colorInvalido;
        esValido = false;
    }
    if (!network.value.trim()) {
        network.style.background = colorInvalido;
        esValido = false;
    }
    if (!activity.value.trim()) {
        activity.style.background = colorInvalido;
        esValido = false;
    }
    if (!hoursWorked.value.trim() || parseFloat(hoursWorked.value) === 0) {
        hoursWorked.style.background = colorInvalido;
        esValido = false;
    }
    return esValido;
}

//Hace que cuando carguemos nuevos eventos limpie el calendario y actulice con los nuevos
function actualizarEventos() {
    if (calendar) { // Verifica que calendar esté definido
        calendar.removeAllEvents(); // Elimina todos los eventos
        calendar.addEventSource(eventos); // Añade la fuente de eventos actualizada
        calendar.refetchEvents(); // Solicita al calendario que vuelva a buscar eventos
    }
}

//Cargamos las horas en el calendario y en la tabla de informacion
function cargarHoras() {
    if (!validarFormulario()) {
        return;  // No se agregan las horas si el formulario no está bien llenado
    }

    const colorActividad = generarColorAleatorio();    
    agregarNuevaFila(colorActividad);
    agregarEvento(colorActividad);
    actualizarEventos();
    limpiarFormulario();
}

//Agrega una nueva fila a la tabla de horas
function agregarNuevaFila(color) {
    const tableBody = document.getElementById('projectData').getElementsByTagName('tbody')[0];
    const newRow = tableBody.insertRow();
    newRow.style.color = '#fff';  // Establece el color de texto a blanco
    newRow.style.backgroundColor = color;  // Color generado aleatoriamente

    // Asignación de valores a cada celda de la nueva fila
    const fields = ['projectName', 'network', 'activity', 'hoursWorked'];
    fields.forEach((fieldId, index) => {
        const cell = newRow.insertCell(index);
        cell.textContent = document.getElementById(fieldId).value;
    });
}

//Limpia el formulario de cargado de horas
function limpiarFormulario() {
    // Limpia los campos del formulario después de agregar las horas
    ['projectName', 'network', 'activity', 'hoursWorked'].forEach(id => {
        document.getElementById(id).value = '';
    });
}


