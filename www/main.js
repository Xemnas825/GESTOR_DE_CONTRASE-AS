document.addEventListener('DOMContentLoaded', () => {
    let currentCategoryId = null;
    let allCategories = [];
    let currentSites = [];

    const listaCategorias = document.getElementById('lista-categorias');
    const listaSitios = document.getElementById('lista-sitios');
    const tituloSitios = document.getElementById('titulo-sitios');
    const btnNuevoSitio = document.getElementById('btn-nuevo-sitio');
    const buscador = document.getElementById('buscador');

    const modalCategoria = document.getElementById('modal-categoria');
    const btnAddCat = document.getElementById('btn-add-cat');
    const btnCancelCat = document.getElementById('btn-cancel-cat');
    const formCategoria = document.getElementById('form-categoria');
    const inputCatNombre = document.getElementById('cat-nombre');

    const errorSpanCat = inputCatNombre.nextElementSibling;

    inputCatNombre.addEventListener('blur', () => {
        validarNombreCategoria();
    });

    inputCatNombre.addEventListener('input', () => {
        if (inputCatNombre.classList.contains('input-error')) {
            inputCatNombre.classList.remove('input-error');
            errorSpanCat.style.display = 'none';
        }
    });

    function validarNombreCategoria() {
        const valor = inputCatNombre.value.trim();
        if (valor.length === 0) {
            inputCatNombre.classList.add('input-error');
            errorSpanCat.style.display = 'block';
            return false;
        }
        inputCatNombre.classList.remove('input-error');
        errorSpanCat.style.display = 'none';
        return true;
    }

    loadCategories();


    btnAddCat.addEventListener('click', () => {
        modalCategoria.style.display = 'flex';
        inputCatNombre.value = '';
        inputCatNombre.classList.remove('input-error');
        errorSpanCat.style.display = 'none';
        inputCatNombre.focus();
    });

    btnCancelCat.addEventListener('click', () => {
        modalCategoria.style.display = 'none';
    });

    formCategoria.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validarNombreCategoria()) {
            return;
        }

        const nombre = inputCatNombre.value.trim();

        try {
            await api.createCategory(nombre);
            modalCategoria.style.display = 'none';
            mostrarNotificacion('Categoría creada con éxito', 'exito');
            loadCategories();
        } catch (error) {
            mostrarNotificacion('Error al crear categoría', 'error');
        }
    });

    btnNuevoSitio.addEventListener('click', () => {
        if (currentCategoryId) {
            window.location.href = `site.html?catId=${currentCategoryId}`;
        }
    });

    buscador.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        filtrarInterfaz(query);
    });


    async function loadCategories() {
        allCategories = await api.getCategories();
        renderCategories(allCategories);
    }

    function renderCategories(categories) {
        listaCategorias.innerHTML = '';

        categories.forEach(cat => {
            const div = document.createElement('div');
            div.className = `item-categoria ${currentCategoryId === cat.id ? 'categoria-activa' : ''}`;
            div.dataset.id = cat.id;

            div.innerHTML = `
                <span>${cat.name}</span>
                <button class="btn-enlace-peligro delete-cat-btn" title="Eliminar">&times;</button>
            `;

            div.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-cat-btn')) return;
                selectCategory(cat.id, cat.name);
            });

            const btnDelete = div.querySelector('.delete-cat-btn');
            btnDelete.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`¿Eliminar la categoría "${cat.name}" y todos sus sitios?`)) {
                    const success = await api.deleteCategory(cat.id);
                    if (success) {
                        mostrarNotificacion('Categoría eliminada', 'exito');
                        if (currentCategoryId === cat.id) {
                            resetSitesPanel();
                        }
                        loadCategories();
                    } else {
                        mostrarNotificacion('Error al eliminar', 'error');
                    }
                }
            });

            listaCategorias.appendChild(div);
        });
    }

    async function selectCategory(id, name) {
        currentCategoryId = id;
        tituloSitios.textContent = `Sitios de: ${name}`;
        btnNuevoSitio.disabled = false;

        document.querySelectorAll('.item-categoria').forEach(el => {
            if (parseInt(el.dataset.id) === id) el.classList.add('categoria-activa');
            else el.classList.remove('categoria-activa');
        });

        listaSitios.innerHTML = '<p class="placeholder">Cargando...</p>';
        const data = await api.getCategoryDetails(id);

        if (data && data.sites) {
            currentSites = data.sites;
            renderSites(currentSites);
        } else {
            currentSites = [];
            listaSitios.innerHTML = '<p class="placeholder">No se encontraron sitios.</p>';
        }
    }

    function renderSites(sites) {
        listaSitios.innerHTML = '';

        if (sites.length === 0) {
            listaSitios.innerHTML = '<p class="placeholder">No hay sitios en esta categoría.</p>';
            return;
        }

        sites.forEach(site => {
            const div = document.createElement('div');
            div.className = 'item-sitio';

            let safeUrl = site.url || '#';
            if (safeUrl !== '#' && !safeUrl.startsWith('http')) {
                safeUrl = 'https://' + safeUrl;
            }

            div.innerHTML = `
                <div class="site-info">
                    <strong>${site.name}</strong><br>
                    <small style="color: #666;">${site.url || 'Sin URL'}</small>
                </div>
                <div class="site-creds">
                    👤 ${site.user}<br>
                    🔒 ••••••••
                </div>
                <div class="site-actions">
                    <a href="${safeUrl}" target="_blank" class="btn-icon btn-ir" title="Ir al sitio">
                        🔗
                    </a>
                    <button class="btn-icon btn-editar edit-site-btn" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-icon btn-borrar delete-site-btn" title="Eliminar">
                        🗑️
                    </button>
                </div>
            `;

            const btnEdit = div.querySelector('.edit-site-btn');
            btnEdit.addEventListener('click', () => {
                window.location.href = `site.html?siteId=${site.id}`;
            });

            const btnDel = div.querySelector('.delete-site-btn');
            btnDel.addEventListener('click', async () => {
                if (confirm(`¿Eliminar el sitio "${site.name}"?`)) {
                    const success = await api.deleteSite(site.id);
                    if (success) {
                        mostrarNotificacion('Sitio eliminado', 'exito');
                        selectCategory(currentCategoryId, tituloSitios.textContent.replace('Sitios de: ', ''));
                    } else {
                        mostrarNotificacion('Error al eliminar sitio', 'error');
                    }
                }
            });

            listaSitios.appendChild(div);
        });
    }

    function resetSitesPanel() {
        currentCategoryId = null;
        currentSites = [];
        tituloSitios.textContent = 'Sitios';
        btnNuevoSitio.disabled = true;
        listaSitios.innerHTML = '<p id="sitios-placeholder" class="placeholder">Selecciona una categoría.</p>';
    }

    function filtrarInterfaz(query) {
        const categoriasUI = listaCategorias.children;
        Array.from(categoriasUI).forEach(catEl => {
            const text = catEl.innerText.toLowerCase();
            catEl.style.display = text.includes(query) ? 'flex' : 'none';
        });

        if (currentCategoryId && currentSites.length > 0) {
            const filteredSites = currentSites.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.user.toLowerCase().includes(query)
            );
            renderSites(filteredSites);
        }
    }

    function mostrarNotificacion(mensaje, tipo) {
        const notif = document.getElementById('modal-notificacion');
        const msgSpan = document.getElementById('mensaje-notificacion');
        notif.className = `notificacion ${tipo}`;
        if (tipo === 'exito') notif.style.backgroundColor = '#28a745';
        else notif.style.backgroundColor = '#dc3545';
        msgSpan.textContent = mensaje;
        notif.style.display = 'block';
        setTimeout(() => {
            notif.style.display = 'none';
        }, 3000);
    }
});