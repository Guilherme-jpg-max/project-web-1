# import os

# class Config:
#     SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production-12345'
    
#     SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
#         'sqlite:///' + os.path.abspath(os.path.join(
#             os.path.dirname(os.path.dirname(__file__)), 
#             'instance', 
#             'database.db'
#         ))
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
#     DEBUG = os.environ.get('FLASK_ENV') != 'production'
#     MAX_CONTENT_LENGTH = 16 * 1024 * 1024 
#     UPLOAD_FOLDER = os.path.join('app', 'static', 'img')
#     ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

#     PERMANENT_SESSION_LIFETIME = 1800
#     SEND_FILE_MAX_AGE_DEFAULT = 31536000

import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production-12345'
    
    # ✅ Pegar DATABASE_URL e corrigir o prefixo do Render
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # ✅ Render usa postgres://, mas SQLAlchemy precisa de postgresql://
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    # Usar PostgreSQL no Render, SQLite local
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or \
        'sqlite:///' + os.path.abspath(os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            'instance', 
            'database.db'
        ))
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = os.environ.get('FLASK_ENV') != 'production'
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 
    UPLOAD_FOLDER = os.path.join('app', 'static', 'img')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

    PERMANENT_SESSION_LIFETIME = 1800
    SEND_FILE_MAX_AGE_DEFAULT = 31536000
