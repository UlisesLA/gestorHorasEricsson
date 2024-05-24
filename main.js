//Constantes
const projectName = document.getElementById('projectName');
const network = document.getElementById('network');
const activity = document.getElementById('activity');
const hoursWorked = document.getElementById('hoursWorked');

// Calendario
var calendar; // Variable global para el calendario
var eventos = []; // Arreglo global de eventos

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var diasEspeciales = {};

    // Cargar eventos desde JSON y almacenar en un objeto para acceso rápido
    fetch('eventos.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(evento => {
                diasEspeciales[evento.date] = evento.class; // Clasifica los días especiales
            });

            // Inicializa el calendario con configuraciones apropiadas
            calendar = new FullCalendar.Calendar(calendarEl, {
                plugins: ['dayGrid'],
                defaultView: 'dayGridMonth',
                locale: 'es',
                events: eventos, // Utiliza eventos locales

                dayRender: function(dayRenderInfo) {
                    var fechaStr = dayRenderInfo.date.toISOString().slice(0, 10); // Formato yyyy-mm-dd
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
        })
        .catch(error => console.error('Error al cargar los eventos desde JSON:', error));
});

function actualizarEventos() {
    if (calendar) { // Verifica que calendar esté definido
        calendar.removeAllEvents(); // Elimina todos los eventos
        calendar.addEventSource(eventos); // Añade la fuente de eventos actualizada
        calendar.refetchEvents(); // Solicita al calendario que vuelva a buscar eventos
    }
}


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


// Definimos 'calendar' en un alcance más amplio






//Fecha de corte
function obtenerFechas() {
    var fechaInicio = document.getElementById('fechaInicio').value;
    var fechaFin = document.getElementById('fechaFin').value;

    // Convertir las fechas a objetos Date para comparar
    var inicio = new Date(fechaInicio);
    var fin = new Date(fechaFin);

    // Validar que la fecha de inicio no sea posterior a la fecha de fin
    if (inicio > fin) {
        alert('La fecha de fin no puede ser anterior a la fecha de inicio.');
        return; // Detener la función si la validación falla
    }       

    return { inicio: fechaInicio, fin: fechaFin };
}

//Colores Aleatoreos
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



// validar horas 

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


// Función para simular la carga de horas
function cargarHoras() {   
    let colorActividad = generarColorAleatorio();

    if (!validarFormulario()) {
       // alert('Por favor, completa todos los campos.');
        return; // No seguir adelante si la validación falla
    }

    const table = document.getElementById('projectData').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    // Establecer el fondo de la nueva fila a color naranja
    newRow.style.color = '#fff';
    newRow.style.backgroundColor = colorActividad; // Color aleatoreo

    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);

    cell1.textContent = document.getElementById('projectName').value;
    cell2.textContent = document.getElementById('network').value;
    cell3.textContent = document.getElementById('activity').value;
    cell4.textContent = document.getElementById('hoursWorked').value;

    agregarEvento(colorActividad);
    actualizarEventos();

    // Opcional: limpiar el formulario después de la carga
    document.getElementById('projectName').value = '';
    document.getElementById('network').value = '';
    document.getElementById('activity').value = '';
    document.getElementById('hoursWorked').value = '';
}

