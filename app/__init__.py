# app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app.config import Config

db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)

    from app.routes import bp as main_bp
    app.register_blueprint(main_bp)

    return app


# Mock de dados iniciais (12 Categorias x 25 Itens = 300 Itens)
def init_db():
    from app.models import Item

    app = create_app()
    
    with app.app_context():
        db.create_all() 
        
        if Item.query.count() == 0:
            itens_iniciais = []
            
            categorias = {
                'Laticínios': ['Leite Integral', 'Iogurte Natural', 'Queijo Muçarela', 'Manteiga', 'Creme de Leite', 'Requeijão', 'Leite Condensado', 'Queijo Prato', 'Ricota', 'Queijo Cottage', 'Margarina', 'Queijo Minas', 'Queijo Parmesão', 'Danone Morango'],
                'Padaria': ['Pão Francês', 'Pão de Forma', 'Baguete', 'Pão de Queijo', 'Pão Integral', 'Croissant', 'Biscoito Salgado', 'Torrada Integral', 'Pão de Hambúrguer', 'Pão de Hot Dog', 'Biscoito Polvilho', 'Pão com Gergelim', 'Donut'],
                'Bebidas': ['Água Mineral sem Gás', 'Refrigerante', 'Suco de Laranja', 'Cerveja', 'Vinho Tinto Seco', 'Água com Gás', 'Água Tônica', 'Suco de Uva Integral', 'Whisky', 'Vodka', 'Energético', 'Leite Vegetal', 'Gin', 'Vinho Branco Suave', 'Café Solúvel', 'Água de Coco', 'Cachaça'],
                'Limpeza': ['Detergente', 'Álcool Líquido', 'Água Sanitária', 'Sabão em Pó', 'Amaciante', 'Desinfetante', 'Esponja', 'Saco de Lixo', 'Limpa Vidros', 'Pano de Chão', 'Lã de Aço', 'Sabão em Barra', 'Cera para Piso', 'Desentupidor', 'Flanela', 'Vassoura', 'Rodo', 'Tira Manchas', 'Odorizador', 'Inseticida', 'Limpador Perfumado'],
                'Higiene': ['Shampoo', 'Condicionador', 'Sabonete em Barra', 'Papel Higiênico', 'Escova de Dente', 'Pasta de Dente', 'Fio Dental', 'Desodorante Aerosol', 'Creme Corporal', 'Protetor Solar', 'Cotonetes', 'Absorvente', 'Barbeador', 'Gel Pós-Barba', 'Pente', 'Tinta de Cabelo'],
                'Mercearia': ['Arroz branco', 'Feijão Carioca', 'Açúcar Refinado', 'Óleo de Soja', 'Sal Refinado', 'Café em Pó', 'Macarrão Espaguete', 'Molho de Tomate', 'Azeite Extra Virgem', 'Farinha de Trigo', 'Fermento Biológico', 'Gelatina', 'Maisena', 'Pipoca', 'Chocolate em Barra', 'Achocolatado', 'Pimenta do Reino', 'Orégano', 'Louro', 'Bicarbonato de Sódio'],
                'Congelados': ['Pizza Muçarela', 'Batata Frita', 'Lasanha à Bolonhesa', 'Pão de Queijo', 'Açaí', 'Polpa de Fruta', 'Nuggets', 'Hambúrguer de Carne', 'Sorvete Creme', 'Gelo em Cubos', 'Peixe Empanado', 'Pão de Alho', 'Gelo de Coco', 'Filé de Frango Congelado', 'Massa de Pizza', 'Frutas Vermelhas'],
                'Pet Shop': ['Ração Cachorro', 'Ração Gato', 'Areia Sanitária', 'Ossinho', 'Shampoo Pet', 'Pá para Areia', 'Coleira', 'Brinquedo Bola', 'Petisco Carne', 'Antipulgas', 'Vermífugo', 'Cama Pet', 'Comedouro', 'Pote de Água', 'Focinheira', 'Escova Pet', 'Bolinha com Sino'],
                'Eletrônicos': ['Carregador USB', 'Fone de Ouvido', 'Mouse sem Fio', 'Teclado', 'Cabo HDMI', 'Lâmpada LED', 'Extensão Elétrica', 'Adaptador', 'Cabo USB C', 'Bateria Recarregável', 'Caixa de Som', 'Controle Remoto', 'Suporte Celular', 'Microfone', 'Protetor de Tomada', 'Luminária', 'Roteador'],
                'Bazar': ['Vela Aromática', 'Guardanapo de Papel', 'Prato de Plástico', 'Copo Descartável', 'Talher Descartável', 'Vaso de Flores', 'Tapete de Banheiro', 'Pano de Prato', 'Pilhas', 'Fita Adesiva', 'Tesoura', 'Cola', 'Clips'],
                'Hortifruti': ['Maçã', 'Banana', 'Laranja', 'Tomate', 'Cebola', 'Batata', 'Cenoura', 'Alface', 'Limão', 'Manga', 'Pera', 'Uva', 'Abacaxi', 'Melancia', 'Mamão', 'Pimentão', 'Berinjela', 'Abobrinha', 'Couve', 'Repolho'],
                'Carnes': ['Contra Filé', 'Alcatra', 'Picanha', 'Frango Inteiro', 'Peito de Frango', 'Coxa de Frango', 'Linguiça', 'Bacon', 'Costela', 'Carne Moída', 'Filé Mignon', 'Cupim', 'Maminha', 'Fraldinha', 'Patinho']
            }


            for categoria, nomes in categorias.items():
                for nome in nomes:
                    nome_completo = f"{nome} ({categoria})" if nome in ["Pão de Queijo"] else nome

                    categoria_path = categoria.lower().replace(' ', '-').replace('í', 'i').replace('ô', 'o')
                    
                    base_path = f'/static/img/{categoria_path}'
                    
                    img_url = '/static/img/icons/default.png'
                    
                    import os
                    import unicodedata
                    
                    def normalize_name(text):
                        text = ''.join(c for c in unicodedata.normalize('NFD', text)
                                    if unicodedata.category(c) != 'Mn')
                        text = text.lower().replace('_', ' ').replace('-', ' ')
                        words_to_remove = ['de', 'do', 'da', 'em']
                        text = ' '.join(word for word in text.split() 
                                    if word not in words_to_remove)
                        return text
                    
                    pasta_categoria = os.path.join(app.static_folder, 'img', categoria_path)
                    if os.path.exists(pasta_categoria):
                        arquivos = os.listdir(pasta_categoria)
                        nome_item_normalizado = normalize_name(nome)
                        
                        for arquivo in arquivos:
                            nome_arquivo = os.path.splitext(arquivo)[0]
                            nome_arquivo_normalizado = normalize_name(nome_arquivo)
                            
                            palavras_item = set(nome_item_normalizado.split())
                            palavras_arquivo = set(nome_arquivo_normalizado.split())
                            
                            if palavras_item.issubset(palavras_arquivo) or \
                               palavras_arquivo.issubset(palavras_item):
                                img_url = f'{base_path}/{arquivo}'
                                break
                    
                    novo_item = Item(
                        nome=nome_completo,
                        categoria=categoria,
                        imagem_url=img_url
                    )
                    itens_iniciais.append(novo_item)

            db.session.add_all(itens_iniciais)
            db.session.commit()
            print(f"Banco de dados inicializado com sucesso e {len(itens_iniciais)} itens de mercado adicionados.")

app = create_app()