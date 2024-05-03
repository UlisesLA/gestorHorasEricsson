//Constantes
const projectName = document.getElementById('projectName');
const network = document.getElementById('network');
const activity = document.getElementById('activity');
const hoursWorked = document.getElementById('hoursWorked');

// Calendario
// Supongamos que obtienes datos de evento de alguna parte
var eventos = [];

function agregarEvento(color) {
    let Nombre = document.getElementById('projectName').value;
    let horas = parseFloat(document.getElementById('hoursWorked').value); // Convertir string a float

    console.log(Nombre);
    console.log(horas);

    // Revisar si Nombre está vacío o si horas no es un número
    if (!Nombre || isNaN(horas) || horas <= 0) {
        alert("Por favor, complete correctamente los campos. Asegúrese de ingresar un número válido de horas trabajadas.");
        return;
    }

    let fechaActual = new Date(); // Comenzar desde hoy
    let horasRestantes = horas;

    while (horasRestantes > 0) {
        // Si es sábado o domingo, incrementa la fecha y continúa con el siguiente día.
        while (fechaActual.getDay() === 0 || fechaActual.getDay() === 6) {
            fechaActual.setDate(fechaActual.getDate() + 1);
        }

        let horasParaEsteDia = Math.min(8.25, horasRestantes); // Máximo 8.25 horas por día
        let fechaInicioEvento = new Date(fechaActual); // Clona la fecha actual para el evento
        let fechaFinEvento = new Date(fechaActual); // Establece la misma fecha para eventos de un solo día

        // Crear el evento para el día actual
        eventos.push({
            title: Nombre,
            start: fechaInicioEvento.toISOString().split('T')[0], // Formato yyyy-mm-dd
            end: fechaFinEvento.toISOString().split('T')[0], // Formato yyyy-mm-dd
            color: color,
            textColor: '#ffffff' // Texto blanco para contraste
        });

        // Actualizar horas restantes y fecha para el próximo día laborable
        horasRestantes -= horasParaEsteDia;
        fechaActual.setDate(fechaActual.getDate() + 1);
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
var calendar;

// calendario 
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid'],
        defaultView: 'dayGridMonth',
        locale: 'es',
        events: eventos,
        dayRender: function(dayRenderInfo) {
            if (dayRenderInfo.date.getDay() === 0 || dayRenderInfo.date.getDay() === 6) {
                dayRenderInfo.el.classList.add('fin-de-semana');
            }
        }
    });
    calendar.render();    
});


function actualizarEventos() {
    calendar.removeAllEvents(); // Remueve todos los eventos
    calendar.addEventSource(eventos); // Vuelve a añadir la fuente de eventos actualizada
}



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
    // Generar cada componente de color (RGB) de manera que no sean demasiado claros.
    // Evitamos valores muy altos para no obtener colores pálidos.
    const rojo = Math.floor(Math.random() * 256); // 0 a 255
    const verde = Math.floor(Math.random() * 256); // 0 a 255
    const azul = Math.floor(Math.random() * 256); // 0 a 255

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
    });

    if (!projectName.value.trim()) {
        projectName.style.background = colorInvalido ;
        esValido = false;
    }
    if (!network.value.trim()) {
        network.style.background = colorInvalido ;
        esValido = false;
    }
    if (!activity.value.trim()) {
        activity.style.background = colorInvalido ;
        esValido = false;
    }
    if (!hoursWorked.value.trim()) {
        hoursWorked.style.background = colorInvalido ;
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

