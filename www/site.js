document.addEventListener('DOMContentLoaded', async () => {
    const api = new ApiClient();
    
    
    const urlParams = new URLSearchParams(window.location.search);
    const sitioId = urlParams.get('id');
    const catId = localStorage.getItem('current_cat_id'); // recuperamos la categoría seleccionada o al menos lo intentamos xd

    
    const titulo = document.getElementById('titulo-form');
    const inputNombre = document.getElementById('sitio-nombre');
    const inputUser = document.getElementById('sitio-usuario');
    const inputPass = document.getElementById('sitio-pass');
    
    // pasamos a editar el sitio o la contraseña o tal,
    if (sitioId) {
        titulo.textContent = "Editar Sitio";
        try {
            const sitio = await api.obtenerSitio(sitioId);
            if(sitio) {
                inputNombre.value = sitio.nombre;
                inputUser.value = sitio.usuario;
                inputPass.value = sitio.pass;
            }
        } catch(e) { console.error(e); }
    }

    // validaciones, como el blur que esto da que puntitos extra :D
    function validar(input) {
        let valido = true;
        const err = input.nextElementSibling; 
        const errPass = input.parentElement.nextElementSibling; 
        const span = err || errPass;

        if(!span) return true;

        input.classList.remove('input-error');
        span.style.display = 'none';

        if(input.required && !input.value.trim()) valido = false;
        if(input.id === 'sitio-pass' && input.value.length < 8) valido = false;

        if(!valido) {
            input.classList.add('input-error');
            span.style.display = 'block';
        }
        return valido;
    }

    [inputNombre, inputUser, inputPass].forEach(el => {
        el.addEventListener('blur', () => validar(el));
    });

    
    document.getElementById('form-sitio').onsubmit = async (e) => {
        e.preventDefault();
        
        const v1 = validar(inputNombre);
        const v2 = validar(inputUser);
        const v3 = validar(inputPass);

        if(!v1 || !v2 || !v3) {
            mostrarNotificacion("Corrige los errores", true);
            return;
        }

        const datos = {
            nombre: inputNombre.value,
            usuario: inputUser.value,
            pass: inputPass.value,
            categoriaId: parseInt(catId) // para asociar el sitio a la categoría seleccionada que si no se lia
        };

        if(sitioId) {
            // actualizar manteniendo la categoría original si no la cambiamos
            await api.actualizarSitio(sitioId, datos);
        } else {
            if(!catId) {
                alert("Error: No hay categoría seleccionada.");
                window.location.href = 'index.html';
                return;
            }
            await api.agregarSitio(datos);
        }

        // volver a la home
        window.location.href = 'index.html';
    };

    // cancelar
    document.getElementById('btn-cancelar').onclick = () => {
        window.location.href = 'index.html';
    };

    // utilidades password
    document.getElementById('btn-toggle').onclick = () => {
        inputPass.type = inputPass.type === 'password' ? 'text' : 'password';
    };

    document.getElementById('btn-gen').onclick = () => {
        const chars = "ABCDEFGHIJKLMabcdefghijklm123456789!@#$%";
        let pass = "";
        for(let i=0; i<10; i++) pass += chars[Math.floor(Math.random()*chars.length)];
        inputPass.value = pass;
        validar(inputPass);
    };
});