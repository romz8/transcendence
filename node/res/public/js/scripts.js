
function test() {
    console.log("HIHIHIHIHI");
}

function getVars(){
    var inEmail = document.getElementById("email")
    var inName = document.getElementById("name")
    var inPass = document.getElementById("pass")

    var jsonDone = ({"user": inName.value})
    jsonDone["mail"] = inEmail.value
    jsonDone["psw"] = inPass.value
    jsonDone = 123
    jsonDone = "asdfasdfasdf"
    return jsonDone
}

function sendToBackend() {
    fetch('http://localhost:8080/enviar-mensaje/', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(getVars())
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => console.log(JSON.stringify(data)))
    .catch(error => console.error('There has been a problem with your fetch operation:', error));
}

window.addEventListener('DOMContentLoaded', event => {

    // Obtener referencia al formulario y al botón
    var formulario = document.getElementById("contactForm");
    var botonEnviar = document.getElementById("btn-testing");

    botonEnviar.disabled = true;
    // Agregar un event listener para detectar cambios en el formulario
    if (formulario)
        formulario.addEventListener("input", validarCampos);

    // Función para validar los campos y habilitar/deshabilitar el botón
    function validarCampos() {
        var camposLlenos = true;

        // Recorrer todos los campos del formulario
        for (var i = 0; i < formulario.elements.length; i++) {
            var campo = formulario.elements[i];

            // Verificar si el campo es un input y está vacío
            if (campo.tagName.toLowerCase() === "input" && campo.value.trim() === "") {
                camposLlenos = false;
                break; // Salir del bucle si se encuentra un campo vacío
            }
        }

        // Habilitar o deshabilitar el botón según los campos estén llenos o no
        botonEnviar.disabled = !camposLlenos;
    }
    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }
    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    //  Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});
