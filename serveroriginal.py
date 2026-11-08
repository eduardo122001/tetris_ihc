import atexit
import json
from flask import Flask, jsonify, request, Response
import time
import socket
import threading
import shutil
import subprocess
from urllib.error import URLError
from urllib.parse import urlsplit
from urllib.request import urlopen

app = Flask(__name__, static_folder='.', static_url_path='')
datos_actuales = {
    'esp': '{"x": 0, "y": 0, "z": 0}',
    'mobile': '{"gyro": {"x": 0, "y": 0, "z": 0}}',
}
ultima_lectura = {'esp': None, 'mobile': None}
ngrok_process = None
ngrok_status = 'not-started'


def get_lan_ip():
    address_probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        address_probe.connect(('8.8.8.8', 80))
        return address_probe.getsockname()[0]
    except OSError:
        return '127.0.0.1'
    finally:
        address_probe.close()


def get_ngrok_url():
    try:
        with urlopen('http://127.0.0.1:4040/api/tunnels', timeout=0.5) as response:
            tunnels = json.load(response).get('tunnels', [])
    except (OSError, URLError, ValueError):
        return None

    matching_urls = []
    for tunnel in tunnels:
        address = tunnel.get('config', {}).get('addr', '')
        try:
            parsed_address = urlsplit(address if '://' in address else f'http://{address}')
            public_url = tunnel.get('public_url', '')
            if parsed_address.port == 8080 and public_url.startswith(('https://', 'http://')):
                matching_urls.append(public_url)
        except ValueError:
            continue

    return next((url for url in matching_urls if url.startswith('https://')), None) or next(iter(matching_urls), None)


def start_ngrok_tunnel():
    global ngrok_process, ngrok_status

    if get_ngrok_url():
        ngrok_status = 'ready'
        print("Túnel ngrok existente detectado.")
        return

    ngrok_path = shutil.which('ngrok')
    if not ngrok_path:
        ngrok_status = 'unavailable'
        print("ngrok no está instalado o no está en PATH; el QR HTTPS no estará disponible.")
        return

    try:
        ngrok_process = subprocess.Popen(
            [ngrok_path, 'http', '8080'],
            stdin=subprocess.DEVNULL,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except OSError as error:
        ngrok_status = 'failed'
        print(f"No se pudo iniciar ngrok: {error}")
        return

    ngrok_status = 'starting'
    for _ in range(30):
        if ngrok_process.poll() is not None:
            ngrok_status = 'failed'
            print("ngrok terminó antes de crear el túnel. Comprueba que la cuenta esté autenticada.")
            return
        if get_ngrok_url():
            ngrok_status = 'ready'
            print("Túnel HTTPS de ngrok listo.")
            return
        time.sleep(0.5)

    print("ngrok sigue iniciando; la página detectará la URL HTTPS en cuanto esté disponible.")


def stop_ngrok_tunnel():
    if ngrok_process is None or ngrok_process.poll() is not None:
        return
    ngrok_process.terminate()
    try:
        ngrok_process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        ngrok_process.kill()
        ngrok_process.wait(timeout=5)


atexit.register(stop_ngrok_tunnel)


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

@app.route('/connection-info')
def connection_info():
    ngrok_url = get_ngrok_url()
    if ngrok_url:
        return jsonify(mobileUrl=f'{ngrok_url}/mando', connectionType='ngrok', ngrokStatus='ready')
    return jsonify(
        mobileUrl=f'http://{get_lan_ip()}:8080/mando',
        connectionType='lan',
        ngrokStatus=ngrok_status,
    )

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
    if not isinstance(payload, dict):
        return "El cuerpo debe ser un objeto JSON", 400

    datos_actuales[source] = json.dumps(payload, separators=(',', ':'))
    ultima_lectura[source] = time.monotonic()
    return "OK", 200

@app.route('/stream')
def stream():
    source = request.args.get('source', 'esp')
    if source not in datos_actuales:
        return "Fuente no válida", 400

    def generar_eventos():
        while True:
            yield f"data: {datos_actuales[source]}\n\n"
            time.sleep(0.05)

    return Response(generar_eventos(), mimetype='text/event-stream')

if __name__ == '__main__':
    hilo_udp = threading.Thread(target=escuchar_udp_descubrimiento, daemon=True)
    hilo_udp.start()
    hilo_ngrok = threading.Thread(target=start_ngrok_tunnel, daemon=True)
    hilo_ngrok.start()
    local_ip = get_lan_ip()
    print("Servidor listo (ESP + móvil).")
    print("Juego en este ordenador: http://localhost:8080")
    print(f"Mando móvil: http://{local_ip}:8080/mando")
    app.run(host='0.0.0.0', port=8080, threaded=True)
