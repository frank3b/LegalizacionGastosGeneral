/**
 * 
 */

function validarUsuario(){  
	
	try {
		$.mobile.loading('show');
	    limpiarMensaje( $('#mensaje') );
	    
	    var usuario = $('#usuario').val();
	    var password = $('#password').val();
	    
	    if(usuario != null && password != null && usuario != '' && password != ''){
	        
	        
	        var promise = Kinvey.User.logout({
	            success: function() {
	                    console.log("Desconectando");
	                    validarRol(usuario, password);
	            },
	            error: function(e) {
	                    console.log("Usuario no conectado");
	                    validarRol(usuario, password);
	            }
			});
	        
	    } else {
	        agregarMensaje($('#mensaje'), 'W', 'Debe ingresar el nombre de usuario y la contrase\u00F1a.');
	        $.mobile.loading('hide');
	    }  
	} catch (e) {
		console.log(error);
		agregarMensaje($('#mensaje'), 'E', 'Error de conexi\u00F3n, verifique por favor.');
		$.mobile.loading('hide');
	}
    
}

function validarRol(usuario, password){
	Kinvey.User.login(usuario, password, {
		
        success: function() {
        console.log("Loggeado.");
        		var user = Kinvey.getActiveUser();
        
        		 var query = new Kinvey.Query();
                 query.equalTo('IdUsuario', user._id);
                 var query2 = new Kinvey.Query();
                 query2.equalTo('Rol', 'PETITIONER');
                 query.and(query2);
				Kinvey.DataStore.find('UsuarioRol', query, {
		            success: function(response) {
		            	
		            	if(response.length > 0) {
		            		cargarMotivosViaje();
		            		cargarTiposGasto();
		            		
		            		$.mobile.changePage("#listaViajesAprobados", {
	                            transition: "pop",
	                            reverse: false,
	                	        changeHash: false
		            		});
		            		
		            		var txtBienv = "Bienvenido: " + user.first_name + " " + user.last_name;
		    				$('#bienvenidaText').text(txtBienv);
		    				$.mobile.loading('hide');
		                    
		                } else {
		                	$.mobile.loading('hide');
		                	agregarMensaje($('#mensaje'), 'W', 'No tiene permisos para acceder a legalizar gastos.');
		                }                
		                $.mobile.loading('hide');
		            },
		            error: function(error){
		    			console.log(error);
		    			agregarMensaje($('#mensaje'), 'W', 'No tiene permisos para acceder a legalizar gastos..');
		    	        $.mobile.loading('hide');
					}
		        });
        
        },
        error: function(error){
        	console.log(error);
	        agregarMensaje($('#mensaje'), 'W', 'El nombre de usuario o la contrase\u00F1a introducidos no son correctos.');
	        $.mobile.loading('hide');
        }
	});
	
}

function salir(){
	$("#mensaje").hide();
	$("#mensaje").hide();
	
	$('#mensaje').text("");
	$('#mensaje').text("");
	
	$('#usuario').val("");
	$('#password').val("");
	
}

function iniciarCampos(){
	
	$("#mensaje").hide();
	$("#mensaje").hide();
	
}

function abrirAdjunto(url){
	window.open(url, '_system');
}

function limpiarMensaje(objeto){
	objeto.removeClass("error");
	objeto.removeClass("success");
	objeto.removeClass("warning");
	objeto.removeClass("info");
	objeto.text( ' ' );
	objeto.hide();
}

function agregarMensaje(objeto, tipoError, mensaje){
	objeto.removeClass("error");
	objeto.removeClass("success");
	objeto.removeClass("warning");
	objeto.removeClass("info");
	
	if(tipoError == 'W'){
		objeto.addClass('warning');
	} else if(tipoError == 'S'){
		objeto.addClass('success');
	} if(tipoError == 'I'){
		objeto.addClass('info');
	} if(tipoError == 'E'){
		objeto.addClass('error');
	}
	objeto.text( mensaje );
	objeto.show();
	
}

function tomarFoto(){
	limpiarMensaje($('#mensajeNuevoGasto'));
	//console.log('Por tomar foto...');
	if (!navigator.camera) {
		alert("Camera API not supported", "Error");
		return;
	}
	var options =   {   quality: 50,
						destinationType: Camera.DestinationType.FILE_URI,
						sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
						encodingType: 0     // 0=JPG 1=PNG
					};
	navigator.camera.getPicture(
		function(imageData) {
			
			//var item = "<img id='img' src='"+ imageData +"'/> ";
			//$('#imgFactura').append(item);
				
			gasto.factura = imageData;	
			agregarMensaje($('#mensajeNuevoGasto'), 'S', 'La imagen se ha almacenado exitosamente, puede verla con la opci\u00F3n "Ver Factura".');
		},
		function() {
			alert('Error tomando foto. Intente de nuevo más tarde', "Error");
		},
		options);
	return false;
}

function verFacturaOld(){
	limpiarMensaje($('#mensajeNuevoGasto'));
	if(gasto != null && gasto.factura != null && gasto.factura != ''){
		$('#imagenPopup').remove();
		var maxHeight = $( window ).height() - 60 + "px";
		$('#popupFoto').append("<img id=\"imagenPopup\" style=\"max-height: "+ maxHeight +";\" src='"+ gasto.factura +"'/> ");
		
		$('#popupFoto').popup( "open" );
	} else {
		$('#popupFoto').popup( "hide" );
		agregarMensaje($('#mensajeNuevoGasto'), 'W', 'Debe adjuntar primero la factura con la opci\u00F3n "Agregar Factura".');
	}
	
}

function verFactura(){
	limpiarMensaje($('#mensajeNuevoGasto'));
	if(gasto != null && gasto.factura != null && gasto.factura != ''){
		$('#popupFactura').empty();
		var maxHeight = $( window ).height() - 60 + "px";
		//$('#popupFactura').append("<img id=\"imagenPopup\" style=\"max-height: "+ maxHeight +";\" src='"+ gasto.factura +"'/> ");
		$('#popupFactura').append("<img id=\"imagenPopup\" style=\"height: 100%;\" src='"+ gasto.factura +"'/> ");
		
		$.mobile.changePage("#verFactura", {
            transition: "pop",
            reverse: false,
	        changeHash: false
		});
	} else {
		agregarMensaje($('#mensajeNuevoGasto'), 'W', 'Debe adjuntar primero la factura con la opci\u00F3n "Agregar factura".');
	}
}

var listaSolicitudes = null;
function consultarSolicitudes() {

	$("#lstViajesAprobados li").remove();

	try {
		$.mobile.loading('show');
		limpiarMensaje($('#mensajeViajes'));

		var user = Kinvey.getActiveUser();
		var query = new Kinvey.Query();
		query.equalTo('id_usuario', user.username);
		var query2 = new Kinvey.Query();
		query2.equalTo('Estado', "1");
		query.and(query2);

		Kinvey.DataStore.find('Solicitudes', query,	{
							success : function(response) {
								
								if (response.length > 0) {

									listaSolicitudes = response;

									$("#lstViajesAprobados")
											.append(
													"<li data-role=\"list-divider\" role=\"heading\">Viajes aprobados</li>")
											.listview('refresh');
									$.each(response, function(index, obj) {
										
										$.each(listaMotivos, function(index, objMotivo) {
											if(objMotivo.id_motivo == obj.id_motivo){
												var item = "<li><a href=\"#\" onclick=\"consultarGastos('" + obj.id_solicitud + "');\"> "
													+ "<p><strong>Solicitud #:</strong> " + obj.id_solicitud + "</p>"
													+ "<p><strong>Motivo:</strong> " + objMotivo.motivo +	"</p>"
													+ "<p class=\"ui-li-aside\"><strong>" + obj.fecha_inicio + "</strong></p>"
													+ "</a></li>";	
												$("#lstViajesAprobados").append(item).listview('refresh');
											}
										});

									});
									$.mobile.loading('hide');
								} else {
									agregarMensaje($('#mensajeViajes'), 'W',
											'No se encontr\u00F3 solicitudes de viaje.');
									$.mobile.loading('hide');
								}

							},
							error : function(error) {
								console.log(error);
								agregarMensaje($('#mensajeViajes'), 'E',
										'Error de conexi\u00F3n, verifique por favor.');
								$.mobile.loading('hide');
							}
						});
	} catch (e) {
		$.mobile.loading('hide');
		console.log(error);
	}
}

var idViaje = null;
var listaGastos = null;
function consultarGastos(id_solicitud) {
	
	try {
		idViaje = id_solicitud;
		
		$.mobile.changePage("#gastosViaje", {
	        transition: "pop",
	        reverse: false,
	        changeHash: false
		});
		
		$.mobile.loading('show');
		
		$("#lstGastos li").remove();
		
		limpiarMensaje($('#mensajeGastos'));
		
		var user = Kinvey.getActiveUser();
		var query = new Kinvey.Query();
		query.equalTo('id_solicitud', id_solicitud);
		query.ascending('fecha');
		
		Kinvey.DataStore.find('gastos', query, {
			success : function(response) {
				$('#txtViaje').val(id_solicitud);
				if (response.length > 0) {
					listaGastos = response;
					
					var fechaAnterior = null;
					$.each(response, function(index, obj) {
						
						if(fechaAnterior == null || fechaAnterior != obj.fecha){
							$("#lstGastos").append("<li data-role=\"list-divider\" role=\"heading\">" +
									"Gastos " + obj.fecha + "</li>").listview('refresh');
							esFechaInicial = false;
							fechaAnterior = obj.fecha;
						} 
						
						var item = "<li><a href=\"#\" onclick=\"editarGasto('" + obj._id + "');\"> "
							+ "<p><strong>" + obj.descripcion + "</strong></p>"
							+ "<p><strong>$" + obj.monto + " " + obj.tipo_moneda + "</strong></p>"
							+ "</a></li>";
						$("#lstGastos").append(item).listview('refresh');

					});
					$.mobile.loading('hide');
				} else {
					agregarMensaje($('#mensajeGastos'), 'W',
							'No se encontr\u00F3 gastos para la solicitud: ' + id_solicitud);
					$.mobile.loading('hide');
				}
			},
			error : function(error) {
				console.log(error);
				agregarMensaje($('#mensajeGastos'), 'E',
						'Error de conexi\u00F3n, verifique por favor.');
				$.mobile.loading('hide');
			}
		});
	} catch (e) {
		$.mobile.loading('hide');
		console.log(error);
	}
}

function regresarAGastos(){
	limpiarMensaje( $('#mensajeNuevoGasto') );
	gasto = null;
	limpiarNuevoGasto();
	
	consultarGastos(idViaje);
}

function nuevoGasto(){
	esNuevoGasto = true;
	gasto = {};
	$.mobile.changePage("#nuevoGasto", {
        transition: "pop",
        reverse: false,
        changeHash: false
	});
}

var esNuevoGasto = true;
var gasto = null;
function editarGasto(idGasto){
	gasto = null;
	
	$.mobile.loading('show');
	$.each(listaGastos, function(index, obj) {
		if(obj._id == idGasto){
			gasto = obj;
			
			$('#cmbClaseGasto').val(obj.tipo_gasto);
			$('#txtDescripcionGasto').val(obj.descripcion);
			$('#txtMontoGasto').val(obj.monto);
			$('#tipoMonedaSelect').val(obj.tipo_moneda);
			$('#txtFechaGasto').val(obj.fecha);
			
			esNuevoGasto = false;
			 
			$.mobile.changePage("#nuevoGasto", {
                 transition: "pop",
                 reverse: false,
     	        changeHash: false
     		});
			$.mobile.loading('hide');
		}
	});
	
}

function limpiarNuevoGasto(){
	gasto = {};
	
	$('#cmbClaseGasto').val("1").selectmenu('refresh');;
	$('#txtDescripcionGasto').val("");
	$('#txtMontoGasto').val("");
	$('#tipoMonedaSelect').val("COP").selectmenu('refresh');;
	$('#txtFechaGasto').val("");
	
	esNuevoGasto = true;
}

function guardarGasto(){
	
	try {
		limpiarMensaje($('#mensajeNuevoGasto'));
		
		var tipoGasto = $('#cmbClaseGasto').val();
		var descripcion = $('#txtDescripcionGasto').val();
		var monto = $('#txtMontoGasto').val();
		var tipoMoneda = $('#tipoMonedaSelect').val();
		var fecha = $('#txtFechaGasto').val();
		
		if(tipoGasto == null || tipoGasto == ''){
			agregarMensaje($('#mensajeNuevoGasto'), 'E', 'El campo clase de gasto es requerido.');
			$('#cmbClaseGasto').trigger("focus");
		} else if(descripcion == null || descripcion == ''){
			agregarMensaje($('#mensajeNuevoGasto'), 'E', 'El campo descripci\u00F3n es requerido.');
			$('#txtDescripcionGasto').trigger("focus");
		} else if(monto == null || monto == ''){
			agregarMensaje($('#mensajeNuevoGasto'), 'E', 'El campo monto es requerido.');
			$('#txtMontoGasto').trigger("focus");
		} else if(tipoMoneda == null || tipoMoneda == ''){
			agregarMensaje($('#mensajeNuevoGasto'), 'E', 'El campo tipo de moneda es requerido.');
			$('#tipoMonedaSelect').trigger("focus");
		} else if(fecha == null || fecha == ''){
			agregarMensaje($('#mensajeNuevoGasto'), 'E', 'El campo fecha es requerido.');
			$('#txtFechaGasto').trigger("focus");
		} else {
			$.mobile.loading('show');
			
			if(esNuevoGasto){
				gasto.id_solicitud = idViaje;
			}
			
			gasto.tipo_gasto = $('#cmbClaseGasto').val();
			gasto.descripcion = $('#txtDescripcionGasto').val();
			gasto.monto = $('#txtMontoGasto').val();
			gasto.tipo_moneda = $('#tipoMonedaSelect').val();
			gasto.fecha = $('#txtFechaGasto').val();
			
			//alert("VINCULADO MOD... " +  JSON.stringify(vinculado));
			if(esNuevoGasto){
				Kinvey.DataStore.save('gastos', gasto, {
				    success: function(response) {
				    	gasto = response;
				    	agregarMensaje($('#mensajeNuevoGasto'), 'S', 'La informaci\u00F3n se ha almacenado correctamente.');
				    	$.mobile.loading('hide');
				    	limpiarNuevoGasto();
				    },
			        error: function(error){
						console.log(error);
						agregarMensaje($('#mensajeNuevoGasto'), 'E', 'No se ha almacenado correctamente la informaci\u00F3n.');
				        $.mobile.loading('hide');
					}
				});
				
			} else {
				//alert("VINCULADO MOD... " +  JSON.stringify(vinculado));
				Kinvey.DataStore.update('gastos', gasto, {
				    success: function(response) {
						agregarMensaje($('#mensajeNuevoGasto'), 'S', 'La informaci\u00F3n se ha almacenado correctamente.');
						$.mobile.loading('hide');
				    },
			        error: function(error){
						console.log(error);
						alert(error);
				        agregarMensaje($('#mensajeNuevoGasto'), 'E', 'No se almaceno correctamente la informaci\u00F3n.');
				        $.mobile.loading('hide');
					}
				});
			}
			
		}
		
	} catch (e) {
		$.mobile.loading('hide');
		console.log(e);
		agregarMensaje($('#mensajeNuevoGasto'), 'E', 'Error en tiempo de ejecuci\u00F3n, por favor contacte el administrador.');
		alert(e);
	}
	
}

function readDataUrl(file) {
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onFileSystemSuccess, fail);
}

function onFileSystemSuccess(fileSystem) {
    console.log(fileSystem.name);
    console.log(fileSystem.root.name);
}

function fail(evt) {
    console.log(evt.target.error.code);
}

var listaMotivos = null;
function init() {
	document.addEventListener("deviceready", onDeviceReady, true);
	var promise = Kinvey.init({
        appKey    : 'kid_PPwwzftRG9',
        appSecret : 'a5f7bc254fea41da8364e4bc7064c096'
    });
    
    $("#ingresar").on("click", function() {
    	validarUsuario();
    });
    
    $(document).on("pageshow", "#listaViajesAprobados", function () {
    	consultarSolicitudes();
    });
    
    /*$("#popupFoto").on({
		popupafterclose : function() {
			document.location.href = '#nuevoGasto';
		}
	});*/
	
    $( "#popupFoto" ).on({
        popupbeforeposition: function() {
            var maxHeight = $( window ).height() - 60 + "px";
            $( "#imagenPopup" ).css( "max-height", maxHeight );
        }
    });
}

var listaTiposGastos = null;
function cargarTiposGasto()
{
	Kinvey.DataStore.find('tiposgasto', null, {
		success : function(response) {
			listaTiposGastos = null;
			listaTiposGastos = response;
		},
		error : function(error) {
			console.log(error);
		}
	});
}

function cargarMotivosViaje()
{
	Kinvey.DataStore.find('motivos', null, {
		success : function(response) {
			listaMotivos = null;
			listaMotivos = response;
		},
		error : function(error) {
			console.log(error);
		}
	});
}

function consultarNombreMotivo(idMotivo){
	
	//alert(idMotivo + '-->'+ JSON.stringify(listaMotivos));
	$.each(listaMotivos, function(index, obj) {
		if(obj.id_motivo == idMotivo){
			console.log(obj.motivo);
			return obj.motivo;
		}
	});
	
}