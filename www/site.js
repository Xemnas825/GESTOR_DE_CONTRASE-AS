document.addEventListener('DOMContentLoaded', async () => {
    // Detectar modo: Edición (siteId) o Creación (catId)
    const params = new URLSearchParams(window.location.search);
    const siteId = params.get('siteId');
    const catId = params.get('catId');

    // Referencias al DOM
    const tituloForm = document.getElementById('titulo-form');
    const form = document.getElementById('form-sitio');
    
    const inputNombre = document.getElementById('sitio-nombre');
    const inputUrl = document.getElementById('sitio-url');       // Nuevo referencia
    const inputUsuario = document.getElementById('sitio-usuario');
    const inputPass = document.getElementById('sitio-pass');
    const inputDesc = document.getElementById('sitio-desc');     // Nuevo referencia
    
    const btnGen = document.getElementById('btn-gen');
    const btnToggle = document.getElementById('btn-toggle');
    const btnCancelar = document.getElementById('btn-cancelar');

    // --- Lógica de Inicialización ---
    
    if (siteId) {
        // MODO EDICIÓN
        tituloForm.textContent = 'Editar Sitio';
        await cargarDatosSitio(siteId);
    } else if (catId) {
        // MODO CREACIÓN
        tituloForm.textContent = 'Añadir Nuevo Sitio';
    } else {
        alert("Error: Navegación inválida (faltan parámetros).");
        window.location.href = 'index.html';
        return;
    }

    // --- Funciones ---

    async function cargarDatosSitio(id) {
        // Bloquear UI mientras carga
        document.body.style.opacity = '0.5';
        
        const site = await api.getSite(id);
        
        document.body.style.opacity = '1';

        if (!site) {
            alert("Error al cargar el sitio o no existe.");
            window.location.href = 'index.html';
            return;
        }
        
        // Rellenar formulario con TODOS los campos
        inputNombre.value = site.name || '';
        inputUrl.value = site.url || '';           // Cargar URL
        inputUsuario.value = site.user || '';
        inputPass.value = site.password || '';
        inputDesc.value = site.description || '';  // Cargar Descripción
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
        const url = inputUrl.value.trim();
        const usuario = inputUsuario.value.trim();
        const password = inputPass.value;
        const descripcion = inputDesc.value.trim();

        // Validación simple
        if (password.length < 8) {
            mostrarError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        // Construir objeto con TODOS los campos
        const datosFormulario = {
            name: nombre,
            url: url,              // Guardar URL
            user: usuario,
            password: password,
            description: descripcion // Guardar Descripción
        };

        try {
            if (siteId) {
                // UPDATE (PUT)
                const exito = await api.updateSite(siteId, datosFormulario);
                if (exito) {
                    mostrarNotificacion('Sitio actualizado correctamente.', 'exito');
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    mostrarError('Error al actualizar el sitio.');
                }
            } else {
                // CREATE (POST)
                await api.createSite(catId, datosFormulario);
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error(error);
            mostrarError('Hubo un error de conexión al guardar.');
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

    function mostrarNotificacion(mensaje, tipo) {
        const notif = document.getElementById('modal-notificacion');
        const msgSpan = document.getElementById('mensaje-notificacion');
        
        notif.className = `notificacion ${tipo}`;
        // Estilos específicos si no están en CSS
        if (tipo === 'exito') notif.style.backgroundColor = '#28a745';
        else notif.style.backgroundColor = '#dc3545';
        
        msgSpan.textContent = mensaje;
        notif.style.display = 'block';
        setTimeout(() => notif.style.display = 'none', 3000);
    }
    
    function mostrarError(mensaje) {
        mostrarNotificacion(mensaje, 'error');
    }
});