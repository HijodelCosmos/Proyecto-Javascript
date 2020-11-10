
/*Este programa consiste en aplicar el test de ansiedad de hamilton(HARS) a un paciente, el profesional va a ir completando
 los datos del paciente durante una entrevista. Comenzado el test, va completando el grado de intensidad que percibe (de 0 a 4)
 en los 14 items que corresponden a distintos sintomas de ansiedad. EL test es muy simple ya que su principal funcionalidad
 es para seguir el progreso de las terapias o tener una vision global del estadao del paciente
 Los items 1,2,3,4,5,6 y 14 corresponden a sintomaas psiquicos; y los items 7,8,9,10,11,12 y 13 son sintomas somáticos
 El programa suma las respuestas y devuelve el grado de gravedad de ansiedad y la necesidad de tratamiento*/


/*Creadores de objeto*/
function PlanillaDePaciente(nombre,edad,sexo,eMail,resultadosEscalaHars){
    this.nombre=nombre;
    this.edad=edad;
    this.sexo=sexo;
    this.eMail=eMail;
    this.resultadosEscalaHars=resultadosEscalaHars; /*Propiedad privada y corresponde al resultado total del test*/
}

function EscalaHars(fechaDeTesteo,puntajeDeAnsiedadPsiquica,puntajeDeAnsiedadSomatica,ansiedadTotal){
    this.fecha=fechaDeTesteo;
    this.aPsiquica=puntajeDeAnsiedadPsiquica;
    this.aSomatica=puntajeDeAnsiedadSomatica;
    this.ansiedadTotal=ansiedadTotal;
}


//Defino las variables de Scope Global
var items = []
var ansiedadPsiquica=0;
var ansiedadSomatica=0;
var puntajeTotalHars=0;


//Variables DOM
const descripcion = document.getElementById("descripcionHars");
const formPaciente = document.getElementById("formPaciente")
const preguntasHars = document.getElementById("pregutasHars");
const resultadosHarsHtml = document.getElementById("resultadosHars");

const nivelesDeAnsiedadHtml=document.getElementById("nivelesAnsiedad");
const resultadoPrincipalHtml= document.getElementById("resultadoPrincipal");
const resultadoAPsiquicaHtml=document.getElementById("resultadoPsi");
const resultadoASomaticaHtml=document.getElementById("resultadoSom");
    //La Sig Variable, es un array con el nombre de las clases de los imputs radio
const clasesRadiosRespuesta = ["gradoAnsiedadI1","gradoAnsiedadI2","gradoAnsiedadI3","gradoAnsiedadI4","gradoAnsiedadI5","gradoAnsiedadI6","gradoAnsiedadI7","gradoAnsiedadI8","gradoAnsiedadI9","gradoAnsiedadI10","gradoAnsiedadI11","gradoAnsiedadI12","gradoAnsiedadI13","gradoAnsiedadI14"]

//Creo los objetos de Scope Global
var paciente = new PlanillaDePaciente();
var resultadosEscalaHars= new EscalaHars();



/*==================FUNCIONES DEL TEST HARS=================*/

function cargarPaciente(){

    descripcion.classList.replace('d-block','d-none');
    formPaciente.classList.replace('d-none','d-block');
}
//Funcion asignada a un botton para comenzar el test
//Por ahora solo esconde la descripcion y muestra las preguntas
function comenzarHars(){
    logPaciente();
    formPaciente.classList.replace('d-block','d-none')
    preguntasHars.classList.replace('d-none','d-block')
}


function mostrarResultados(){
    respuestasHars();
    harsResultados(resultadosEscalaHars);
    preguntasHars.classList.replace('d-block','d-none')
    resultadosHarsHtml.classList.replace('d-none','d-block')
}


/*Funcion para que el usuario cargue los datos del paciente*/

function logPaciente(){
    paciente.nombre = document.getElementById("inputNombre").value;
    paciente.edad = document.getElementById("inputEdad").value;
    paciente.sexo = document.getElementById("inputSexo").value;
    paciente.eMail = document.getElementById("inputEmail").value;
    paciente.hars = null;

    sessionStorage.setItem('nombrePaciente',paciente.nombre);
    console.log(paciente.nombre+"\n"+paciente.edad+"\n"+paciente.sexo+"\n"+paciente.eMail);
}


//~~ESTA FUNCION RECORRE TODOS LOS IMPUTS Y ASIGNA LOS VALORES A UN ARRAY EN LA POSICION CORRESPONDIENTE~~
function respuestasHars(){
    //Este for recorre un array con los nombre de las 14 clases que van a tener los 5 radios dentro de cada uno de los 14 item
    //y asigna el nombre de cada clase a la variable RadiosRespuesta
    for (i=0;i<clasesRadiosRespuesta.length;i++){
        let radiosRespuesta = document.getElementsByClassName(clasesRadiosRespuesta[i])
        let numerodeItem = i+1 ;//Esta var es solamente para ayudarme en la consola
    
        // Como cada clase posee 5 radios con su nombre, con este for, recorro los 5 imputs
        //y con un if me encargo de capturar el valor del radio que este tildado y agregarlo al array items
        for (j=0; j<5; j++){
            if (radiosRespuesta[j].checked){
                console.log("El item numero "+numerodeItem+" tuvo la respuesta "+radiosRespuesta[j].value);
                items[i] = radiosRespuesta[j].value;
            }
        }

        //Este if sirve para validar que todos los items tengan un radio checkeado
        //En caso de no no ser así llamo a la funcion alerta, que abre una ventana de alerta
        if(items[i] == null){
            console.log("El item numero "+numerodeItem+" no tiene respuesta")
            alertaValidacionRadios();
            break
        }
    }
    console.log(items)

    //Aca divido el array item en dos array en base a la categoria de cada pregunta
    //Al final asigne las variables al revés y quedó bien jaja
    //Tampoco termino de entender por que despues del splice, se me duplica el elemento 13 del array items (por eso el .pop) 
    let itemsAnsiedadSomatica = items.splice(6,7,items[13]);
    items.pop()
    let itemsAnsiedadPsiquica =items;

    console.log(itemsAnsiedadSomatica)
    console.log("ansiedadPsi "+ itemsAnsiedadPsiquica)
    console.log("ansiedadSo "+ itemsAnsiedadSomatica)
 
    //Sumo de los items de cada categoría
    for(i=0; i < itemsAnsiedadPsiquica.length; i++){
        ansiedadPsiquica = parseInt(ansiedadPsiquica) + parseInt(itemsAnsiedadPsiquica[i])
    };
    for(i=0; i < itemsAnsiedadSomatica.length; i++){
        ansiedadSomatica = parseInt(ansiedadSomatica) + parseInt(itemsAnsiedadSomatica[i])
    };
    
    //Asigno las propiedades al objeto
    resultadosEscalaHars.aPsiquica=ansiedadPsiquica
    resultadosEscalaHars.aSomatica=ansiedadSomatica
    resultadosEscalaHars.ansiedadTotal=parseInt(ansiedadPsiquica)+parseInt(ansiedadSomatica)
}


//Esta funcion interpreta los resultados para devolver al usuario el tipo de síntomas que tiene el paciente
function harsResultados(objetoEscalaHars){
    let texto
    switch (objetoEscalaHars.ansiedadTotal>-1){

        case objetoEscalaHars.ansiedadTotal == 0:
            texto = "El paciente no presenta sintomás de Ansiedad, sus puntajes son de 0 en todos los items.";
            break;

        case objetoEscalaHars.ansiedadTotal < 17:
            texto ="El paciente posee niveles de severidad de Ansiedad leves:";
            break;

        case objetoEscalaHars.ansiedadTotal > 17 && objetoEscalaHars.ansiedadTotal < 24:
            texto ="Los niveles de Ansiedad van de moderados a severos:";
            break;

        case objetoEscalaHars.ansiedadTotal > 24 && objetoEscalaHars.ansiedadTotal < 56:
            texto =" Los niveles de Ansiedad son muy severos e incapacitantes:";
            break;
    }
    //imprimo el texto correspondiente en mi HTML
    let textoNivelesDeAnsiedad= document.createTextNode(texto);
    nivelesDeAnsiedadHtml.appendChild(textoNivelesDeAnsiedad);

    //Si el puntaje es distinto de 0 los muestra en el HTML
    if(objetoEscalaHars.ansiedadTotal != 0){
        let texto1="Resultado Total: "+objetoEscalaHars.ansiedadTotal+" puntos"
        let texto2="Ansiedad Psíquica: "+objetoEscalaHars.aPsiquica+" puntos";
        let texto3="Ansiedad Somática: "+objetoEscalaHars.aSomatica+" puntos";

        let textoResultadoTotal=document.createTextNode(texto1)
        let textoAPsicquica=document.createTextNode(texto2);
        let textoASomatica=document.createTextNode(texto3);

        resultadoPrincipalHtml.appendChild(textoResultadoTotal);
        resultadoAPsiquicaHtml.appendChild(textoAPsicquica);
        resultadoASomaticaHtml.appendChild(textoASomatica);
    }
 
}


//Esta función es para agregar una ventana de alerta en mi HTML cuando falta algun item de responder
function alertaValidacionRadios(){
    const nodoMain = document.getElementById("main");
    let agregarAlert= document.createElement('div');

    agregarAlert.classList.add("alert","alert-danger","alert-dismissible","fade","show","alerta");
    agregarAlert.setAttribute('role', 'alert');
    agregarAlert.innerHTML = '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Quedan Items sin responder!</strong>';

    nodoMain.appendChild(agregarAlert)

}