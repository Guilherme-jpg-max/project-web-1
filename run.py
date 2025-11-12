import os
from app import create_app, init_db
from flask_migrate import Migrate
from app.models import db

app = create_app()
migrate = Migrate(app, db)

def init_app():
    with app.app_context():        
        init_db(app)
        
        static_folder = app.static_folder or os.path.join(app.root_path, 'static')
        
        for category in ['carnes', 'hortifruti', 'laticinios', 'padaria', 
                        'bebidas', 'limpeza', 'higiene', 'mercearia', 
                        'congelados', 'pet-shop', 'eletronicos', 'bazar']:
            category_path = os.path.join(static_folder, 'img', category)
            os.makedirs(category_path, exist_ok=True)

if __name__ == '__main__':
    init_app()
    
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    app.run(host=host, port=port, debug=debug)