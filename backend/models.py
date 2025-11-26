from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.String(50), primary_key=True) # Using string ID to match frontend 'admin-1' etc for now, or uuid
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'admin' or 'user'
    password_hash = db.Column(db.String(200))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "role": self.role
        }

class Equipment(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(50))
    category = db.Column(db.String(50))
    status = db.Column(db.String(20), default='available') # available, in_use, maintenance
    purchase_date = db.Column(db.String(20))
    
    logs = db.relationship('MaintenanceLog', backref='equipment', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "brand": self.brand,
            "category": self.category,
            "status": self.status,
            "purchaseDate": self.purchase_date,
            "logs": [log.to_dict() for log in self.logs]
        }

class MaintenanceLog(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    equipment_id = db.Column(db.String(50), db.ForeignKey('equipment.id'), nullable=False)
    date = db.Column(db.String(30)) # ISO string
    description = db.Column(db.Text)
    reported_by = db.Column(db.String(100))
    reported_by_id = db.Column(db.String(50))
    resolved_at = db.Column(db.String(30), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "date": self.date,
            "description": self.description,
            "reportedBy": self.reported_by,
            "reportedById": self.reported_by_id,
            "resolvedAt": self.resolved_at
        }

class Notification(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    message = db.Column(db.String(200))
    type = db.Column(db.String(20)) # alert, success, info
    date = db.Column(db.String(30))
    read = db.Column(db.Boolean, default=False)
    recipient_role = db.Column(db.String(20), nullable=True)
    recipient_user_id = db.Column(db.String(50), nullable=True)
    related_equipment_id = db.Column(db.String(50), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "message": self.message,
            "type": self.type,
            "date": self.date,
            "read": self.read,
            "recipientRole": self.recipient_role,
            "recipientUserId": self.recipient_user_id,
            "relatedEquipmentId": self.related_equipment_id
        }
