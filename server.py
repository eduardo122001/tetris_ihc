import json
import time
import socket
import threading
import shutil
import subprocess
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
import atexit
from urllib.error import URLError
from urllib.parse import urlsplit
from urllib.request import urlopen

app = Flask(__name__, static_folder='.', static_url_path='')
# Habilitamos WebSockets permitiendo conexiones desde Tailscale
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

datos_actuales = {
    'esp': '{"x": 0, "y": 0, "z": 0}',
    'mobile': '{"gyro": {"x": 0, "y": 0, "z": 0}}',
}
ultima_lectura = {'esp': None, 'mobile': None}
ngrok_process = None
ngrok_status = 'not-started'

def get_tailscale_ip():
    try:
        interfaces = socket.getaddrinfo(socket.gethostname(), None)
        for ip in interfaces:
            address = ip[4][0]
            if address.startswith('100.'):
                return address
    except Exception:
        pass
    return '127.0.0.1'

def get_lan_ip():
    address_probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        address_probe.connect(('8.8.8.8', 80))
        return address_probe.getsockname()[0]
    except OSError:
        return '127.0.0.1'
    finally:
        address_probe.close()

def escuchar_udp_descubrimiento():
    puerto_udp = 8888
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        sock.bind(("0.0.0.0", puerto_udp))
        print(f"Escuchando gritos del ESP8266 en el puerto UDP {puerto_udp}...")
        while True:
            data, addr = sock.recvfrom(1024)
            mensaje = data.decode('utf-8').strip()
            if mensaje == "GORRITO_BUSCANDO_JUEGO":
                print(f"¡Gorrito encontrado en la IP {addr[0]}! Enviando respuesta...")
                sock.sendto(b"JUEGO_AQUI", addr)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/mando')
def mando():
    return app.send_static_file('mando.html')

@app.route('/sensor-status')
def sensor_status():
    source = request.args.get('source', 'esp')
    if source not in ultima_lectura:
        return "Fuente no válida", 400
    last_reading = ultima_lectura[source]
    age = time.monotonic() - last_reading if last_reading is not None else None
    return jsonify(connected=age is not None and age <= 2, ageSeconds=age)

@app.route('/datos', methods=['POST'])
def recibir_datos():
    source = request.args.get('source', 'esp')
    if source not in datos_actuales:
        return "Fuente no válida", 400
    try:
        payload = json.loads(request.get_data(as_text=True))
    except (TypeError, ValueError):
        return "El cuerpo debe ser JSON válido", 400

    datos_actuales[source] = json.dumps(payload, separators=(',', ':'))
    ultima_lectura[source] = time.monotonic()
    
    # Retransmitimos la lectura del sensor a todos los jugadores conectados
    socketio.emit('sensor_update', {'source': source, 'data': payload})
    return "OK", 200

# --- EVENTOS MULTIJUGADOR ---
@socketio.on('connect')
def handle_connect():
    print(f"Jugador conectado: {request.sid}")

@socketio.on('game_action')
def handle_game_action(data):
    # Un jugador presionó una tecla o hizo un gesto; lo enviamos a los demás
    emit('game_action', data, broadcast=True, include_self=False)

@socketio.on('sync_piece')
def handle_sync_piece(data):
    emit('sync_piece', data, broadcast=True, include_self=False)

if __name__ == '__main__':
    hilo_udp = threading.Thread(target=escuchar_udp_descubrimiento, daemon=True)
    hilo_udp.start()
    # local_ip = get_lan_ip()
    ts_ip = get_tailscale_ip()
    print("Servidor Multijugador Listo.")
    print("Juego en este ordenador: http://localhost:8080")
    print(f"Usar IP de Tailscale para el segundo jugador.")
    socketio.run(app, host='0.0.0.0', port=58080)
