from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from models import db, User, Equipment, MaintenanceLog, Notification
import uuid
from datetime import datetime
from functools import wraps

api = Blueprint('api', __name__)

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({"error": "Forbidden"}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- Auth ---

@api.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    # For simplicity in this demo, we might check against hardcoded users if DB is empty, 
    # but let's assume we seed the DB.
    # In a real app, use username. Here we use 'role' as username for the demo flow (admin/admin, user/user)
    
    username = data.get('username')
    password = data.get('password')
    
    username = data.get('username')
    password = data.get('password')
    
    # Look up by name (acting as username)
    user = User.query.filter_by(name=username).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid credentials"}), 401

    login_user(user)
    return jsonify(user.to_dict())

@api.route('/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out"})

@api.route('/auth/me', methods=['GET'])
def get_current_user():
    if current_user.is_authenticated:
        return jsonify(current_user.to_dict())
    return jsonify(None), 401

# --- User Management (Admin) ---

@api.route('/admin/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@api.route('/admin/users', methods=['POST'])
@login_required
@admin_required
def create_user():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'user')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400
    
    if User.query.filter_by(id=username + '-1').first(): # Simple ID logic for demo
         return jsonify({"error": "User already exists"}), 400

    user = User(
        id=f"{username}-1",
        name=username.capitalize(), # Simple name generation
        role=role,
        password_hash=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict())

@api.route('/admin/users/<id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(id):
    user = User.query.get_or_404(id)
    if user.id == current_user.id:
         return jsonify({"error": "Cannot delete yourself"}), 400
         
    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": True})

# --- Equipment ---

@api.route('/equipment', methods=['GET'])
def get_equipment():
    items = Equipment.query.all()
    return jsonify([item.to_dict() for item in items])

@api.route('/equipment', methods=['POST'])
@login_required
def create_equipment():
    data = request.json
    item = Equipment(
        id=data.get('id') or str(uuid.uuid4()),
        name=data['name'],
        brand=data['brand'],
        category=data['category'],
        status=data['status'],
        purchase_date=data['purchaseDate']
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict())

    db.session.commit()
    return jsonify(item.to_dict())

@api.route('/equipment/<id>', methods=['PUT'])
@login_required
def update_equipment(id):
    item = Equipment.query.get_or_404(id)
    data = request.json
    
    item.name = data.get('name', item.name)
    item.brand = data.get('brand', item.brand)
    item.category = data.get('category', item.category)
    # Status and purchase_date can also be updated if needed, but status has its own endpoint
    if 'purchaseDate' in data:
        item.purchase_date = data['purchaseDate']
        
    db.session.commit()
    return jsonify(item.to_dict())

@api.route('/equipment/<id>', methods=['DELETE'])
@login_required
@admin_required
def delete_equipment(id):
    item = Equipment.query.get_or_404(id)
    
    # Optional: Delete related logs or notifications? 
    # For now, we just delete the item. SQLAlchemy might cascade if configured, 
    # but we didn't configure cascade in models.py. 
    # Let's just delete the item.
    
    db.session.delete(item)
    db.session.commit()
    return jsonify({"success": True})

@api.route('/equipment/<id>/status', methods=['PUT'])
@login_required
def update_status(id):
    item = Equipment.query.get_or_404(id)
    data = request.json
    item.status = data['status']
    db.session.commit()
    return jsonify(item.to_dict())

# --- Maintenance ---

@api.route('/equipment/<id>/logs', methods=['POST'])
@login_required
def add_log(id):
    item = Equipment.query.get_or_404(id)
    data = request.json
    
    log = MaintenanceLog(
        id=data.get('id') or str(uuid.uuid4()),
        equipment_id=id,
        date=data['date'],
        description=data['description'],
        reported_by=data['reportedBy'],
        reported_by_id=data['reportedById']
    )
    
    item.status = 'maintenance'
    db.session.add(log)
    
    # Create notification for admins
    notif = Notification(
        id=str(uuid.uuid4()),
        message=f"{log.reported_by} reportou um problema em: {item.name}",
        type='alert',
        date=datetime.now().isoformat(),
        recipient_role='admin',
        related_equipment_id=item.id
    )
    db.session.add(notif)
    
    db.session.commit()
    return jsonify(item.to_dict())

@api.route('/equipment/<id>/resolve', methods=['POST'])
@login_required
def resolve_maintenance(id):
    item = Equipment.query.get_or_404(id)
    item.status = 'available'
    
    # Find last log
    last_log = MaintenanceLog.query.filter_by(equipment_id=id).order_by(MaintenanceLog.date.desc()).first()
    if last_log:
        last_log.resolved_at = datetime.now().isoformat()
        
        # Notify reporter
        if last_log.reported_by_id:
            notif = Notification(
                id=str(uuid.uuid4()),
                message=f"O equipamento {item.name} foi reparado e está disponível.",
                type='success',
                date=datetime.now().isoformat(),
                recipient_user_id=last_log.reported_by_id,
                related_equipment_id=item.id
            )
            db.session.add(notif)

    db.session.commit()
    return jsonify(item.to_dict())

# --- Notifications ---

@api.route('/notifications', methods=['GET'])
@login_required
def get_notifications():
    # Get notifications for this user or their role
    notifs = Notification.query.filter(
        (Notification.recipient_user_id == current_user.id) | 
        (Notification.recipient_role == current_user.role)
    ).order_by(Notification.date.desc()).all()
    
    return jsonify([n.to_dict() for n in notifs])

@api.route('/notifications/<id>/read', methods=['POST'])
@login_required
def mark_read(id):
    notif = Notification.query.get_or_404(id)
    notif.read = True
    db.session.commit()
    return jsonify({"success": True})

@api.route('/notifications/read-all', methods=['POST'])
@login_required
def mark_all_read():
    notifs = Notification.query.filter(
        (Notification.recipient_user_id == current_user.id) | 
        (Notification.recipient_role == current_user.role)
    ).all()
    
    for n in notifs:
        n.read = True
    
    db.session.commit()
    return jsonify({"success": True})
