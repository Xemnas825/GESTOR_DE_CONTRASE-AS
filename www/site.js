document.addEventListener('DOMContentLoaded', async () => {
    // Detectar modo: Edición (siteId) o Creación (catId)
    const params = new URLSearchParams(window.location.search);
    const siteId = params.get('siteId');
    const catId = params.get('catId');

    const tituloForm = document.getElementById('titulo-form');
    const form = document.getElementById('form-sitio');
    
    const inputNombre = document.getElementById('sitio-nombre');
    const inputUsuario = document.getElementById('sitio-usuario');
    const inputPass = document.getElementById('sitio-pass');
    
    const btnGen = document.getElementById('btn-gen');
    const btnToggle = document.getElementById('btn-toggle');
    const btnCancelar = document.getElementById('btn-cancelar');

    // Estado local del sitio (para no perder datos como description si no los editamos)
    let currentSiteData = {};

    // --- Lógica de Inicialización ---
    
    if (siteId) {
        // MODO EDICIÓN
        tituloForm.textContent = 'Editar Sitio';
        await cargarDatosSitio(siteId);
    } else if (catId) {
        // MODO CREACIÓN
        tituloForm.textContent = 'Añadir Nuevo Sitio';
    } else {
        alert("Error: Navegación inválida.");
        window.location.href = 'index.html';
        return;
    }

    // --- Funciones ---

    async function cargarDatosSitio(id) {
        const site = await api.getSite(id);
        if (!site) {
            alert("Error al cargar el sitio.");
            window.location.href = 'index.html';
            return;
        }
        
        currentSiteData = site;
        
        // Rellenar formulario
        inputNombre.value = site.name || '';
        inputUsuario.value = site.user || '';
        inputPass.value = site.password || '';
        
        // Si tuvieras campo URL en el HTML, lo rellenarías aquí también
        // Por ejemplo: document.getElementById('sitio-url').value = site.url;
    }

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
        inputPass.type = 'text';
        btnToggle.textContent = 'Ocultar';
    });

    // Enviar Formulario (Guardar/Actualizar)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = inputNombre.value.trim();
        const usuario = inputUsuario.value.trim();
        const password = inputPass.value;

        if (password.length < 8) {
            mostrarError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        const datosFormulario = {
            name: nombre,
            user: usuario,
            password: password,
            // Mantenemos datos antiguos si existen, o vacíos si es nuevo
            url: currentSiteData.url || '', 
            description: currentSiteData.description || ''
        };

        try {
            if (siteId) {
                // UPDATE
                await api.updateSite(siteId, datosFormulario);
                mostrarError('Sitio actualizado correctamente.'); // Reutilizo estilo error/notif
                setTimeout(() => window.location.href = 'index.html', 1000);
            } else {
                // CREATE
                await api.createSite(catId, datosFormulario);
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error(error);
            mostrarError('Hubo un error al guardar.');
        }
    });

    function generarPasswordSegura() {
        const longitud = 12;
        const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        let password = "";
        for (let i = 0; i < longitud; i++) {
            password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
        return password;
    }

    function mostrarError(mensaje) {
        const notif = document.getElementById('modal-notificacion');
        const msgSpan = document.getElementById('mensaje-notificacion');
        // Usamos clase 'error' por defecto para simplicidad, o podrías pasar tipo
        notif.className = 'notificacion error'; 
        notif.style.backgroundColor = '#333'; // Un color neutro para mensajes genéricos
        msgSpan.textContent = mensaje;
        notif.style.display = 'block';
        setTimeout(() => notif.style.display = 'none', 3000);
    }
});