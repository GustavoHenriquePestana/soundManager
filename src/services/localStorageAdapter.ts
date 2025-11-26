import { IDataService } from './api';
import { Equipment, EquipmentStatus, MaintenanceLog, AppNotification, UserRole } from '../types';

const STORAGE_KEY = 'sound_equip_db_v1';
const NOTIFICATIONS_KEY = 'sound_equip_notifications_v1';

// Initial Seed Data
const INITIAL_DATA: Equipment[] = [
    {
        id: '1',
        name: 'Shure SM58',
        brand: 'Shure',
        category: 'Microfones',
        status: 'available',
        purchaseDate: '2023-01-15',
        logs: []
    },
    {
        id: '2',
        name: 'Behringer X32',
        brand: 'Behringer',
        category: 'Mesas de Som',
        status: 'in_use',
        purchaseDate: '2022-05-20',
        logs: []
    },
    {
        id: '3',
        name: 'Cabo XLR 10m',
        brand: 'Santo Angelo',
        category: 'Cabos',
        status: 'maintenance',
        purchaseDate: '2023-08-10',
        logs: [
            {
                id: 'log-1',
                date: '2023-10-25',
                description: 'Conector com mau contato',
                reportedBy: 'Usuário Padrão',
                reportedById: 'user-1'
            }
        ]
    },
    {
        id: '4',
        name: 'Yamaha DBR10',
        brand: 'Yamaha',
        category: 'Caixas de Som',
        status: 'available',
        purchaseDate: '2021-11-05',
        logs: []
    }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class LocalStorageAdapter implements IDataService {
    async getAllEquipment(): Promise<Equipment[]> {
        await delay(300);
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
            return INITIAL_DATA;
        }
        return JSON.parse(stored);
    }

    async saveEquipment(equipment: Equipment): Promise<Equipment> {
        await delay(200);
        const items = await this.getAllEquipment();
        const exists = items.find(i => i.id === equipment.id);

        let newItems;
        if (exists) {
            newItems = items.map(i => i.id === equipment.id ? equipment : i);
        } else {
            newItems = [...items, equipment];
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
        return equipment;
    }

    async deleteEquipment(id: string): Promise<void> {
        await delay(200);
        const items = await this.getAllEquipment();
        const newItems = items.filter(i => i.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    }

    async updateEquipmentStatus(id: string, newStatus: EquipmentStatus): Promise<Equipment | undefined> {
        const items = await this.getAllEquipment();
        const item = items.find(i => i.id === id);
        if (item) {
            item.status = newStatus;
            await this.saveEquipment(item);
            return item;
        }
        return undefined;
    }

    async addMaintenanceLog(id: string, log: MaintenanceLog): Promise<Equipment | undefined> {
        const items = await this.getAllEquipment();
        const item = items.find(i => i.id === id);
        if (item) {
            item.logs.push(log);
            item.status = 'maintenance';
            await this.saveEquipment(item);

            await this.createNotification({
                recipientRole: 'admin',
                message: `${log.reportedBy} reportou um problema em: ${item.name}`,
                type: 'alert',
                relatedEquipmentId: item.id
            });

            return item;
        }
        return undefined;
    }

    async resolveMaintenance(id: string): Promise<Equipment | undefined> {
        const items = await this.getAllEquipment();
        const item = items.find(i => i.id === id);
        if (item) {
            item.status = 'available';

            let reportedById: string | undefined;

            if (item.logs.length > 0) {
                const lastLog = item.logs[item.logs.length - 1];
                lastLog.resolvedAt = new Date().toISOString();
                reportedById = lastLog.reportedById;
            }

            await this.saveEquipment(item);

            if (reportedById) {
                await this.createNotification({
                    recipientUserId: reportedById,
                    message: `O equipamento ${item.name} foi reparado e está disponível.`,
                    type: 'success',
                    relatedEquipmentId: item.id
                });
            }

            return item;
        }
        return undefined;
    }

    async getNotifications(userId: string, role: UserRole): Promise<AppNotification[]> {
        const stored = localStorage.getItem(NOTIFICATIONS_KEY);
        const allNotifications: AppNotification[] = stored ? JSON.parse(stored) : [];

        return allNotifications.filter(n =>
            (n.recipientRole === role) || (n.recipientUserId === userId)
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    async createNotification(data: Omit<AppNotification, 'id' | 'date' | 'read'>): Promise<void> {
        const stored = localStorage.getItem(NOTIFICATIONS_KEY);
        const allNotifications: AppNotification[] = stored ? JSON.parse(stored) : [];

        const newNotification: AppNotification = {
            id: Date.now().toString() + Math.random().toString(),
            date: new Date().toISOString(),
            read: false,
            ...data
        };

        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([newNotification, ...allNotifications]));
    }

    async markNotificationRead(notificationId: string): Promise<void> {
        const stored = localStorage.getItem(NOTIFICATIONS_KEY);
        if (!stored) return;

        const allNotifications: AppNotification[] = JSON.parse(stored);
        const updated = allNotifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );

        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    }

    async markAllNotificationsRead(userId: string, role: UserRole): Promise<void> {
        const stored = localStorage.getItem(NOTIFICATIONS_KEY);
        if (!stored) return;

        const allNotifications: AppNotification[] = JSON.parse(stored);
        const updated = allNotifications.map(n => {
            if ((n.recipientRole === role) || (n.recipientUserId === userId)) {
                return { ...n, read: true };
            }
            return n;
        });
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    }

    // --- Auth (Mock) ---
    async login(username: string, password?: string): Promise<any> {
        return {
            id: username === 'admin' ? 'admin-1' : 'user-1',
            name: username === 'admin' ? 'Pr. Carlos (Admin)' : 'João (Técnico)',
            role: username
        };
    }

    async logout(): Promise<void> { }

    async getCurrentUser(): Promise<any> {
        return null;
    }

    // --- User Management (Mock) ---
    async getUsers(): Promise<any[]> {
        return [];
    }

    async createUser(user: any): Promise<any> {
        return user;
    }

    async deleteUser(id: string): Promise<void> { }
}
