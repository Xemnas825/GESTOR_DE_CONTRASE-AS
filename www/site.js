document.addEventListener('DOMContentLoaded', async () => {
    // Detectar modo: Edición (siteId) o Creación (catId)
    const params = new URLSearchParams(window.location.search);
    const siteId = params.get('siteId');
    const catId = params.get('catId');

    // Referencias al DOM
    const tituloForm = document.getElementById('titulo-form');
    const form = document.getElementById('form-sitio');
    
    const inputNombre = document.getElementById('sitio-nombre');
    const inputUrl = document.getElementById('sitio-url');
    const inputUsuario = document.getElementById('sitio-usuario');
    const inputPass = document.getElementById('sitio-pass');
    const inputDesc = document.getElementById('sitio-desc');
    
    const btnGen = document.getElementById('btn-gen');
    const btnToggle = document.getElementById('btn-toggle');
    const btnCancelar = document.getElementById('btn-cancelar');

    // Estado local del sitio
    let currentSiteData = {};

    // --- CONFIGURACIÓN DE VALIDACIONES ---
    // Definimos qué inputs validar, cómo encontrar su mensaje de error y cuál es la regla
    const configValidaciones = [
        {
            input: inputNombre,
            // El span está justo después del input
            errorSpan: inputNombre.nextElementSibling, 
            regla: (val) => val.trim().length > 0
        },
        {
            input: inputUsuario,
            errorSpan: inputUsuario.nextElementSibling,
            regla: (val) => val.trim().length > 0
        },
        {
            input: inputPass,
            // El span está fuera del wrapper .pass-wrapper
            errorSpan: inputPass.closest('.form-grupo').querySelector('.mensaje-error'),
            regla: (val) => val.length >= 8
        }
    ];

    // Inicializar listeners de validación (Blur y Input)
    configValidaciones.forEach(conf => {
        if (!conf.input || !conf.errorSpan) return;

        // 1. Al abandonar el campo (Blur): Validar y marcar error si falla
        conf.input.addEventListener('blur', () => {
            validarCampo(conf);
        });

        // 2. Al escribir (Input): Limpiar error si el usuario empieza a corregir
        conf.input.addEventListener('input', () => {
            if (conf.input.classList.contains('input-error')) {
                conf.input.classList.remove('input-error');
                conf.errorSpan.style.display = 'none';
            }
        });
    });

    function validarCampo(conf) {
        const esValido = conf.regla(conf.input.value);
        if (!esValido) {
            conf.input.classList.add('input-error');
            conf.errorSpan.style.display = 'block';
        } else {
            conf.input.classList.remove('input-error');
            conf.errorSpan.style.display = 'none';
        }
        return esValido;
    }

    // --- Lógica de Inicialización ---
    
    if (siteId) {
        tituloForm.textContent = 'Editar Sitio';
        await cargarDatosSitio(siteId);
    } else if (catId) {
        tituloForm.textContent = 'Añadir Nuevo Sitio';
    } else {
        alert("Error: Navegación inválida.");
        window.location.href = 'index.html';
        return;
    }

    // --- Funciones Principales ---

    async function cargarDatosSitio(id) {
        document.body.style.opacity = '0.5';
        const site = await api.getSite(id);
        document.body.style.opacity = '1';

        if (!site) {
            alert("Error al cargar el sitio.");
            window.location.href = 'index.html';
            return;
        }
        
        currentSiteData = site;
        
        inputNombre.value = site.name || '';
        inputUrl.value = site.url || '';
        inputUsuario.value = site.user || '';
        inputPass.value = site.password || '';
        inputDesc.value = site.description || '';
    }

    btnCancelar.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    btnToggle.addEventListener('click', () => {
        if (inputPass.type === 'password') {
            inputPass.type = 'text';
            btnToggle.textContent = 'Ocultar';
        } else {
            inputPass.type = 'password';
            btnToggle.textContent = 'Ver';
        }
    });

    btnGen.addEventListener('click', () => {
        const nuevaPass = generarPasswordSegura();
        inputPass.value = nuevaPass;
        inputPass.type = 'text';
        btnToggle.textContent = 'Ocultar';
        
        // Disparar evento input para limpiar errores si los había
        inputPass.dispatchEvent(new Event('input'));
    });

    // Enviar Formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // VALIDACIÓN FINAL: Ejecutar todas las reglas antes de enviar
        let formularioValido = true;
        configValidaciones.forEach(conf => {
            if (!validarCampo(conf)) {
                formularioValido = false;
            }
        });

        if (!formularioValido) {
            mostrarError('Por favor, corrige los campos marcados en rojo.');
            return;
        }

        const datosFormulario = {
            name: inputNombre.value.trim(),
            url: inputUrl.value.trim(),
            user: inputUsuario.value.trim(),
            password: inputPass.value,
            description: inputDesc.value.trim()
        };

        try {
            if (siteId) {
                const exito = await api.updateSite(siteId, datosFormulario);
                if (exito) {
                    mostrarNotificacion('Sitio actualizado correctamente.', 'exito');
                    setTimeout(() => window.location.href = 'index.html', 1000);
                } else {
                    mostrarError('Error al actualizar el sitio.');
                }
            } else {
                await api.createSite(catId, datosFormulario);
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error(error);
            mostrarError('Hubo un error de conexión.');
        }
    });

    // --- Utilidades ---

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