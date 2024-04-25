const projectName = document.getElementById('projectName');
const network = document.getElementById('network');
const activity = document.getElementById('activity');
const hoursWorked = document.getElementById('hoursWorked');


// Calendario

document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        plugins: ['dayGrid'],
        defaultView: 'dayGridMonth',
        locale: 'es'  // Establecer el idioma español
    });
    calendar.render();
});

//Ulibuli
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
    
    if (!validarFormulario()) {
       //    alert('Por favor, completa todos los campos.');
        return; // No seguir adelante si la validación falla
    }

    const table = document.getElementById('projectData').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);

    cell1.textContent = projectName.value;
    cell2.textContent = network.value;
    cell3.textContent = activity.value;
    cell4.textContent = hoursWorked.value;

    // Opcional: limpiar el formulario después de la carga
    document.getElementById('projectName').value = '';
    document.getElementById('network').value = '';
    document.getElementById('activity').value = '';
    document.getElementById('hoursWorked').value = '';
}
