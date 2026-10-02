from flask import Flask, request, Response
import time
import socket
import threading

app = Flask(__name__, static_folder='.', static_url_path='')
datos_actuales = "{}"

def escuchar_udp_descubrimiento():
    puerto_udp = 8888
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.bind(("0.0.0.0", puerto_udp))
    print(f"Escuchando gritos del ESP8266 en el puerto UDP {puerto_udp}...")
    
    while True:
        data, addr = sock.recvfrom(1024)
        mensaje = data.decode('utf-8').strip()
        
        if mensaje == "GORRITO_BUSCANDO_JUEGO":
            print(f"¡Gorrito encontrado en la IP {addr[0]}! Enviando respuesta...")
            sock.sendto(b"JUEGO_AQUI", addr)

hilo_udp = threading.Thread(target=escuchar_udp_descubrimiento, daemon=True)
hilo_udp.start()

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/datos', methods=['POST'])
def recibir_datos():
    global datos_actuales
    datos_actuales = request.get_data(as_text=True)
    #print("Datos del MCU:", datos_actuales)
    return "OK", 200

@app.route('/stream')
def stream():
    def generar_eventos():
        ultimo_enviado = ""
        while True:
            if datos_actuales != ultimo_enviado:
                yield f"data: {datos_actuales}\n\n"
                ultimo_enviado = datos_actuales
            time.sleep(0.1) 
    return Response(generar_eventos(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, threaded=True)
