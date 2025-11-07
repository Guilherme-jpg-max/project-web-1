from app import db

class Item(db.Model):
    __tablename__ = 'item'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), unique=True, nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    imagem_url = db.Column(db.String(200), default='/static/img/icons/default.png')

    def __init__(self, nome=None, categoria=None, imagem_url=None):
        self.nome = nome
        self.categoria = categoria
        self.imagem_url = imagem_url or '/static/img/icons/default.png'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'categoria': self.categoria,
            'imagem_url': self.imagem_url
        }


class ListaMercado(db.Model):
    __tablename__ = 'lista_mercado' 
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_key = db.Column(db.String(100), nullable=False) 
    item_id = db.Column(db.Integer, db.ForeignKey('item.id'), nullable=False)
    quantidade = db.Column(db.Float, default=1.0, nullable=False)
    
    item = db.relationship('Item', backref='listas', lazy=True)


    def __init__(self, usuario_key=None, item_id=None, quantidade=1.0):
        self.usuario_key = usuario_key
        self.item_id = item_id
        self.quantidade = quantidade

    def to_dict(self):
        return {
            'id': self.id,
            'usuario_key': self.usuario_key,
            'item_id': self.item_id,
            'quantidade': self.quantidade,
            'item': self.item.to_dict() if self.item else None
        }