document.addEventListener('DOMContentLoaded', () => {
    // Obtener categoryId de la URL
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('catId');

    if (!categoryId) {
        alert("Error: No se ha especificado una categoría.");
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('form-sitio');
    const inputPass = document.getElementById('sitio-pass');
    const btnGen = document.getElementById('btn-gen');
    const btnToggle = document.getElementById('btn-toggle');
    const btnCancelar = document.getElementById('btn-cancelar');

    // Botón Cancelar
    btnCancelar.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Toggle Ver Contraseña
    btnToggle.addEventListener('click', () => {
        if (inputPass.type === 'password') {
            inputPass.type = 'text';
            btnToggle.textContent = 'Ocultar';
        } else {
            inputPass.type = 'password';
            btnToggle.textContent = 'Ver';
        }
    });

    // Generar Contraseña Segura
    btnGen.addEventListener('click', () => {
        const nuevaPass = generarPasswordSegura();
        inputPass.value = nuevaPass;
        inputPass.type = 'text'; // Mostrarla para que el usuario la vea
        btnToggle.textContent = 'Ocultar';
    });

    // Enviar Formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('sitio-nombre').value.trim();
        const usuario = document.getElementById('sitio-usuario').value.trim();
        const password = inputPass.value;

        // Validaciones Manuales (además del required de HTML)
        if (password.length < 8) {
            mostrarError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        const nuevoSitio = {
            name: nombre,
            user: usuario,
            password: password,
            url: '', // Opcional, no está en el form pero el modelo lo tiene
            description: ''
        };

        try {
            await api.createSite(categoryId, nuevoSitio);
            // Redirigir al home tras éxito
            window.location.href = 'index.html';
        } catch (error) {
            mostrarError('Hubo un error al guardar el sitio.');
        }
    });

    // --- Utilidades ---

    function generarPasswordSegura() {
        const longitud = 8;
        // Incluye mayúsculas, minúsculas, números y símbolos
        const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        let password = "";
        
        // Garantizar al menos un tipo de cada uno (opcional, pero recomendado)
        // Para simplificar y cumplir "no solo alfanuméricos":
        for (let i = 0; i < longitud; i++) {
            const randomIndex = Math.floor(Math.random() * caracteres.length);
            password += caracteres.charAt(randomIndex);
        }
        
        return password;
    }

    function mostrarError(mensaje) {
        const notif = document.getElementById('modal-notificacion');
        const msgSpan = document.getElementById('mensaje-notificacion');
        notif.className = 'notificacion error';
        msgSpan.textContent = mensaje;
        notif.style.display = 'block';
        setTimeout(() => notif.style.display = 'none', 3000);
    }
});