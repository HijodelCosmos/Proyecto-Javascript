
/*Este programa consiste en aplicar el test de ansiedad de hamilton(HARS) a un paciente, el profesional va a ir completando
 los datos del paciente durante una entrevista. Comenzado el test, va completando el grado de intensidad que percibe (de 0 a 4)
 en los 14 items que corresponden a distintos sintomas de ansiedad. EL test es muy simple ya que su principal funcionalidad
 es para seguir el progreso de las terapias o tener una vision global del estadao del paciente
 Los items 1,2,3,4,5,6 y 14 corresponden a sintomaas psiquicos; y los items 7,8,9,10,11,12 y 13 son sintomas somáticos
 El programa suma las respuestas y devuelve el grado de gravedad de ansiedad y la necesidad de tratamiento*/
 const db = firebase.firestore();

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
var decicionesUsuario;




//Variables DOM
const descripcion = $("#descripcionHars");
const formPaciente = $("#formPaciente");
const preguntasHars = $("#pregutasHars");
const resultadosHarsHtml = $("#resultadosHars");

descripcion.show();
formPaciente.hide();
preguntasHars.hide();
resultadosHarsHtml.hide();


const nivelesDeAnsiedadHtml=$("#nivelesAnsiedad");
const resultadoPrincipalHtml= $("#resultadoPrincipal");
const resultadoAPsiquicaHtml=$("#resultadoPsi");
const resultadoASomaticaHtml=$("#resultadoSom");
//La Sig Variable, es un array con el nombre de las clases de los imputs radio
const clasesRadiosRespuesta = ["gradoAnsiedadI1","gradoAnsiedadI2","gradoAnsiedadI3","gradoAnsiedadI4","gradoAnsiedadI5","gradoAnsiedadI6","gradoAnsiedadI7","gradoAnsiedadI8","gradoAnsiedadI9","gradoAnsiedadI10","gradoAnsiedadI11","gradoAnsiedadI12","gradoAnsiedadI13","gradoAnsiedadI14"];

//Creo los objetos de Scope Global
var paciente = new PlanillaDePaciente();
var resultadosEscalaHars= new EscalaHars();



//<<<<<<<<<<<<<<<<<<<Api!>>>>>>>>>>>>>>>>>>

   $.ajax({
       method:'GET',
       url:"https://api.unsplash.com/photos/random/?query=happy&client_id=pwD9cff2DmbKNg_DPRlurONhO_2rhFH1JDXG_WUN5o4",
       success:function(photo){
           console.log(photo)
           $("#imagenApi").attr("src",photo.urls.small)
       }
   })
   
//<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>

/*~~~EVENTOS~~~*/
    //Asignada a un boton para cargar los datos del paciente
    function cargarPaciente(){

        $(descripcion).fadeOut();
        $(formPaciente).delay(500).fadeIn();
    }

    //Asignada a un boton para comenzar el test
    function comenzarHars(){
        logPaciente();
        $(formPaciente).fadeOut();
        $(preguntasHars).fadeIn();
    }

    //Asignada a un boton para obtener resultados, mostrarlos
    //y subir todos los datos al LocalStorage (mi DB provisoria)
    function mostrarResultados(){
        respuestasHars();

        //checkeo que no queden intems sin responder
        if (decicionesUsuario.length==14){
            harsResultados(resultadosEscalaHars);
            guardarPlanilla();
            $(preguntasHars).fadeOut();
            $(resultadosHarsHtml).delay(300).fadeIn();
        }
        
    }
/*~~~~~~~~~~~~*/


/*==================FUNCIONES DEL TEST HARS=================*/

    /*Funcion para que el usuario cargue los datos del paciente*/
    function logPaciente(){
        paciente.nombre = document.getElementById("inputNombre").value;
        paciente.edad = document.getElementById("inputEdad").value;
        paciente.sexo = document.getElementById("inputSexo").value;
        paciente.eMail = document.getElementById("inputEmail").value;
        paciente.resultadosEscalaHars = null;

        sessionStorage.setItem('nombrePaciente',paciente.nombre);
    }


    //Esta función guarda los datos en el local storage
    function guardarPlanilla(){
        //convierto el objeto resultadosEscalaHars a Json y lo meto dentro del objeto paciente
        let jsonHars = JSON.stringify(resultadosEscalaHars);
        paciente.resultadosEscalaHars=jsonHars;

        let jsonPaciente = JSON.stringify(paciente);
        let numeroDePlanillas = localStorage.getItem('Cantidad de Planillas');
        if(numeroDePlanillas==null){
            numeroDePlanillas=0
        }
        numeroDePlanillas = parseInt(numeroDePlanillas)+1;

        localStorage.setItem('Paciente Nro'+numeroDePlanillas , jsonPaciente)
        localStorage.setItem('Cantidad de Planillas',numeroDePlanillas)
    }

    //~~ESTA FUNCION RECORRE TODOS LOS IMPUTS Y ASIGNA LOS VALORES A UN ARRAY EN LA POSICION CORRESPONDIENTE~~
    function respuestasHars(){


        decicionesUsuario = $( "input:checked.gradoAnsiedad" );

        for (let i = 0; i < decicionesUsuario.length; i++) {

            items.push(decicionesUsuario[i].value);
        }
        if (decicionesUsuario.length<14){
            return alertaValidacionRadios();
        }
        console.log(decicionesUsuario)

        console.log(items)

        //Aca divido el array item en dos array en base a la categoria de cada pregunta
        let itemsAnsiedadSomatica = items.splice(6,7,items[13]);
        items.pop()
        let itemsAnsiedadPsiquica =items;

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
        resultadosEscalaHars.aPsiquica=ansiedadPsiquica;
        resultadosEscalaHars.aSomatica=ansiedadSomatica;
        resultadosEscalaHars.ansiedadTotal=parseInt(ansiedadPsiquica)+parseInt(ansiedadSomatica);
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
        $(nivelesDeAnsiedadHtml).append(textoNivelesDeAnsiedad);

        //Si el puntaje es distinto de 0 los muestra en el HTML
        if(objetoEscalaHars.ansiedadTotal != 0){
            let texto1="Resultado Total: "+objetoEscalaHars.ansiedadTotal+" puntos"
            let texto2="Ansiedad Psíquica: "+objetoEscalaHars.aPsiquica+" puntos";
            let texto3="Ansiedad Somática: "+objetoEscalaHars.aSomatica+" puntos";

            let textoResultadoTotal=document.createTextNode(texto1)
            let textoAPsicquica=document.createTextNode(texto2);
            let textoASomatica=document.createTextNode(texto3);

            $(resultadoPrincipalHtml).append(textoResultadoTotal);
            $(resultadoAPsiquicaHtml).append(textoAPsicquica);
            $(resultadoASomaticaHtml).append(textoASomatica);
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