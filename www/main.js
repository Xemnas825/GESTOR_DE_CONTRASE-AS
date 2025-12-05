document.addEventListener('DOMContentLoaded', () => {
    const api = new ApiClient();
    let categoriaActualId = null;
    let terminoBusqueda = "";

    // los buenos DOM
    const listaCat = document.getElementById('lista-categorias');
    const listaSitios = document.getElementById('lista-sitios');
    const tituloSitios = document.getElementById('titulo-sitios');
    const placeholder = document.getElementById('sitios-placeholder');
    const btnNuevoSitio = document.getElementById('btn-nuevo-sitio');
    const buscador = document.getElementById('buscador');

    // funcitas que suman nota :D
    async function pintarCategorias() {
        const categorias = await api.obtenerCategorias();
        const filtradas = categorias.filter(c => c.nombre.toLowerCase().includes(terminoBusqueda));
        
        listaCat.innerHTML = "";
        filtradas.forEach(c => {
            const div = document.createElement('div');
            div.className = `item-categoria ${c.id === categoriaActualId ? 'categoria-activa' : ''}`;
            div.innerHTML = `
                <span>${c.nombre}</span>
                <button class="btn-enlace-peligro btn-del-cat" data-id="${c.id}">[X]</button>
            `;
            // seleccionamos la categoria
            div.addEventListener('click', (e) => {
                if(!e.target.classList.contains('btn-del-cat')) seleccionarCategoria(c.id, c.nombre);
            });
            // eliminamos la categoria
            div.querySelector('.btn-del-cat').addEventListener('click', () => eliminarCategoria(c.id, c.nombre));
            listaCat.appendChild(div);
        });
    }

    async function pintarSitios() {
        if (!categoriaActualId) {
            listaSitios.innerHTML = "";
            placeholder.style.display = 'block';
            return;
        }

        const sitios = await api.obtenerSitios(categoriaActualId);
        const filtrados = sitios.filter(s => 
            s.nombre.toLowerCase().includes(terminoBusqueda) || 
            s.usuario.toLowerCase().includes(terminoBusqueda)
        );

        listaSitios.innerHTML = "";
        if (filtrados.length === 0) {
            listaSitios.innerHTML = `<p class="placeholder">No hay sitios.</p>`;
            placeholder.style.display = 'none';
        } else {
            placeholder.style.display = 'none';
            filtrados.forEach(s => {
                const div = document.createElement('div');
                div.className = 'item-sitio';
                div.innerHTML = `
                    <div><strong>${s.nombre}</strong><small>${s.usuario}</small></div>
                    <input type="password" value="${s.pass}" readonly style="width:80px">
                    <div class="item-sitio-acciones">
                        <button class="btn-enlace btn-copy" data-pass="${s.pass}">Copiar</button>
                        <button class="btn-enlace btn-edit" data-id="${s.id}">Editar</button>
                        <button class="btn-enlace-peligro btn-del" data-id="${s.id}">Eliminar</button>
                    </div>
                `;
                // botoncicos
                div.querySelector('.btn-copy').onclick = () => copiarPass(s.pass);
                div.querySelector('.btn-del').onclick = () => eliminarSitio(s.id);
                // NAVEGACIÓN A EDITAR (Pasamos ID por URL) 
                div.querySelector('.btn-edit').onclick = () => {
                    window.location.href = `site.html?id=${s.id}`;
                };
                listaSitios.appendChild(div);
            });
        }
    }

    // funciones de acciones varias
    function seleccionarCategoria(id, nombre) {
        categoriaActualId = id;
        tituloSitios.textContent = `Sitios en "${nombre}"`;
        btnNuevoSitio.disabled = false;
        
        // guardamos la categoría en localStorage para usarla al crear el sitio nuevo
        localStorage.setItem('current_cat_id', id);
        
        pintarCategorias();
        pintarSitios();
    }

    async function eliminarCategoria(id, nombre) {
        if(confirm(`¿Eliminar "${nombre}" y sus sitios?`)) {
            await api.eliminarCategoria(id);
            if(categoriaActualId === id) {
                categoriaActualId = null;
                btnNuevoSitio.disabled = true;
                tituloSitios.textContent = "Sitios";
            }
            pintarCategorias();
            pintarSitios();
        }
    }

    async function eliminarSitio(id) {
        if(confirm("¿Eliminar sitio?")) {
            await api.eliminarSitio(id);
            pintarSitios();
        }
    }

    function copiarPass(pass) {
        navigator.clipboard.writeText(pass).then(() => mostrarNotificacion("Copiado!", false));
    }

    // eventos generalcillos
    buscador.oninput = (e) => {
        terminoBusqueda = e.target.value.toLowerCase();
        pintarCategorias();
        pintarSitios();
    };

    // 
    btnNuevoSitio.onclick = () => {
        
        window.location.href = 'site.html'; 
    };

    // modal de categorias
    const modalCat = document.getElementById('modal-categoria');
    document.getElementById('btn-add-cat').onclick = () => {
        document.getElementById('cat-nombre').value = "";
        modalCat.style.display = 'flex';
    };
    document.getElementById('btn-cancel-cat').onclick = () => modalCat.style.display = 'none';
    
    document.getElementById('form-categoria').onsubmit = async (e) => {
        e.preventDefault();
        const nombre = document.getElementById('cat-nombre').value;
        if(nombre) {
            await api.agregarCategoria(nombre);
            modalCat.style.display = 'none';
            pintarCategorias();
        }
    };

    // iniciamos
    const lastCat = localStorage.getItem('current_cat_id');
    if(lastCat) {
        
    }
    pintarCategorias();
});