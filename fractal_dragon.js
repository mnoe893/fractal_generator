class Punto {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  get_x(){
    return this.x;
  }
  get_y(){
    return this.y;
  }
  set_x(x){
    this.x = x;
  }
  set_y(y){
    this.y = y;
  }
  rotar_punto() {
    let buffer = this.x;
    this.x = this.y;
    this.y = -buffer;
  }
  rotar_punto_anti() {
    let buffer = this.x;
    this.x = -this.y;
    this.y = buffer;
  }
  copy() {
    return new Punto(this.x, this.y);
  }
  cambiar_origen(nuevo_origen){ // Cambio la referencia de origen del punto
    this.x -= nuevo_origen.get_x();
    this.y -= nuevo_origen.get_y();
  }
}
// Inicializo el array de un fractal listo para iterarlo
function inicializar(ctx, canvas, largo_trazo) {
  let puntos = [];
  const origen = new Punto(0, 0);
  const semilla = new Punto(0, -largo_trazo);
  puntos.push(origen);
  puntos.push(semilla);
  for (let i = 0; i < puntos.length; i++) { // Cambio origen a ultimo punto
    puntos[i].cambiar_origen(puntos[puntos.length - 1]);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform antes de centrar
  ctx.translate(canvas.width / 2, canvas.height / 2); //Coloco el origen en el centro del canvas

  return puntos;
}

// Itera mi fractal (copia, rota, concatena)
function iterar_fractal(puntos){
  let nuevo_trazo = puntos.map(p => p.copy()); // Copio array de trazos
  for (let p of nuevo_trazo) //Roto el array copiado 90°
      p.rotar_punto();
  nuevo_trazo.reverse(); // Obtengo trazo rotado con el orden correcto  
  nuevo_trazo = nuevo_trazo.slice(1); // si concateno ambos arrays sin borrar esto tendria un punto repetido en el valor medio
  puntos = puntos.concat(nuevo_trazo); // Junto ambos trazos y los vuelvo uno
  cambiar_origen_arr(puntos,puntos[puntos.length - 1]); // Cambio punto origen al ultimo del trazo
  return puntos;
}

// Rota todos mis puntos 90°
/*Podria utilizar rotar_punto*/
function rotar_arr_horario(puntos){
    let centro = puntos.at(-1).copy();
    console.log("centro antes x:"+centro.get_x());
    trasladar_arr(puntos, -centro.get_x(), -centro.get_y())
    for (let p of puntos){
      p.rotar_punto();
    }
    trasladar_arr(puntos, centro.get_x(), centro.get_y())
    console.log("centro despues x:"+centro.get_x());
    return puntos;
}
function rotar_arr_antihorario(puntos){
    let centro = puntos.at(-1).copy();
    console.log("centro antes x:"+centro.get_x());
    trasladar_arr(puntos, -centro.get_x(), -centro.get_y())
    for (let p of puntos){
      p.rotar_punto_anti();
    }
    trasladar_arr(puntos, centro.get_x(), centro.get_y())
    console.log("centro despues x:"+centro.get_x());
    return puntos;
}

// Cambio el centro de las coordenadas de mis puntos (usado para iterar)
function cambiar_origen_arr(puntos, nuevo_origen){
    for (i = 0; i < puntos.length; i++) {
        puntos[i].cambiar_origen(nuevo_origen); //Aplico cambio de origen a todos los puntos del arr
    }
}

// Imprimo array de puntos en constola (para debuggear)
function print_puntos(puntos){
  let text = ""
  for (let p of puntos){
    text = text.concat("x:"+p.get_x()+"-y:"+p.get_y()+"\n");
  }
  console.log(text);
}

// Dibujo inmediatamente la figura, sin animacion
function imprimirTrazo(ctx, puntos, color, strokeWidth){
    for(let i = 0; i < puntos.length-1; i++){
        let p1 = puntos[i];
        let p2 = puntos[i + 1];
        ctx.beginPath();
        ctx.moveTo(p1.get_x(), p1.get_y());
        ctx.lineTo(p2.get_x(), p2.get_y());
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.stroke();
    }
}
function trasladar_arr(puntos, dx, dy){
    for(const p of puntos){
        p.set_x(p.get_x() + dx);
        p.set_y(p.get_y() + dy);
    }
}
// Creates the array of points for the given iterations, trace lenght and center
function crear_dragon(canvas,ctx,iteraciones,largo_trazo,centro){
    let arr = inicializar(ctx, canvas, largo_trazo);
    // Generar iteraciones
    for(let i = 0; i < iteraciones; i++){
      arr = iterar_fractal(arr);
    }

    trasladar_arr(arr, centro.get_x(), centro.get_y());
    return arr;
}
// Moves the fractal when center is changed
function move_dragon(canvas,ctx,arr,centro,ancho_trazo,color){
  trasladar_arr(arr, centro.get_x(), centro.get_y());
  imprimirTrazo(ctx, arr, color, ancho_trazo);
  return arr;
}
// Elimina los puntos que esten muy lejos del canvas para evitar que un fractal
// tarde mucho tiempo en llegar a ser visible
function acotar_dragon_a_canvas(puntos, ancho, alto){
  let length = puntos[0].get_x() - puntos[1].get_x();
  if(length !== 0){
    length = Math.abs(length);
  }
  else{
    length = Math.abs(puntos[0].get_y() - puntos[1].get_y());
  }
  x_max = ancho/2 + length;
  y_max = alto/2 + length;

  return puntos.filter(p => Math.abs(p.get_x()) <= x_max && Math.abs(p.get_y()) <= y_max);
}

function limpiarCanvas(ctx, canvas) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let animationId = null;

function animarTrazo(ctx, puntos, color, strokeWidth, velocidad = 2) {
  let puntos_local = puntos.map(p => new Punto(p.get_x(), p.get_y())); //copy not reference, because of @cotar_dragon_a_canvas()

  if (animationId) {
    cancelAnimationFrame(animationId); // If animating, cancel it
  }

  if (puntos_local.length < 2) return; // Simple validation of the array

  puntos_local = acotar_dragon_a_canvas(puntos_local, canvas.width, canvas.height); // Gets rid of dots outside of the window
  console.log("center: "+puntos_local.at(-1).get_x()+";"+puntos_local.at(-1).get_y());
  console.log("largo"+puntos_local.length);
  let i = 0;
  let t = 0;

  function animarSegmento() {

    if (i >= puntos_local.length - 1) return;

    const p1 = puntos_local[i];
    const p2 = puntos_local[i + 1];

    const x = p1.get_x() + (p2.get_x() - p1.get_x()) * t;
    const y = p1.get_y() + (p2.get_y() - p1.get_y()) * t;

    ctx.beginPath();
    ctx.moveTo(p1.get_x(), p1.get_y());
    ctx.lineTo(x, y);

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    t += 0.05 * velocidad;

    if (t >= 1) {

      // Completar segmento exacto
      ctx.beginPath();
      ctx.moveTo(p1.get_x(), p1.get_y());
      ctx.lineTo(p2.get_x(), p2.get_y());

      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();

      t = 0;
      i++;
    }

    animationId = requestAnimationFrame(animarSegmento);
  }

  animarSegmento();
}

/*
FUNCIONES RAND Y AUTOGENERACION
*/

// Me otorga un punto randomizado dentro del canvas
function origen_rand(canvas){
  let centro_x = Math.floor(Math.random() * canvas.width/2*0.8) - canvas.width/2*0.8;
  let centro_y = Math.floor(Math.random() * canvas.height/2*0.8) - canvas.height/2*0.8;
  return new Punto(centro_x, centro_y);
}

// Itera un fractal entre 4 y 8 veces
function iterar_rand(puntos){
    let cant_iteraciones = Math.floor(Math.random() * 8) + 3;
    while(cant_iteraciones > 0){
        puntos = iterar_fractal(puntos);
        cant_iteraciones--;
    }
    return puntos;
}
// Divide mi canvas en varias secciones y retorna el punto central a cada region
function obtenerCentros(canvas, cant_filas, cant_columnas) {
  ctx.translate(canvas.width / 2, canvas.height / 2); //Coloco el origen en el centro del canvas
  const cellWidth = canvas.width / cant_columnas;
  const cellHeight = canvas.height / cant_filas;

  const centros = [];
  for (let row = 0; row < cant_filas; row++) {
    for (let col = 0; col < cant_columnas; col++) {
      const centroX = -canvas.width / 2  + cellWidth  * (col + 0.5);
      const centroY = -canvas.height / 2 + cellHeight * (row + 0.5);
      centros.push(new Punto(centroX, centroY));
    }
  }
  return centros;
}

// Dibuja los centros como un punto rojo (para debuggear)
function dibujarCentros(centros){
    centros.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.get_x(), c.get_y(), 5, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
    });
}
// Genera la cantidad y cualidad especificada de fractales de dragon
  /*
  Centros: puntos finales para los fractales
  canvas: canvas donde dibujar los fractales, determinado con element id
  ctx: Siempre sera canvas.getContext("2d")
  largo, ancho trazo: largo de cada trazo y ancho de dichos trazos en px
  velocidad: que tan rapido se quieren ilustrar los dragones, a mayor numero, mayor velocidad
  color: color de los dragones*/
function randomizar_dragones(centros, canvas, ctx, largo_trazo, ancho_trazo, velocidad, color){
    let arrays = [];
    // Genero los fractales
    for (let i = 0; i < centros.length; i++) {
    let arr = inicializar(ctx, canvas, largo_trazo - Math.floor(Math.random() * largo_trazo * 0.50));
    // Para que los largos de trazo sean cte:
    //let arr = inicializar(ctx, canvas, largo_trazo);
    arr = iterar_rand(arr);
    if(i%2){
      arr = rotar_arr(arr);
    }
    cambiar_origen_arr(arr, centros[i]);
    acotar_dragon_a_canvas(arr, canvas.width, canvas.height); //Elimino puntos que esten muy lejos del canvas
    arrays.push(arr);
    }

    //Dibujo los fractales
    arrays.forEach(arr => {
        const color_selec = color[Math.floor(Math.random() * color.length)];
        animarTrazo(ctx, arr, color_selec, ancho_trazo, velocidad);
    });
}
function fadeAway(){
    let alpha = 1.0;
    ctx.globalAlpha = alpha; // Opacidad 100%
    const interval = setInterval(function(){
        //drawText();
        animarTrazo(ctx, arr, color_selec, ancho_trazo, velocidad);
        ctx.globalAlpha = alpha;
        alpha -= 0.02;
        if(alpha < 0){
            clearInterval(interval);
            ctx.clearRect(0,0,canvas.width,canvas.height);
        }
    },50); // Tiempo de fade

}

