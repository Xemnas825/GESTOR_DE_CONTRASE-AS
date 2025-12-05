// mi cliente personal pa que se llame con el backend en http://localhost:3000 que asi es mas sencillito que sino me lio
class ApiClient {
    constructor(base = 'http://localhost:3000'){
        this.base = base.replace(/\/$/, '');
    }

    async _fetch(path, opts = {}){
        const url = this.base + path;
        try{
            const r = await fetch(url, opts);
            if (!r.ok) {
                const text = await r.text().catch(()=>null);
                throw new Error((text && text.length>0)? text : `HTTP ${r.status}`);
            }
            if (r.status === 204) return null;
            return await r.json();
        } catch(e){
            mostrarNotificacion('Error de red: '+e.message, true);
            throw e;
        }
    }

    
    async obtenerCategorias(){
        const data = await this._fetch('/categories');
        // mapeamos  {id,name} -> {id,nombre}, que soy españolito
        return data.map(c => ({ id: c.id, nombre: c.name }));
    }

    async agregarCategoria(nombre){
        const body = JSON.stringify({ name: String(nombre).trim() });
        const data = await this._fetch('/categories', { method: 'POST', headers: {'Content-Type':'application/json'}, body });
        return { id: data.id, nombre: data.name };
    }

    async eliminarCategoria(id){
        await this._fetch('/categories/'+id, { method: 'DELETE' });
        return { ok:true };
    }

    
    async obtenerSitios(categoriaId){
        const data = await this._fetch('/categories/'+categoriaId);
        
        const sites = (data.sites || []).map(s => ({
            id: s.id,
            categoriaId: s.categoryId || s.category_id || categoriaId,
            nombre: s.name,
            usuario: s.user,
            pass: s.password,
            url: s.url || '',
            descripcion: s.description || ''
        }));
        return sites;
    }

    async obtenerSitio(id){
        const s = await this._fetch('/sites/'+id);
        if (!s) return null;
        return {
            id: s.id,
            categoriaId: s.categoryId || s.category_id,
            nombre: s.name,
            usuario: s.user,
            pass: s.password,
            url: s.url || '',
            descripcion: s.description || ''
        };
    }

    async agregarSitio(datos){
        
        const payload = {
            name: datos.nombre,
            user: datos.usuario,
            password: datos.pass,
            url: datos.url || '',
            description: datos.descripcion || ''
        };
        const body = JSON.stringify(payload);
        const data = await this._fetch('/categories/'+datos.categoriaId, { method: 'POST', headers: {'Content-Type':'application/json'}, body });
        
        return { id: data.id, categoriaId: data.categoryId || datos.categoriaId, nombre: data.name, usuario: data.user, pass: data.password };
    }

    async actualizarSitio(id, datos){
        const payload = {
            name: datos.nombre,
            user: datos.usuario,
            password: datos.pass,
            url: datos.url || '',
            description: datos.descripcion || ''
        };
        await this._fetch('/sites/'+id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        return { ok:true };
    }

    async eliminarSitio(id){
        await this._fetch('/sites/'+id, { method: 'DELETE' });
        return { ok:true };
    }
}

// utilidad simple para notificaciones, pa que no se me ralle el teacher con las alertas
function mostrarNotificacion(mensaje, esError = false) {
    const modal = document.getElementById('modal-notificacion');
    const txt = document.getElementById('mensaje-notificacion');
    if(!modal || !txt) return;

    txt.textContent = mensaje;
    modal.className = 'notificacion ' + (esError ? 'error' : 'exito');
    modal.style.display = 'block';
    setTimeout(() => modal.style.display = 'none', 3000);
}

// exponemos la api client globalmente, asi la puedo usar sencillita, que bueno soy mister
window.ApiClient = ApiClient;