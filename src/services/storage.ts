import { HttpAdapter } from './httpAdapter';
import { Equipment, EquipmentStatus, MaintenanceLog, AppNotification, UserRole } from '../types';

const adapter = new HttpAdapter();

export const storageService = {
  getAll: () => adapter.getAllEquipment(),
  save: (equipment: Equipment) => adapter.saveEquipment(equipment),
  delete: (id: string) => adapter.deleteEquipment(id),
  toggleStatus: (id: string, newStatus: EquipmentStatus) => adapter.updateEquipmentStatus(id, newStatus),
  addLog: (id: string, log: MaintenanceLog) => adapter.addMaintenanceLog(id, log),
  resolveMaintenance: (id: string) => adapter.resolveMaintenance(id),
  getNotifications: (userId: string, role: UserRole) => adapter.getNotifications(userId, role),
  createNotification: (data: Omit<AppNotification, 'id' | 'date' | 'read'>) => adapter.createNotification(data),
  markNotificationRead: (id: string) => adapter.markNotificationRead(id),
  markAllRead: (userId: string, role: UserRole) => adapter.markAllNotificationsRead(userId, role),

  // Auth
  login: (username: string, password?: string) => adapter.login(username, password),
  logout: () => adapter.logout(),
  getCurrentUser: () => adapter.getCurrentUser(),

  // User Management
  getUsers: () => adapter.getUsers(),
  createUser: (user: any) => adapter.createUser(user),
  deleteUser: (id: string) => adapter.deleteUser(id),
};