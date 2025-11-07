import os
from app import create_app, init_db
from flask_migrate import Migrate
from app.models import db

app = create_app()
migrate = Migrate(app, db)

def create_default_icon():
    """Cria um ícone SVG padrão se não existir"""
    static_folder = app.static_folder or os.path.join(app.root_path, 'static')
    icons_path = os.path.join(static_folder, 'img', 'icons')
    default_icon_path = os.path.join(icons_path, 'default.png')
    
    # Criar pasta se não existir
    os.makedirs(icons_path, exist_ok=True)
    
    # Se já existe, não faz nada
    if os.path.exists(default_icon_path):
        return
    
    # Criar um SVG simples como fallback
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
  <rect width="150" height="150" fill="#e5e7eb"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial" font-size="16">Sem Imagem</text>
</svg>'''
    
    # Salvar como SVG (renomeie para default.svg no código ou converta)
    svg_path = os.path.join(icons_path, 'default.svg')
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"✅ Ícone padrão criado em: {svg_path}")

def init_app():
    with app.app_context():
        # Criar ícone padrão primeiro
        create_default_icon()
        
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