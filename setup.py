
import sys
from run import create_app, init_db
from app.config import Config

app = create_app(Config)

try:
    init_db(app)
    print("✅ Inicialização do DB e inserção de dados concluída.")
except Exception as e:
    print(f"❌ Erro ao inicializar o DB: {e}")
    sys.exit(1)