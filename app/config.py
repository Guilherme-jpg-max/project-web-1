import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'chave_secreta_para_a_sessao_do_projeto')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', 'sqlite:///' + os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'database.db')))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    DEBUG = os.environ.get('FLASK_ENV') != 'production'
    
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 
    UPLOAD_FOLDER = os.path.join('app', 'static', 'img')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    
    SESSION_TYPE = 'filesystem'
    PERMANENT_SESSION_LIFETIME = 1800
    
    SEND_FILE_MAX_AGE_DEFAULT = 31536000