# <img src="https://github.com/fini03/3D-Tetris-WebGL/blob/main/tetris-icon.png" width=30px> 3D Tetris WebGL

This is a game developed for the course "GFX - Foundations of Computer Graphics" at the University of Vienna. The objectives of this task was to create a 3D tetris game to understand 3D transforms, 3D viewing pipelines, collision detection and try out WebGL. By default the VAO_CUBE is selected which means the tetraminos are cubes.

## Usage and additional remarks
Please serve from a webserver: `python -m http.server`
For the shadow maps this [tutorial](https://xem.github.io/articles/webgl-guide-part-2.html#3b). The `unpackDepth` method and also the basic.frag shader were also taken from this tutorial. Certain shadow artifacts don't show up in the phong shading because of the [bias calculation](https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping).
There is also a "cheating mode" which has been added to make testing easier. If activated (click on the checkbox) you can pause the game (gravity) and translate/rotate your object easier to the desired position. Please note that pressing 'Spacebar' won't work in this mode so you will need to unpause the game.

## 🎮 Controls
* `cw` - clockwise
* `ccw` - counter clockwise

### 👾 Game Settings
| Key                           | Description                           	      |
|-------------------------------|------------------------------------------------ |
| <kbd>P</kbd>                  | Pause / Unpause the game                        |
| <kbd>G</kbd>                  | Toggle 3D grid                         	      |
| <kbd>F</kbd>                  | Switch between Gouraud & Phong Shading          |
| <kbd>G</kbd>                  | Switch between Orthographic & Perspective View  |
| <kbd>+</kbd>                  | Zoom In                                         |
| <kbd>-</kbd>                  | Zoom Out                                        |
<br/>


### 🎥 Camera
#### Movement
| Key              | Description                                                          |
|------------------|--------------------------------------------------------------------- |
| <kbd>I</kbd>     | Rotate the camera ccw on the X-Axis around the center of the grid    |
| <kbd>K</kbd>     | Rotate the camera cw on the X-Axis around the center of the grid     |
| <kbd>J</kbd>     | Rotate the camera ccw on the Y-Axis around the center of the grid    |
| <kbd>L</kbd>     | Rotate the camera cw on the Y-Axis around the center of the grid     |
| <kbd>U</kbd>     | Rotate the camera ccw on the Z-Axis around the center of the grid    |
| <kbd>O</kbd>     | Rotate the camera cw on the Z-Axis around the center of the grid     |
<br/>

#### 🖱️ Mouse Control
| Movement              | Description                                                         |
|-----------------------|---------------------------------------------------------------------|
| ←🖱️                   | Rotate the camera cw on the Y-Axis around the center of the grid    |
| 🖱️→                   | Rotate the camera ccw on the Y-Axis around the center of the grid   |
<br/>

## <img src="https://github.com/fini03/3D-Tetris-WebGL/blob/main/tetracube.png" width=30px> Tetracubes
#### Movement
| Key              | Description                               |
|------------------|------------------------------------------ |
| <kbd>🡅</kbd>    | Move the cube in the negative Z direction |
| <kbd>🡇</kbd>    | Move the cube in the positive Z direction |
| <kbd>🡄</kbd>    | Move the cube in the negative X direction |
| <kbd>🡆</kbd>    | Move the cube in the positive X direction |
| <kbd>Space</kbd> | Let the cube drop down                    |
<br/>

#### 😵‍💫 Rotation
| Key                           | Description                           	|
|-------------------------------|-----------------------------------------|
| <kbd>X</kbd>                  | Rotate the cube ccw around the X-Axis 	|
| <kbd>⇧</kbd> + <kbd>X</kbd> 	| Rotate the cube cw around the X-Axis  	|
| <kbd>Y</kbd>                  | Rotate the cube ccw around the Y-Axis 	|
| <kbd>⇧</kbd> + <kbd>Y</kbd>  	| Rotate the cube cw around the Y-Axis  	|
| <kbd>Z</kbd>                  | Rotate the cube ccw around the Z-Axis 	|
| <kbd>⇧</kbd> + <kbd>Z</kbd> 	| Rotate the cube cw around the Z-Axis  	|
<br/>

#### 🎭 Shapes
> Please note: if you don't switch back to tetracubes afterwards (pressing the same key), you might need to press the key `n` twice to switch to the among-us mode

| Key                           | Description                           	              |
|-------------------------------|------------------------------------------------------ |
| <kbd>B</kbd>                  | Switch to rendering cylinder instead of tetracubes 	  |
| <kbd>N</kbd>                 	| Switch to rendering among-us instead of tetracubes  	|
# tetris_ihc

## Usar el móvil como alternativa al ESP

El ESP sigue siendo la fuente principal y está seleccionada por defecto. La conexión del giroscopio es opcional: el juego inicia cuando la cámara y el modelo de gestos están listos, aunque no haya ESP ni móvil conectados. El giroscopio puede seleccionarse o configurarse desde los controles durante la partida. No se solicita acceso al micrófono.

1. Instala y autentica ngrok una vez en el ordenador (`ngrok config add-authtoken TU_TOKEN`, usando el token de tu cuenta) y asegúrate de que el comando `ngrok` esté en el `PATH`.
2. Inicia el servidor desde la carpeta del proyecto: `./venv/bin/python server.py` (o activa tu entorno Python y ejecuta `python server.py`). El servidor inicia el túnel HTTPS de ngrok automáticamente y lo cierra al detenerse.
3. Abre `http://localhost:8080` en el ordenador. El juego y el ESP siguen usando el puerto 8080; la dirección del ESP continúa siendo `/datos`.
4. La pantalla inicia las verificaciones automáticamente y solicita permiso para usar la cámara. El juego no espera una conexión del giroscopio.
5. El tutorial prueba primero el giroscopio solo si está conectado; después muestra los cuatro gestos reconocidos por la cámara. La pieza responde en el tablero mientras el tutorial mantiene la gravedad pausada.
6. Para usar el móvil como giroscopio, abre los controles del juego, selecciona **Móvil** y escanea el QR HTTPS de mando.
7. En el móvil pulsa **Iniciar sensor** y, si quieres, **Calibrar centro** manteniendo el teléfono en posición neutral. También puedes volver a seleccionar **ESP** en los controles. Las dos fuentes se mantienen separadas.

Si no hay un túnel ngrok disponible, el panel indica si falta instalar ngrok o autenticar la cuenta. No se muestra un QR HTTP porque los navegadores móviles suelen bloquear los sensores en conexiones no seguras.

Pruebas rápidas desde otra terminal:

```sh
# La ruta existente del ESP (source=esp es el valor predeterminado)
curl -X POST -H 'Content-Type: application/json' \
  -d '{"x":0.5,"y":0,"z":0}' http://localhost:8080/datos

# La fuente móvil, separada de los datos del ESP
curl -X POST -H 'Content-Type: application/json' \
  -d '{"gyro":{"x":20,"y":0,"z":0}}' \
  'http://localhost:8080/datos?source=mobile'
```

El juego escucha la fuente seleccionada en `/stream?source=esp` o `/stream?source=mobile`.

> Los movimientos de las flechas del juego mueven la pieza cuando está activado **Activate cheatmode**, tal como en los controles de teclado existentes.
