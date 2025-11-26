import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_login import LoginManager
from models import db, User, Equipment
from routes import api
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='../dist', static_url_path='/')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-default-key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///church.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)

db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)

app.register_blueprint(api, url_prefix='/api')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

def seed_db():
    with app.app_context():
        db.create_all()
        if not Equipment.query.first():
            # Seed initial data
            print("Seeding database...")
            items = [
                Equipment(id='1', name='Shure SM58', brand='Shure', category='Microfones', status='available', purchase_date='2023-01-15'),
                Equipment(id='2', name='Behringer X32', brand='Behringer', category='Mesas de Som', status='in_use', purchase_date='2022-05-20'),
                Equipment(id='3', name='Cabo XLR 10m', brand='Santo Angelo', category='Cabos', status='maintenance', purchase_date='2023-08-10'),
                Equipment(id='4', name='Yamaha DBR10', brand='Yamaha', category='Caixas de Som', status='available', purchase_date='2021-11-05')
            ]
            db.session.add_all(items)
            db.session.commit()
        
        # Seed Users
        from werkzeug.security import generate_password_hash
        import uuid
        
        # Admin User
        if not User.query.filter_by(name='Ronaldo').first():
            admin = User(
                id=str(uuid.uuid4()),
                name='Ronaldo',
                password_hash=generate_password_hash('admin'),
                role='admin'
            )
            db.session.add(admin)
            print("Admin user 'Ronaldo' created.")

        # Regular User
        if not User.query.filter_by(name='usuario').first():
            user = User(
                id=str(uuid.uuid4()),
                name='usuario',
                password_hash=generate_password_hash('user'),
                role='user'
            )
            db.session.add(user)
            print("Regular user 'usuario' created.")
            
        db.session.commit()

# Ensure DB is seeded on startup
seed_db()

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(debug=debug_mode, port=5000)
