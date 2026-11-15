# Cartas de armas para La llamada de Cthulhu

Mazo imprimible en español con 81 cartas de armas para *La llamada de
Cthulhu*, séptima edición. Cada carta reúne los datos necesarios durante la
partida —habilidad, daño, alcance, usos, cargador, coste y porcentaje de
defecto— junto con una ilustración del arma.

El proyecto usa [Squib](https://squib.rocks/), una herramienta escrita en Ruby,
para generar automáticamente:

- los frentes y dorsos individuales en PNG;
- un PDF A4 con los frentes, distribuido en páginas de 3 × 3 cartas;
- un PDF A4 con los dorsos preparados para impresión dúplex.

Es un recurso no oficial creado por aficionados. Las atribuciones y licencias
de las imágenes se encuentran en `CREDITS.md` y
`assets/weapons/licencias.txt`.

## Requisitos

- Ruby 2.7 o posterior;
- Squib 0.19;
- Rake;
- las bibliotecas nativas de Cairo, Pango y GdkPixbuf requeridas por Squib.

En Debian, Ubuntu y Linux Mint se pueden instalar las dependencias con:

```bash
sudo apt update
sudo apt install ruby ruby-dev build-essential \
  libcairo2-dev libpango1.0-dev libgdk-pixbuf-2.0-dev
sudo gem install squib rake --no-document
```

Para comprobar que Squib está disponible:

```bash
ruby -e "require 'squib'; puts Squib::VERSION"
```

## Generar las cartas

Clona el repositorio y entra en su directorio:

```bash
git clone https://github.com/elettrico/cthulhu-cartas-armas.git
cd cthulhu-cartas-armas
```

Comprueba primero que estén disponibles todas las imágenes indicadas por la
planilla y genera después el mazo:

```bash
rake check
rake
```

Los archivos generados aparecen en `output/`:

- `armas_frentes.pdf`: frentes en hojas A4;
- `armas_dorsos.pdf`: dorsos reflejados para impresión dúplex;
- `cards/front_*.png`: frentes individuales;
- `cards/back_*.png`: dorsos individuales.

Para borrar las salidas generadas:

```bash
rake clean
```

## Impresión

Imprime los PDF a tamaño real o al 100 %, sin usar «ajustar a página». Antes de
imprimir todo el mazo conviene hacer una prueba con una hoja para comprobar la
orientación y el borde de giro que utiliza la impresora al imprimir a doble
cara.

## Modificar el mazo

Los datos de las cartas están en `data/armas.xlsx`. El archivo puede editarse
con LibreOffice Calc o cualquier programa compatible con XLSX. Debe conservar
los nombres de las columnas porque `deck.rb` los utiliza para componer las
cartas. Squib 0.19 admite XLSX y CSV directamente, pero no ODS.

Para forzar un salto de línea en el título, hay que insertarlo directamente en
la celda de la columna `Nombre`. En LibreOffice Calc se hace editando la celda,
colocando el cursor en el punto de corte y pulsando `Ctrl+Enter`.

### Formato de `armas.xlsx`

La primera fila contiene los encabezados y cada fila siguiente representa una
carta. Los nombres de las columnas distinguen mayúsculas y minúsculas y no
deben cambiarse.

| Columna | Contenido |
| --- | --- |
| `Nombre` | Título de la carta. Puede contener un salto de línea manual para controlar dónde se divide un título largo. |
| `Habilidad` | Habilidad base utilizada para atacar, por ejemplo `Arma corta`, `Fusil`, `Lanzar` o `Artillería`. |
| `Dano` | Daño del arma, escrito con la notación de dados del juego. Cuando varía según la distancia, los valores se separan con `/`, por ejemplo `4D10 / 2D10 / 1D10`. |
| `Alcance` | Alcance o alcances correspondientes al daño. Los valores múltiples se escriben en el mismo orden y se separan con `/`, por ejemplo `3 / 6 / 9 m`. |
| `Usos` | Cadencia o número de ataques posibles, usando la notación del juego, como `1`, `1 (3)`, `1/2`, `ráfaga 3` o `fuego automático`. |
| `Carg` | Capacidad del cargador o forma de carga, como `6`, `30/200`, `individual`, `carga automática` o `un solo uso`. |
| `Coste` | Precio del arma. Cuando aparecen dos importes separados por `/`, corresponden normalmente al coste en los años 20 y al coste actual. También admite texto libre como `N / A` o `rara`. |
| `FD` | Valor de defecto o fallo del arma. Una tirada igual o superior a este valor provoca un encasquillamiento o avería, según las reglas. |
| `epoca` | Periodo en el que está disponible, sin el prefijo `Época:`, por ejemplo `años 20`, `actual`, `rara` o una combinación. |
| `im` | Identificador del archivo de imagen. El generador toma el nombre sin extensión y busca el PNG correspondiente en `assets/weapons/`. |
| `tipo` | Categoría utilizada para elegir el dorso `assets/backs/back_<tipo>.png`. Los valores actuales son `pistol`, `rifle`, `shotgun`, `submachinegun`, `assaultrifle`, `machinegun` y `explosive`. |
| `Nota` | Aclaración opcional que aparece debajo de la imagen. Si está vacía, la imagen puede ocupar más altura. |

En los campos con varios valores, la posición debe coincidir. Por ejemplo,
`Dano = 4D10 / 2D10 / 1D10` y `Alcance = 3 / 6 / 9 m` significan 4D10 hasta
3 m, 2D10 hasta 6 m y 1D10 hasta 9 m.

Después de modificar la planilla, ejecuta nuevamente:

```bash
rake check
rake
```

Para cambiar el aspecto de las cartas, edita `layout.yml`. Las imágenes de las
armas se guardan en `assets/weapons/` como PNG con fondo transparente.

## Estructura del proyecto

- `data/armas.xlsx`: datos de las 81 armas;
- `deck.rb`: composición y generación de las cartas;
- `layout.yml`: posiciones, tamaños, tipografías y colores;
- `config.yml`: configuración general de Squib;
- `assets/weapons/`: ilustraciones normalizadas de las armas;
- `assets/backs/`: símbolos utilizados en los dorsos;
- `scripts/check_assets.rb`: validación ejecutada por `rake check`;
- `_workbench/`: fuentes editables y herramientas de mantenimiento; no es
  necesaria para generar el mazo.
