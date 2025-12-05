const API_BASE_URL = 'http://localhost:3000';

const api = {
    // --- Categorías ---
    async getCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },

    async createCategory(name) {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting category:', error);
            return false;
        }
    },

    async getCategoryDetails(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/categories/${id}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error fetching category details:', error);
            return null;
        }
    },

    // --- Sitios ---
    
    // Obtener un sitio individual (para edición)
    async getSite(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/sites/${id}`);
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Error fetching site:', error);
            return null;
        }
    },

    async createSite(categoryId, siteData) {
        try {
            const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating site:', error);
            throw error;
        }
    },

    // Actualizar un sitio existente
    async updateSite(siteId, siteData) {
        try {
            const response = await fetch(`${API_BASE_URL}/sites/${siteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(siteData)
            });
            return response.ok;
        } catch (error) {
            console.error('Error updating site:', error);
            throw error;
        }
    },

    async deleteSite(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/sites/${id}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting site:', error);
            return false;
        }
    }
};