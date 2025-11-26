import { Equipment, EquipmentStatus, MaintenanceLog, AppNotification, UserRole } from '../types';

export interface IDataService {
    // Equipment
    getAllEquipment(): Promise<Equipment[]>;
    saveEquipment(equipment: Equipment): Promise<Equipment>;
    deleteEquipment(id: string): Promise<void>;
    updateEquipmentStatus(id: string, status: EquipmentStatus): Promise<Equipment | undefined>;

    // Maintenance
    addMaintenanceLog(equipmentId: string, log: MaintenanceLog): Promise<Equipment | undefined>;
import { Equipment, EquipmentStatus, MaintenanceLog, AppNotification, UserRole } from '../types';

export interface IDataService {
    // Equipment
    getAllEquipment(): Promise<Equipment[]>;
    saveEquipment(equipment: Equipment): Promise<Equipment>;
    deleteEquipment(id: string): Promise<void>;
    updateEquipmentStatus(id: string, status: EquipmentStatus): Promise<Equipment | undefined>;

    // Maintenance
    addMaintenanceLog(equipmentId: string, log: MaintenanceLog): Promise<Equipment | undefined>;
    resolveMaintenance(equipmentId: string): Promise<Equipment | undefined>;

    // Notifications
    getNotifications(userId: string, role: UserRole): Promise<AppNotification[]>;
import { Equipment, EquipmentStatus, MaintenanceLog, AppNotification, UserRole } from '../types';

export interface IDataService {
    // Equipment
    getAllEquipment(): Promise<Equipment[]>;
    saveEquipment(equipment: Equipment): Promise<Equipment>;
    deleteEquipment(id: string): Promise<void>;
    updateEquipmentStatus(id: string, status: EquipmentStatus): Promise<Equipment | undefined>;

    // Maintenance
    addMaintenanceLog(equipmentId: string, log: MaintenanceLog): Promise<Equipment | undefined>;
import { Equipment, EquipmentStatus, MaintenanceLog, AppNotification, UserRole } from '../types';

export interface IDataService {
    // Equipment
    getAllEquipment(): Promise<Equipment[]>;
    saveEquipment(equipment: Equipment): Promise<Equipment>;
    deleteEquipment(id: string): Promise<void>;
    updateEquipmentStatus(id: string, status: EquipmentStatus): Promise<Equipment | undefined>;

    // Maintenance
    addMaintenanceLog(equipmentId: string, log: MaintenanceLog): Promise<Equipment | undefined>;
    resolveMaintenance(equipmentId: string): Promise<Equipment | undefined>;

    // Notifications
    getNotifications(userId: string, role: UserRole): Promise<AppNotification[]>;
    createNotification(data: Omit<AppNotification, 'id' | 'date' | 'read'>): Promise<void>;
    markNotificationRead(id: string): Promise<void>;
    markAllNotificationsRead(userId: string, role: UserRole): Promise<void>;

    // Auth
    login(username: string, password?: string): Promise<any>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<any>;

    // User Management (Admin)
    getUsers(): Promise<any[]>;
    createUser(user: any): Promise<any>;
    deleteUser(id: string): Promise<void>;
}
