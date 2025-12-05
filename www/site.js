document.addEventListener('DOMContentLoaded', async () => {

    const params = new URLSearchParams(window.location.search);
    const siteId = params.get('siteId');
    const catId = params.get('catId');


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


    let currentSiteData = {};


    const configValidaciones = [
        {
            input: inputNombre,
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
            errorSpan: inputPass.closest('.form-grupo').querySelector('.mensaje-error'),
            regla: (val) => val.length >= 8
        }
    ];

    configValidaciones.forEach(conf => {
        if (!conf.input || !conf.errorSpan) return;

        conf.input.addEventListener('blur', () => {
            validarCampo(conf);
        });

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


        inputPass.dispatchEvent(new Event('input'));
    });


    form.addEventListener('submit', async (e) => {
        e.preventDefault();


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