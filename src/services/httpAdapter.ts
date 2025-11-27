import { IDataService } from './api';
import { Equipment, EquipmentStatus, MaintenanceLog, AppNotification, UserRole } from '../types';

export class HttpAdapter implements IDataService {
    private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`/api${endpoint}`, options);
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized');
            }
            throw new Error(`API Error: ${response.statusText}`);
        }
        return response.json();
    }

    // --- Equipment ---

    async getAllEquipment(): Promise<Equipment[]> {
        return this.request<Equipment[]>('/equipment');
    }

    async saveEquipment(equipment: Equipment): Promise<Equipment> {
        return this.request<Equipment>('/equipment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipment)
        });
    }

    async updateEquipment(id: string, equipment: Partial<Equipment>): Promise<Equipment> {
        return this.request<Equipment>(`/equipment/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(equipment)
        });
    }

    async deleteEquipment(id: string): Promise<void> {
        await this.request(`/equipment/${id}`, { method: 'DELETE' });
    }

    async updateEquipmentStatus(id: string, status: EquipmentStatus): Promise<Equipment | undefined> {
        return this.request<Equipment>(`/equipment/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
    }

    // --- Maintenance ---

    async addMaintenanceLog(equipmentId: string, log: MaintenanceLog): Promise<Equipment | undefined> {
        return this.request<Equipment>(`/equipment/${equipmentId}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(log)
        });
    }

    async resolveMaintenance(equipmentId: string): Promise<Equipment | undefined> {
        return this.request<Equipment>(`/equipment/${equipmentId}/resolve`, {
            method: 'POST'
        });
    }

    // --- Notifications ---

    async getNotifications(userId: string, role: UserRole): Promise<AppNotification[]> {
        return this.request<AppNotification[]>('/notifications');
    }

    async createNotification(data: Omit<AppNotification, 'id' | 'date' | 'read'>): Promise<void> {
        // Backend handles notification creation automatically for maintenance events.
        // If manual creation is needed, endpoint should be added.
        console.warn('Manual notification creation not implemented in backend demo');
    }

    async markNotificationRead(id: string): Promise<void> {
        await this.request(`/notifications/${id}/read`, { method: 'POST' });
    }

    async markAllNotificationsRead(userId: string, role: UserRole): Promise<void> {
        await this.request('/notifications/read-all', { method: 'POST' });
    }

    // --- Auth ---

    async login(username: string, password?: string): Promise<any> {
        return this.request('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
    }

    async logout(): Promise<void> {
        await this.request('/auth/logout', { method: 'POST' });
    }

    async getCurrentUser(): Promise<any> {
        try {
            return await this.request('/auth/me');
        } catch (e) {
            return null;
        }
    }

    // --- User Management ---

    async getUsers(): Promise<any[]> {
        return this.request<any[]>('/admin/users');
    }

    async createUser(user: any): Promise<any> {
        return this.request<any>('/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
    }

    async deleteUser(id: string): Promise<void> {
        await this.request(`/admin/users/${id}`, { method: 'DELETE' });
    }
}
