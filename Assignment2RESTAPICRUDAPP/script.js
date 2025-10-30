class StoriesAPI {
    constructor(baseURL = 'https://usmanlive.com/wp-json/api/stories') {
        this.baseURL = baseURL;
    }

    async request(endpoint = '', options = {}) {
        const url = endpoint ? `${this.baseURL}/${endpoint}` : this.baseURL;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // CREATE - Add new story
    async createStory(storyData) {
        return this.request('', {
            method: 'POST',
            body: JSON.stringify(storyData)
        });
    }

    // READ - Get all stories
    async getAllStories() {
        return this.request();
    }

    // READ - Get single story
    async getStory(id) {
        return this.request(id);
    }

    // UPDATE - Update story
    async updateStory(id, storyData) {
        return this.request(id, {
            method: 'PUT',
            body: JSON.stringify(storyData)
        });
    }

    // DELETE - Delete story
    async deleteStory(id) {
        return this.request(id, {
            method: 'DELETE'
        });
    }
}

class StoriesApp {
    constructor() {
        this.api = new StoriesAPI();
        this.stories = [];
        this.currentStoryId = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadStories();
    }

    initializeElements() {
        // Main elements
        this.storiesList = document.getElementById('storiesList');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        
        // Modal elements
        this.storyModal = document.getElementById('storyModal');
        this.confirmModal = document.getElementById('confirmModal');
        this.storyForm = document.getElementById('storyForm');
        this.modalTitle = document.getElementById('modalTitle');
        
        // Form elements
        this.storyId = document.getElementById('storyId');
        this.titleInput = document.getElementById('title');
        this.contentInput = document.getElementById('content');
        this.excerptInput = document.getElementById('excerpt');
        this.statusInput = document.getElementById('status');
        
        // Buttons
        this.addStoryBtn = document.getElementById('addStoryBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        this.cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        
        // Close buttons
        this.closeButtons = document.querySelectorAll('.close');
    }

    attachEventListeners() {
        // Add story button
        this.addStoryBtn.addEventListener('click', () => this.openAddModal());
        
        // Form submission
        this.storyForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Cancel button
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        
        // Close modal buttons
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });
        
        // Confirm delete buttons
        this.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        this.cancelDeleteBtn.addEventListener('click', () => this.closeConfirmModal());
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.storyModal) this.closeModal();
            if (e.target === this.confirmModal) this.closeConfirmModal();
        });
    }

    async loadStories() {
        this.showLoading();
        
        try {
            this.stories = await this.api.getAllStories();
            this.renderStories();
        } catch (error) {
            this.showError('Failed to load stories. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    renderStories() {
        if (!this.stories || this.stories.length === 0) {
            this.storiesList.innerHTML = `
                <div class="empty-state">
                    <h3>No Stories Found</h3>
                    <p>Click "Add New Story" to create your first story.</p>
                </div>
            `;
            this.storiesList.style.display = 'block';
            return;
        }

        const storiesHTML = this.stories.map(story => `
            <div class="story-card" data-id="${story.id}">
                <div class="story-header">
                    <div class="story-info">
                        <h3 class="story-title">${this.escapeHTML(story.title)}</h3>
                        <div class="story-meta">
                            Created: ${new Date(story.date).toLocaleDateString()}
                            <span class="story-status status-${story.status}">
                                ${story.status}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Show content preview (first 150 characters) -->
                <div class="story-content-preview">
                    <strong>Content Preview:</strong> 
                    ${this.escapeHTML(story.content ? story.content.substring(0, 150) + (story.content.length > 150 ? '...' : '') : 'No content available')}
                </div>
                
                <!-- Show excerpt if available -->
                ${story.excerpt ? `
                    <div class="story-excerpt">
                        <strong>Excerpt:</strong> ${this.escapeHTML(story.excerpt)}
                    </div>
                ` : ''}
                
                <div class="story-actions">
                    <button class="btn btn-warning" onclick="app.editStory(${story.id})">
                        Edit
                    </button>
                    <button class="btn btn-info" onclick="app.viewFullContent(${story.id})">
                        View Full Content
                    </button>
                    <button class="btn btn-danger" onclick="app.openDeleteModal(${story.id})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        this.storiesList.innerHTML = storiesHTML;
        this.storiesList.style.display = 'block';
    }

    openAddModal() {
        this.modalTitle.textContent = 'Add New Story';
        this.resetForm();
        this.storyModal.style.display = 'block';
    }

    async editStory(id) {
        try {
            this.showLoading();
            const story = await this.api.getStory(id);
            
            this.modalTitle.textContent = 'Edit Story';
            this.populateForm(story);
            this.storyModal.style.display = 'block';
        } catch (error) {
            this.showError('Failed to load story for editing.');
        } finally {
            this.hideLoading();
        }
    }

    populateForm(story) {
        this.storyId.value = story.id;
        this.titleInput.value = story.title || '';
        this.contentInput.value = story.content || '';
        this.excerptInput.value = story.excerpt || '';
        this.statusInput.value = story.status || 'publish';
    }

    resetForm() {
        this.storyId.value = '';
        this.titleInput.value = '';
        this.contentInput.value = '';
        this.excerptInput.value = '';
        this.statusInput.value = 'publish';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const storyData = {
            title: this.titleInput.value.trim(),
            content: this.contentInput.value.trim(),
            excerpt: this.excerptInput.value.trim(),
            status: this.statusInput.value
        };

        // Basic validation
        if (!storyData.title || !storyData.content) {
            this.showError('Title and content are required.');
            return;
        }

        const storyId = this.storyId.value;
        const isEditing = !!storyId;

        try {
            if (isEditing) {
                await this.api.updateStory(storyId, storyData);
                this.showSuccess('Story updated successfully!');
            } else {
                await this.api.createStory(storyData);
                this.showSuccess('Story created successfully!');
            }
            
            this.closeModal();
            await this.loadStories();
        } catch (error) {
            this.showError(`Failed to ${isEditing ? 'update' : 'create'} story. Please try again.`);
        }
    }

    async viewFullContent(id) {
        try {
            this.showLoading();
            const story = await this.api.getStory(id);
            
            // Create modal for full content
            const fullContentModal = document.createElement('div');
            fullContentModal.className = 'modal full-content-modal';
            fullContentModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${this.escapeHTML(story.title)}</h2>
                        <span class="close">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="story-meta">
                            <strong>Status:</strong> 
                            <span class="story-status status-${story.status}">${story.status}</span>
                            • <strong>Date:</strong> ${new Date(story.date).toLocaleDateString()}
                        </div>
                        
                        ${story.excerpt ? `
                            <div class="story-excerpt">
                                <strong>Excerpt:</strong> ${this.escapeHTML(story.excerpt)}
                            </div>
                        ` : ''}
                        
                        <div class="full-content">
                            <strong>Full Content:</strong><br><br>
                            ${this.escapeHTML(story.content || 'No content available')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="closeFullContent">Close</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(fullContentModal);
            fullContentModal.style.display = 'block';
            
            // Add event listeners
            const closeBtn = fullContentModal.querySelector('.close');
            const closeContentBtn = fullContentModal.querySelector('#closeFullContent');
            
            const closeModal = () => {
                document.body.removeChild(fullContentModal);
            };
            
            closeBtn.addEventListener('click', closeModal);
            closeContentBtn.addEventListener('click', closeModal);
            fullContentModal.addEventListener('click', (e) => {
                if (e.target === fullContentModal) closeModal();
            });
            
        } catch (error) {
            this.showError('Failed to load story content.');
        } finally {
            this.hideLoading();
        }
    }

    openDeleteModal(id) {
        this.currentStoryId = id;
        this.confirmModal.style.display = 'block';
    }

    async confirmDelete() {
        if (!this.currentStoryId) return;

        try {
            await this.api.deleteStory(this.currentStoryId);
            this.showSuccess('Story deleted successfully!');
            this.closeConfirmModal();
            await this.loadStories();
        } catch (error) {
            this.showError('Failed to delete story. Please try again.');
        }
    }

    closeModal() {
        this.storyModal.style.display = 'none';
        this.resetForm();
    }

    closeConfirmModal() {
        this.confirmModal.style.display = 'none';
        this.currentStoryId = null;
    }

    showLoading() {
        this.loadingSpinner.style.display = 'block';
        this.storiesList.style.display = 'none';
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    escapeHTML(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Initialize the application
const app = new StoriesApp();