/**
 * Script principal para la página de contacto de Bike Store
 * Este archivo contiene la lógica de validación y animación del formulario
 */

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const contactContainer = document.querySelector('.contact-container');
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    // Animar la entrada del contenedor al cargar la página
    setTimeout(() => {
        contactContainer.classList.add('show');
    }, 100);

    /**
     * Función para validar formato de correo electrónico
     * @param {string} email - El correo electrónico a validar
     * @return {boolean} - Verdadero si el correo es válido, falso si no
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Función para mostrar mensaje de error en un campo
     * @param {HTMLElement} input - El elemento de entrada con error
     * @param {HTMLElement} errorElement - El elemento que muestra el mensaje de error
     * @param {string} message - El mensaje de error a mostrar
     */
    function showError(input, errorElement, message) {
        input.style.borderColor = 'var(--error-color)';
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    /**
     * Función para ocultar mensaje de error
     * @param {HTMLElement} input - El elemento de entrada
     * @param {HTMLElement} errorElement - El elemento que muestra el mensaje de error
     */
    function hideError(input, errorElement) {
        input.style.borderColor = '#ddd';
        errorElement.style.display = 'none';
    }

    /**
     * Función para mostrar un mensaje de éxito emergente
     * @param {string} message - El mensaje a mostrar
     */
    function showSuccessToast(message) {
        // Crear el elemento del toast
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.textContent = message;
        
        // Estilizar el toast
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = '#4CAF50';
        toast.style.color = 'white';
        toast.style.padding = '16px 32px';
        toast.style.borderRadius = '8px';
        toast.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
        toast.style.zIndex = '9999';
        toast.style.textAlign = 'center';
        toast.style.fontWeight = '500';
        toast.style.fontSize = '16px';
        toast.style.minWidth = '300px';
        toast.style.maxWidth = '90%';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        
        // Añadir el toast al cuerpo del documento
        document.body.appendChild(toast);
        
        // Hacer visible el toast con una pequeña animación
        setTimeout(() => {
            toast.style.opacity = '1';
        }, 100);
        
        // Eliminar el toast después de 5 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 500);
        }, 5000);
    }

    /**
     * Función para restablecer todos los campos del formulario
     */
    function resetFormFields() {
        // Ocultar todos los mensajes de error
        hideError(nameInput, nameError);
        hideError(emailInput, emailError);
        hideError(messageInput, messageError);
        
        // Limpiar los valores de los campos
        contactForm.reset();
    }

    // Validación en tiempo real para el campo de nombre
    nameInput.addEventListener('input', function() {
        if (nameInput.value.trim() !== '') {
            hideError(nameInput, nameError);
        }
    });

    // Validación en tiempo real para el campo de correo electrónico
    emailInput.addEventListener('input', function() {
        if (isValidEmail(emailInput.value)) {
            hideError(emailInput, emailError);
        }
    });

    // Validación en tiempo real para el campo de mensaje
    messageInput.addEventListener('input', function() {
        if (messageInput.value.trim() !== '') {
            hideError(messageInput, messageError);
        }
    });

    // Manejador del evento de envío del formulario
    contactForm.addEventListener('submit', function(e) {
        // Prevenir el comportamiento por defecto del formulario
        e.preventDefault();
        let formValid = true;

        // Validación del nombre
        if (nameInput.value.trim() === '') {
            showError(nameInput, nameError, 'Por favor ingresa tu nombre completo');
            formValid = false;
        } else {
            hideError(nameInput, nameError);
        }

        // Validación del correo electrónico
        if (!isValidEmail(emailInput.value)) {
            showError(emailInput, emailError, 'Por favor ingresa un correo electrónico válido');
            formValid = false;
        } else {
            hideError(emailInput, emailError);
        }

        // Validación del mensaje
        if (messageInput.value.trim() === '') {
            showError(messageInput, messageError, 'Por favor ingresa tu mensaje');
            formValid = false;
        } else {
            hideError(messageInput, messageError);
        }

        // Si todos los campos son válidos, proceder con el envío
        if (formValid) {
            console.log("Formulario válido, mostrando mensaje de éxito");
            
            // Obtener el nombre del usuario para personalizar el mensaje
            const userName = nameInput.value.split(' ')[0]; // Obtener el primer nombre
            
            // Mostrar mensaje de éxito
            showSuccessToast(`¡Gracias ${userName}! Tu mensaje ha sido enviado con éxito. Nos pondremos en contacto contigo pronto.`);
            
            // Restablecer el formulario
            resetFormFields();
        }
    });
});