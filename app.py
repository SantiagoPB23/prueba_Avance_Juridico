from flask import Flask, jsonify
from flask_cors import CORS  # Importa CORS
import json  # importa json

app = Flask(__name__)
CORS(app)  # Habilita CORS para las rutas

@app.route('/data', methods=['GET'])
def get_data():
    with open('et_structure.json', 'r', encoding='utf-8') as file:
        data = json.load(file)  # Carga el archivo JSON
    return jsonify(data)  # Devuelve el JSON

if __name__ == '__main__':
    app.run(debug=True)
