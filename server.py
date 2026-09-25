from flask import Flask, request, Response
import time

# Configura Flask para servir tus archivos HTML, JS y CSS desde la carpeta actual
app = Flask(__name__, static_folder='.', static_url_path='')

datos_actuales = "{}"

@app.route('/')
def index():
    return app.send_static_file('index.html')

# 1. Recibe los datos de la placa ESP (POST)
@app.route('/datos', methods=['POST'])
def recibir_datos():
    global datos_actuales
    datos_actuales = request.get_data(as_text=True)
    print("📡 Datos del MCU:", datos_actuales)
    return "OK", 200

# 2. Reenvía los datos a tu página web en tiempo real (Server-Sent Events)
@app.route('/stream')
def stream():
    def generar_eventos():
        ultimo_enviado = ""
        while True:
            # Solo envía datos si hay una nueva lectura del giroscopio
            if datos_actuales != ultimo_enviado:
                yield f"data: {datos_actuales}\n\n"
                ultimo_enviado = datos_actuales
            time.sleep(0.1) # Evita saturar el procesador de tu Mac
            
    return Response(generar_eventos(), mimetype='text/event-stream')

if __name__ == '__main__':
    print("✅ Servidor listo.")
    print("👉 Abre tu juego en: http://localhost:8080")
    print("👉 La placa ESP debe enviar datos a: http://10.92.127.220:8080/datos")
    app.run(host='0.0.0.0', port=8080, threaded=True)