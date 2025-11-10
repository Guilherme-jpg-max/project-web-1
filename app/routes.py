from flask import Blueprint, jsonify, request, render_template, redirect, url_for, session
from app.models import db, Item, ListaMercado

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    return render_template('login.html')


@bp.route('/logar', methods=['POST'])
def logar():
    nome = request.form.get('nome')
    endereco = request.form.get('endereco')

    if nome and endereco:
        session['usuario_key'] = f"{nome}_{endereco}"
        session['nome'] = nome
        session['endereco'] = endereco
        return redirect(url_for('main.home'))

    return render_template('login.html', erro="Nome e endereço são obrigatórios."), 401


@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('main.index'))


@bp.route('/home')
def home():
    if 'usuario_key' not in session:
        return redirect(url_for('main.index'))

    return render_template(
        'home.html',
        nome=session.get('nome'),
        endereco=session.get('endereco')
    )


@bp.route('/api/itens', methods=['GET'])
def buscar_itens():
    termo_busca = request.args.get('q', '').strip().lower()

    if not termo_busca:
        itens = Item.query.all()
    else:
        itens = Item.query.filter(
            (Item.nome.ilike(f'%{termo_busca}%')) | #type: ignore
            (Item.categoria.ilike(f'%{termo_busca}%')) # type: ignore
        ).all()

    itens_agrupados = {}
    for item in itens:
        categoria = item.categoria or "Outros"
        itens_agrupados.setdefault(categoria, []).append(item.to_dict())

    return jsonify(itens_agrupados)


@bp.route('/api/lista', methods=['GET'])
def visualizar_lista():
    usuario_key = session.get('usuario_key')
    if not usuario_key:
        return jsonify({"erro": "Usuário não logado"}), 401

    lista = ListaMercado.query.filter_by(usuario_key=usuario_key).all()

    itens = [
        {
            'lista_id': item_lista.id,
            'quantidade': item_lista.quantidade,
            **item_lista.item.to_dict()
        }
        for item_lista in lista
    ]
    return jsonify(itens)


@bp.route('/api/lista', methods=['POST'])
def adicionar_a_lista():
    usuario_key = session.get('usuario_key')
    if not usuario_key:
        return jsonify({"erro": "Usuário não logado"}), 401

    try:
        data = request.get_json() or {}
        item_id = data.get('item_id')
        quantidade = data.get('quantidade', 1.0)

        if not item_id:
            return jsonify({"erro": "Item ID ausente"}), 400
        
        item = Item.query.get(item_id)
        if not item:
            return jsonify({"erro": "Item não encontrado"}), 404

        try:
            quantidade = float(quantidade)
            if quantidade <= 0:
                return jsonify({"erro": "Quantidade deve ser maior que zero"}), 400
        except (ValueError, TypeError):
            return jsonify({"erro": "Quantidade inválida"}), 400

        item_existente = ListaMercado.query.filter_by(
            usuario_key=usuario_key, 
            item_id=item_id
        ).first()
        
        if item_existente:
            item_existente.quantidade = float(item_existente.quantidade) + quantidade
            db.session.commit()
            return jsonify({
                "mensagem": "Quantidade atualizada.",
                "id": item_existente.id,
                "quantidade": item_existente.quantidade
            }), 200

        novo_item = ListaMercado(
            usuario_key=usuario_key, 
            item_id=item_id, 
            quantidade=quantidade
        )
        db.session.add(novo_item)
        db.session.commit()

        return jsonify({
            "mensagem": "Item adicionado com sucesso!",
            "id": novo_item.id,
            "quantidade": novo_item.quantidade
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao adicionar item: {e}")
        return jsonify({"erro": "Erro interno do servidor"}), 500

    return jsonify({
        "mensagem": "Item adicionado com sucesso!",
        "id": novo_item.id,
        "quantidade": novo_item.quantidade
    }), 201


@bp.route('/api/lista/<int:lista_id>', methods=['PUT'])
def atualizar_quantidade(lista_id):
    usuario_key = session.get('usuario_key')
    if not usuario_key:
        return jsonify({"erro": "Usuário não logado"}), 401

    data = request.get_json() or {}
    nova_qtd = data.get('quantidade')

    if nova_qtd is None:
        return jsonify({"erro": "Quantidade não fornecida"}), 400

    item_lista = ListaMercado.query.filter_by(id=lista_id, usuario_key=usuario_key).first()
    if not item_lista:
        return jsonify({"erro": "Item não encontrado na sua lista"}), 404

    try:
        item_lista.quantidade = float(nova_qtd)
    except ValueError:
        return jsonify({"erro": "Quantidade inválida"}), 400

    db.session.commit()
    return jsonify({
        "mensagem": "Quantidade atualizada",
        "id": item_lista.id,
        "quantidade": item_lista.quantidade
    }), 200


@bp.route('/api/lista/<int:lista_id>', methods=['DELETE'])
def remover_da_lista(lista_id):
    usuario_key = session.get('usuario_key')
    if not usuario_key:
        return jsonify({"erro": "Usuário não logado"}), 401

    item = ListaMercado.query.filter_by(id=lista_id, usuario_key=usuario_key).first()
    if not item:
        return jsonify({"erro": "Item não encontrado na sua lista"}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({"mensagem": "Item removido com sucesso!"}), 200
