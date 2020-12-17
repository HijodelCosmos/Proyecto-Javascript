
//Variables de mi DB
const db = firebase.firestore();


/*Creadores de objeto*/
function PlanillaDePaciente(nombre,dni,edad,sexo,eMail,resultadosEscalaHars){
    this.nombre=nombre;
    this.dni=dni;
    this.edad=edad;
    this.sexo=sexo;
    this.eMail=eMail;
    this.resultadosEscalaHars=resultadosEscalaHars; /*Propiedad privada y corresponde al resultado total del test*/
}

function EscalaHars(fechaDeTesteo,puntajeDeAnsiedadPsiquica,puntajeDeAnsiedadSomatica,ansiedadTotal,gravedadDeSintomas){
    this.fecha=fechaDeTesteo;
    this.aPsiquica=puntajeDeAnsiedadPsiquica;
    this.aSomatica=puntajeDeAnsiedadSomatica;
    this.ansiedadTotal=ansiedadTotal;
    this.sintomas=gravedadDeSintomas;
}


//Defino las variables de Scope Global
var items = []
var ansiedadPsiquica=0;
var ansiedadSomatica=0;
var puntajeTotalHars=0;
var decicionesUsuario;
//Creo los objetos de Scope Global
var paciente = new PlanillaDePaciente();
var resultadosEscalaHars= new EscalaHars();




//***Variables DOM***
//Secciones
const nodoMain = $("#main");
const descripcion = $("#descripcionHars");
const formPaciente = $("#formPaciente");
const preguntasHars = $("#pregutasHars");
const resultadosHarsHtml = $("#resultadosHars");
const tablaPacientes = $('#datosDePacientes');

//Botones
const btnComenzarTest =$("#comenzarTest");
const btnCargarPaciente = $("#cargarPaciente");
const btnResultados = $("#mostrarResultados");
//Resultados
const nivelesDeAnsiedadHtml=$("#nivelesAnsiedad");
const resultadoPrincipalHtml= $("#resultadoPrincipal");
const resultadoAPsiquicaHtml=$("#resultadoPsi");
const resultadoASomaticaHtml=$("#resultadoSom");

/*<<<<<<<<<<<<<<<<<<< API>>>>>>>>>>>>>>>>>>>>>
   $.ajax({
       method:'GET',
       url:"https://api.unsplash.com/photos/random/?client_id=pwD9cff2DmbKNg_DPRlurONhO_2rhFH1JDXG_WUN5o4",
       client_id:"pwD9cff2DmbKNg_DPRlurONhO_2rhFH1JDXG_WUN5o4",
       success:function(photo){
           console.log(photo)
           $("#imagenPrueba").attr("src",photo.urls.small)
       }
   })
*/
/*~~~EVENTOS SPA~~~*/
    descripcion.show();
    formPaciente.hide();
    preguntasHars.hide();
    resultadosHarsHtml.hide();

    //Comenzar el test y ver formPaciente
    $(btnComenzarTest).click(()=>{
        $(descripcion).fadeOut();
        $(formPaciente).delay(500).fadeIn();
    })

    //Cargar paciente y comenzar el test
    $(btnCargarPaciente).click(()=>{
        logPaciente();
        $(formPaciente).fadeOut();
        $(preguntasHars).fadeIn();
    })

    //Obtener y mostrar resultados
    $(btnResultados).click(()=>{
        respuestasHars();
        //checkeo que no queden intems sin responder
        if (decicionesUsuario.length==14){
            harsResultados(resultadosEscalaHars);
            $(preguntasHars).fadeOut();
            $(resultadosHarsHtml).delay(300).fadeIn();
            //Subo los datos a mi DB
            subirPaciente(paciente)
        }
    })
/*~~~~~~~~~~~~*/

/*==================FUNCIONES DEL TEST HARS=================*/

    /*Funcion para que el usuario cargue los datos del paciente*/
    function logPaciente(){
        paciente.nombre = $("#inputNombre").val().toLowerCase();
        paciente.dni = $("#inputDni").val();
        paciente.edad = $("#inputEdad").val();
        paciente.sexo = $("#inputSexo").val();
        paciente.eMail = $("#inputEmail").val();
        paciente.resultadosEscalaHars = null;

        sessionStorage.setItem('nombrePaciente',paciente.nombre);
        console.log("Nombre de Paciente: "+paciente.nombre)
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
        items.pop();
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

        //Borro el alert de validación en caso de que exista
        $(".alertValidacion").fadeOut();
        $(nodoMain).remove(".alertValidacion")
    }

    //Esta funcion interpreta los resultados para devolver al usuario el tipo de síntomas que tiene el paciente
    function harsResultados(objetoEscalaHars){
        let texto
        switch (objetoEscalaHars.ansiedadTotal>-1){

            case objetoEscalaHars.ansiedadTotal == 0:
                texto = "El paciente no presenta sintomás de Ansiedad, sus puntajes son de 0 en todos los items.";
                resultadosEscalaHars.sintomas="No presenta síntomas";
                break;

            case objetoEscalaHars.ansiedadTotal < 17:
                texto ="El paciente posee niveles de severidad de Ansiedad leves:";
                resultadosEscalaHars.sintomas="Presenta síntomas leves";
                break;

            case objetoEscalaHars.ansiedadTotal > 17 && objetoEscalaHars.ansiedadTotal < 24:
                texto ="Los niveles de Ansiedad van de moderados a severos:";
                resultadosEscalaHars.sintomas="Presenta síntomas de moderados o severos";
                break;

            case objetoEscalaHars.ansiedadTotal > 24 && objetoEscalaHars.ansiedadTotal < 56:
                texto =" Los niveles de Ansiedad son muy severos e incapacitantes:";
                resultadosEscalaHars.sintomas="Presenta síntomas de severos a incapacitantes";
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
/*========FUNCIONES UTILES========*/
//Esta función es para agregar una ventana de alerta en mi HTML cuando falta algun item de responder
    function alertaValidacionRadios(){
        
        const alertValidacion= document.createElement('div');

        $(alertValidacion).addClass("alert alert-danger alert-dismissible fade show alerta alertValidacion");
        $(alertValidacion).attr('role','alert');
        $(alertValidacion).html('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button><strong>Quedan Items sin responder!</strong>');

        $(nodoMain).append($(alertValidacion).hide());
        $(alertValidacion).delay('500').fadeIn();
    }
    //Esta función guarda datos en el local storage
    //Fuera de uso por ahora
function guardarPlanilla(){
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
//Esta función usa Expreciones regulares para poner la primera letra de cada palabra en mayuscula
function pasarStrMayuscula(string) {
    let strMayus= string.replace(/\b[a-z]/g, function(letter) { 
        return letter.toUpperCase()}
        );
    return strMayus
}
//Aplicar la Biblioteca dataTable a mi Tabla de pacientes
function aplicarDataTable() {
    $('#tablaPacientes').DataTable({
    //Cambio el lenguaje a español
        "language": {
                "lengthMenu": "Mostrar _MENU_ registros",
                "zeroRecords": "No se encontraron resultados",
                "info": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                "infoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                "infoFiltered": "(filtrado de un total de _MAX_ registros)",
                "sSearch": "Buscar:",
                "oPaginate": {
                    "sFirst": "Primero",
                    "sLast":"Último",
                    "sNext":"Siguiente",
                    "sPrevious": "Anterior"
                    },
                    "sProcessing":"Procesando...",
            }
    });
}


//==============================BASE DE DATOS============================

//Estas si o sí tienen que estar en funcion de flecha (no termino de entender por que)
const getPacientes= () => db.collection("pacientes").get();
const onGetPacientes= (callback)=> db.collection("pacientes").onSnapshot(callback);
const getUnPaciente = (id) => db.collection("pacientes").doc(id).get()

function editarPacienteDB(id,pacienteActualizado){
    db.collection('pacientes').doc(id).update(pacienteActualizado)
}
//funcion para borrar de la base de datos
function borrarPacienteDB(id){
    db.collection('pacientes').doc(id).delete();
}

//Subo los obj pacientes a mi CloudFireStore 
function subirPaciente(objPaciente){
    db.collection('pacientes').doc().set({
        nombre: objPaciente.nombre,
        dni: objPaciente.dni,
        edad: objPaciente.edad,
        sexo: paciente.sexo,
        eMail: paciente.eMail,
        escalaHars:{
            'resultadoAnsiedadPsiquica': resultadosEscalaHars.aPsiquica,
            'resultadoAnsiedadSomatica': resultadosEscalaHars.aSomatica,
            'resultadoAnsiedadTotal': resultadosEscalaHars.ansiedadTotal,
            'gravedadDeSintomas': resultadosEscalaHars.sintomas,
        }
    })
}

//Obtener datos de la nube e insertarlos en la tabla
window.addEventListener('DOMContentLoaded', async(e) => {

    await onGetPacientes((querySnapshot)=>{
        tablaPacientes.html('')
        //Este forEach recorre cada objeto paciente traido de la nube y le crea todos sus elementos en el DOM
        querySnapshot.forEach(doc => {
            const paciente=doc.data();
    
            //Identifica de forma unica cada elemento en el dom que corresponde a cada paciente
            paciente.id=doc.id; 
    
            //Paso las primeras letras del nombre a Mayúsculas EJ: Pepito Pedro
            let nombrePaciente = pasarStrMayuscula(paciente.nombre)
    
            //Inserto en el DOM los datos de los pacientes dentro de una tabla
            tablaPacientes.append(
                `<tr class="rowPaciente">
                    <th>${nombrePaciente}</th>
                    <td>${paciente.dni}</td>
                    <td>${paciente.edad}</td>
                    <td>${paciente.sexo}</td>
                    <td>${paciente.eMail}</td>
                    <td>
                        <button type="button" class="btnTrigger btn btn-primary" data-id="${paciente.id}" data-toggle="modal" data-target="#modalPaciente${paciente.id}">
                        Más
                        </button>
                        <div class="modal" id="modalPaciente${paciente.id}" tabindex="-1" role="dialog" aria-labelledby="modalPacienteLabel" aria-hidden="true">
                            <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                <h3 class="modal-title" id="modalPacienteLabel${paciente.id}">${nombrePaciente}</h3>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                </div>
                                <div id="modal-body-${paciente.id}" class="modal-body">
                                <div id="modalBodyDatos${paciente.id}">
                                    <dl>
                                        <dt>Datos Personales:</dt>
                                        <dd class="ml-3">Nombre: ${nombrePaciente}</dd>
                                        <dd class="ml-3">DNI: ${paciente.dni}</dd>
                                        <dd class="ml-3">Edad: ${paciente.edad}</dd>
                                        <dd class="ml-3">Sexo: ${paciente.sexo}</dd>
                                        <dd class="ml-3">Email: ${paciente.eMail}</dd>
                                    </dl>
                                    <dl>
                                        <dt>Resultados Escala Hars:</dt>
                                        <dd class="ml-3">${paciente.escalaHars.gravedadDeSintomas}</dd>
                                        <dd class="ml-3">Ansiedad Total: ${paciente.escalaHars.resultadoAnsiedadTotal}</dd>
                                        <dd class="ml-3">Ansiedad Psíquica: ${paciente.escalaHars.resultadoAnsiedadPsiquica}</dd>
                                        <dd class="ml-3">Ansiedad Psíquica: ${paciente.escalaHars.resultadoAnsiedadSomatica}</dd>
                                    </dl>
                                </div>
                                </div>
                                <div class="modal-footer" id="modal-footer-${paciente.id}">
                                <div id="bnts-datos-${paciente.id}">
                                    <button type="button" class="btn btn-primary btnEditar" data-id="${paciente.id}">Editar</button>
                                    <button type="button" class="btn btn-danger btnBorrar" data-id="${paciente.id}" data-dismiss="modal">Borrar</button>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </td>
                </tr>`)
    
            //Inserto un form para Editar los Datos y lo oculto
            $(`#modal-body-${paciente.id}`).append(`<form id="formModalPaciente-${paciente.id}" class="justify-content-center align-content-center">
                <input id="inputNombre-${paciente.id}" type="text" class="inputPaciente d-block mx-auto" aria-describedby="nombrePaciente" value="${nombrePaciente}">
                <input id="inputDni-${paciente.id}" type="number" class="inputPaciente d-block mx-auto" aria-describedby="dniPaciente" value="${paciente.dni}">
                <input id="inputEdad-${paciente.id}" type="number" class="inputPaciente d-block mx-auto inputEdad" aria-describedby="edadPaciente" value="${paciente.edad}">
                <select id="inputSexo-${paciente.id}" class="d-block mx-auto inputSexo" name="sexo">
                    <option value="${paciente.sexo}" selected hidden class="etiquetaSelect mx-auto">${paciente.sexo}</option>
                    <option value="Femenino" >Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                </select>
                <input id="inputEmail-${paciente.id}" type="email" class="inputPaciente d-block mx-auto" value="${paciente.eMail}">
                </form>`);
            $(`#formModalPaciente-${paciente.id}`).hide();
    
            //Inserto botones para el form editar y los oculto
            $(`#modal-footer-${paciente.id}`).append(
                `<div id="btns-editar-${paciente.id}">
                    <button type="button" class="btn btn-primary btnGuardar" data-id="${paciente.id}" data-dismiss="modal">Guardar Cambios</button>
                    <button type="button" class="btn btn-danger btnCancelar" data-id="${paciente.id}" data-dismiss="modal">Cancelar</button>
                </div>`);
            $(`#btns-editar-${paciente.id}`).hide();

        })


        //Borrar datos
        const btnsBorrar = document.querySelectorAll('.btnBorrar'); //Si lo selecciono con jQuery el forEach no lo interpreta como un array
        //Este evento recorre todos los botones de borrar de cada paciente y dispara la funcion borrar de la DB
        btnsBorrar.forEach(btn => {
            btn.addEventListener('click',async (e) =>{
                await borrarPacienteDB(e.target.dataset.id);
            })
        })
        //Cambiar el modal a modo Edicion
        const btnsEditar = document.querySelectorAll(".btnEditar")
        btnsEditar.forEach(btn => {
            btn.addEventListener('click', e =>{
                let id= e.target.dataset.id
                //Primero cambio la interfase del DOM
                $(`#modalBodyDatos${id}`).fadeOut();
                $(`#bnts-datos-${id}`).fadeOut();
                $(`#formModalPaciente-${id}`).delay(1000);
                $(`#formModalPaciente-${id}`).fadeIn(1000);
                $(`#btns-editar-${id}`).delay(1000);
                $(`#btns-editar-${id}`).fadeIn();
                $(`#modalPacienteLabel${id}`).html('Editar datos del Paciente');
            })
        })

        //Guardar datos Editados
        const btnsGuardar = document.querySelectorAll(".btnGuardar");
        btnsGuardar.forEach(btn => {
            btn.addEventListener('click',async(e) =>{
                let id= e.target.dataset.id;
                await editarPacienteDB(id,{
                    nombre:$(`#inputNombre-${id}`).val(),
                    dni: $(`#inputDni-${id}`).val(),
                    edad: $(`#inputEdad-${id}`).val(),
                    sexo: $(`#inputSexo-${id}`).val(),
                    eMail: $(`#inputEmail-${id}`).val(),})
            })
        })

        //Cerrar el modal y volver a la interfase de datos en vez del Form para editar
        const btnsCancelar = document.querySelectorAll(".btnCancelar");
        btnsCancelar.forEach(btn => {
            btn.addEventListener('click', async(e) =>{
                let id= e.target.dataset.id;
                //Esto es para vovler a poner el nombre en el modal
                let doc= await getUnPaciente(id)
                let nombre = pasarStrMayuscula(doc.data().nombre)

                $(`#formModalPaciente-${id}`).hide();
                $(`#btns-editar-${id}`).hide();
                $(`#modalBodyDatos${id}`).show();
                $(`#bnts-datos-${id}`).show();
                $(`#modalPacienteLabel${id}`).html(`${nombre}`);
            })
        })

    })
})


//=============================================================================

