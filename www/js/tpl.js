function callAjax2(action,params)
{
	dump("action=>"+action);	
	
	if ( !hasConnection() ){
		toastMsg( getTrans("Not connected to internet",'no_connection') );		
		return;
	}
	
	/*params+="&lang_id="+getStorage("kr_lang_id");
	if(!empty(krms_driver_config.APIHasKey)){
		params+="&api_key="+krms_driver_config.APIHasKey;
	}		
	if ( !empty( getStorage("kr_token") )){		
		params+="&token="+  getStorage("kr_token");
	}*/
	
	params+=getParams();
	
	dump(ajax_url+"/"+action+"?"+params);
	
	ajax_request2 = $.ajax({
		url: ajax_url+"/"+action, 
		data: params,
		type: 'post',                  
		async: false,
		dataType: 'jsonp',
		timeout: 6000,
		crossDomain: true,
		 beforeSend: function() {
			if(ajax_request2 != null) {			 	
			   /*abort ajax*/
			   hideAllModal();	
	           ajax_request2.abort();
			} else {    
				/*show modal*/			   
				//loader.show();			    
			}
		},
		complete: function(data) {					
			//ajax_request2=null;   	     				
			ajax_request= (function () { return; })();
			hideAllModal();		
		},
		success: function (data) {	
			if (data.code==1){
				switch (action)
				{
					//silent
					case "updateDriverLocation":
					break;
					
					default:
					break;
				}
			}
		},
		error: function (request,error) {	        
		    hideAllModal();					
			switch (action)
			{
				case "GetAppSettings":
				case "getLanguageSettings":
				case "registerMobile":
				case "updateDriverLocation":
				break;
												
				default:
				onsenAlert( getTrans("Network error has occurred please try again!",'network_error') );		
				break;
			}
		}
	});
}
/** Atualização Master Hub (Modificação de Serviços no Aplicativo, Oculta dados do entregador, Cobrança por km adicional e dinamico, Identificação do Tipo da Entrega) **/
function formatTask(data)
{	
	var html='';
	if ( data.length>0){	
		html+='<ons-list class="shadow">';	
		
		$.each( data, function( key, val ) { 
			
			if (val.status_raw === 'unassigned' || val.status_raw === 'assigned'){			
			html+='<ons-list-item  modifier="task-list" tappable ripple onclick="showTaskAccept('+val.task_id+')" >';
			} else if (val.status_raw === 'aceito_pelo_entregador'){
			html+='<ons-list-item  modifier="task-list" tappable ripple onclick="showTaskMerchant('+val.task_id+')" >';
			} else if (val.status_raw === 'started'){
			html+='<ons-list-item  modifier="task-list" tappable ripple onclick="showTaskClient('+val.task_id+')" >';
			} else {
			html+='<ons-list-item  modifier="task-list" tappable ripple onclick="showTask('+val.task_id+')" >';
			}
			
			    html+='<ons-row>';

			        html+='<ons-col >';

			            html+='<div class="table mb10">';
			               html+='<div class="col">';
			                  html+='<span class="tag trn '+ val.trans_type_raw+' " data-trn-key="'+ val.trans_type_raw+'">'+ getTrans('Entrega ',val.trans_type)+'</span>';

			               html+='</div>';

			                   html+='<div class="col text-right">';
			                   html+="<b class='amout'>" + prettyPrice(val.valor_entrega) + "</b>";
			                   html+='</div>';
			            html+='</div>';
			html+='<div class="table" style="text-align: center; margin-top: -5px;">';
			                  html+='<span class="tag-status '+val.status_raw+'">"'+val.status+'"</span>';
			                html+='</div>';
			            html+='<div class="table">';
			                html+='<div class="col a">';
			                    html+="<img class='opaque svg-task' src='lib/images/menu--task/task-id.svg' onerror='this.src='task-id.png''>";
			                html+='</div>';
			                html+='<div class="col">';
			                    html+='<p><b class="opaque trn" data-trn-key="task_id">'+ getTrans('Task ID: ','task_id') +'</b>'+val.task_id+'</p>';
			                html+='</div>'; 
			            html+='</div>';
			           
			if (val.status_raw === 'unassigned' || val.status_raw === 'assigned'){			

			} else if (val.status_raw === 'aceito_pelo_entregador'){
				
			             if (!empty(val.merchant_name)){
					         if (!empty(val.resgate_entrega)){ 
		         html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='merchant-name.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ val.merchant_name +'</p>';
			 		 html+='<p style="font-size: 22px;">'+val.resgate_entrega+'</p>';
		             html+='</div>';
		          html+='</div>';   
				} else if (val.trans_type_raw == 'delivery' || val.trans_type_raw == 'coleta' || val.trans_type_raw == 'coleta_retorno' || val.trans_type_raw == 'pre_coleta' || val.trans_type_raw == 'pre_coleta_retorno'){
					//não mostra nada
				} else {
		         html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/merchant-name.svg' onerror='this.src='merchant-name.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="merchant_name">'+ getTrans('Merchant name: ','merchant_name') +'</b>'+val.merchant_name+'</p>';
		             html+='</div>';
		          html+='</div>';   
				}
	         }
				
			} else if (val.status_raw === 'started'){
			            html+='<div class="table">';
			                html+='<div class="col a">';
			                    html+="<img class='opaque svg-task' src='lib/images/menu--task/customer-name.svg' onerror='this.src='customer-name.png''>";
			                html+='</div>';
			                html+='<div class="col">';
			                    html+='<p><b class="opaque trn" data-trn-key="customer_name">'+ getTrans('Customer name: ','customer_name') +'</b>'+val.customer_name+'</p>';                      
			                html+='</div>';
			            html+='</div>';
				
			             if (!empty(val.merchant_name)){
					         if (!empty(val.resgate_entrega)){ 
		         html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='merchant-name.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ val.merchant_name +'</p>';
			 		 html+='<p style="font-size: 22px;">'+val.resgate_entrega+'</p>';
		             html+='</div>';
		          html+='</div>';   
				} else if (val.trans_type_raw == 'delivery' || val.trans_type_raw == 'coleta' || val.trans_type_raw == 'coleta_retorno' || val.trans_type_raw == 'pre_coleta' || val.trans_type_raw == 'pre_coleta_retorno'){
					//não mostra nada
				} else {
		         html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/merchant-name.svg' onerror='this.src='merchant-name.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="merchant_name">'+ getTrans('Merchant name: ','merchant_name') +'</b>'+val.merchant_name+'</p>';
		             html+='</div>';
		          html+='</div>';   
				}
	         }
			             if ( val.order_id>0){
			                 html+='<div class="table">';
			                     html+='<div class="col a">';
			                         html+="<img class='opaque svg-task' src='lib/images/menu--task/order-id.svg' onerror='this.src='order-id.png''>";
			                     html+='</div>';
			                     html+='<div class="col">';              
			                         html+='<p><b class="opaque trn" data-trn-key="order_id">'+ getTrans('N. do Pedido: ','order_id') +'</b>'+val.order_id+'</p>';
			                     html+='</div>';
			                  html+='</div>';
			             }
			} else {
			            html+='<div class="table">';
			                html+='<div class="col a">';
			                    html+="<img class='opaque svg-task' src='lib/images/menu--task/customer-name.svg' onerror='this.src='customer-name.png''>";
			                html+='</div>';
			                html+='<div class="col">';
			                    html+='<p><b class="opaque trn" data-trn-key="customer_name">'+ getTrans('Customer name: ','customer_name') +'</b>'+val.customer_name+'</p>';                      
			                html+='</div>';
			            html+='</div>';
				
			             if (!empty(val.merchant_name)){
					         if (!empty(val.resgate_entrega)){ 
		         html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='merchant-name.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ val.merchant_name +'</p>';
			 		 html+='<p style="font-size: 22px;">'+val.resgate_entrega+'</p>';
		             html+='</div>';
		          html+='</div>';   
				} else if (val.trans_type_raw == 'delivery' || val.trans_type_raw == 'coleta' || val.trans_type_raw == 'coleta_retorno' || val.trans_type_raw == 'pre_coleta' || val.trans_type_raw == 'pre_coleta_retorno'){
					//não mostra nada
				} else {
		         html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/merchant-name.svg' onerror='this.src='merchant-name.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="merchant_name">'+ getTrans('Merchant name: ','merchant_name') +'</b>'+val.merchant_name+'</p>';
		             html+='</div>';
		          html+='</div>';   
				}
	         }
			             if ( val.order_id>0){
			                 html+='<div class="table">';
			                     html+='<div class="col a">';
			                         html+="<img class='opaque svg-task' src='lib/images/menu--task/order-id.svg' onerror='this.src='order-id.png''>";
			                     html+='</div>';
			                     html+='<div class="col">';              
			                         html+='<p><b class="opaque trn" data-trn-key="order_id">'+ getTrans('N. do Pedido: ','order_id') +'</b>'+val.order_id+'</p>';
			                     html+='</div>';
			                  html+='</div>';
			             }
			}			
						              
			  if (val.tipo_veiculo == 'moto' || val.tipo_veiculo == 'moto+' || val.tipo_veiculo == 'carro' || val.tipo_veiculo == 'caminhao' || val.tipo_veiculo == 'bicicleta' || val.tipo_veiculo == ''){
				  if (val.tipo_veiculo == ''){
					 val.tipo_veiculo = 'Moto'; 
				  }
				html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="tipo_transportador">'+ getTrans('Tipo do Transportador: ','tipo_transportador') +'</b>'+val.tipo_veiculo+'</p>';
		             html+='</div>';
		          html+='</div>';
				} else {
				html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="tipo_transportador">'+ getTrans('Tipo do Transportador: ','tipo_transportador') +'</b>'+val.tipo_veiculo+'</p>';
		             html+='</div>';
		          html+='</div>';
				}            
			            html+='<div class="table">';
			                html+='<div class="col a">';
			                    html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-time.svg' onerror='this.src='delivery-time.png''>";
			                html+='</div>';
			                html+='<div class="col">';
			                    html+='<p><b class="opaque trn" data-trn-key="delivery_before">'+ getTrans('Delivery before: ','delivery_before') +'</b>'+val.delivery_time+'</p>';
			                html+='</div>';
			            html+='</div>';
				
			  if (val.tempo_entrega >= 0){
				html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-time.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
				  if (val.tempo_entrega != 0){
			 		 html+='<p><b class="opaque trn" data-trn-key="tempo_entrega">'+ getTrans('Tempo Total da Entrega: ','tempo_entrega') +'</b>'+ getTrans('cerca de','cerca_de') +' '+val.tempo_entrega+' minutos.</p>';
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="tempo_entrega">'+ getTrans('Tempo da Entrega: ','tempo_entrega') +'</b>'+ getTrans('tempo nao calculado','tempo_nao_calculado') +'</p>';
				  }

		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}            
			  if (val.km_entrega >= 0){
				html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-address.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
				  if (val.km_entrega != 0 || !empty(val.km_entrega)){
				  if (data.km_entrega <= 0.3){
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('por volta de 100 mts.','por_volta_de_100_mts') +'</p>';
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('por volta de','por_volta_de') +' '+val.km_entrega+' km.</p>';
				  } 
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('km nao calculado.','nao_calculado') +'</p>';
				  }

		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}        
			
			/* ocultando endereço na tela principal */
			if (val.status_raw === 'unassigned' || val.status_raw === 'assigned'){			

			} else if (val.status_raw === 'aceito_pelo_entregador'){
				
				if (val.trans_type_raw == 'delivery'){
			              
			            html+='<div class="table mb0">';
			                html+='<div class="col a">';
			                    html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-address.svg' onerror='this.src='delivery-address.png''>";
			                html+='</div>';
			                html+='<div class="col">';
			                    html+='<p><b class="opaque trn" data-trn-key="coleta_address">'+ getTrans('Coleta address: ','coleta_address') +'</b>'+val.drop_address+'</p>';
			                html+='</div>';
			            html+='</div>';
				} else if (val.trans_type_raw == 'coleta' || val.trans_type_raw == 'coleta_retorno'){
			            html+='<div class="table mb0">';
			                html+='<div class="col a">';
			                    html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-address.svg' onerror='this.src='delivery-address.png''>";
			                html+='</div>';
			                html+='<div class="col">';
			                    html+='<p><b class="opaque trn" data-trn-key="coleta_address">'+ getTrans('Coleta address: ','coleta_address') +'</b>'+val.coleta_address+'</p>';
			                html+='</div>';
			            html+='</div>';
				} else if (val.trans_type_raw == 'pre_coleta' || val.trans_type_raw == 'pre_coleta_retorno'){
			            html+='<div class="table mb0">';
			                html+='<div class="col a">';
			                    html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-address.svg' onerror='this.src='delivery-address.png''>";
			                html+='</div>';
			                html+='<div class="col">';
			                    html+='<p><b class="opaque trn" data-trn-key="coleta_address">'+ getTrans('1 Coleta address: ','pre_coleta_address') +'</b>'+val.pre_coleta_address+'</p>';
			                html+='</div>';
			            html+='</div>';
				}
				
			} else {
			              /* ocultando endereço na tela principal */
			            html+='<div class="table mb0">';
			                html+='<div class="col a">';
			                    html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-address.svg' onerror='this.src='delivery-address.png''>";
			                html+='</div>';
			                html+='<div class="col">';
			                    html+='<p><b class="opaque trn" data-trn-key="delivery_address">'+ getTrans('Delivery address: ','delivery_address') +'</b>'+val.delivery_address+'</p>';
			                html+='</div>';
			            html+='</div>';
			}
			        html+='</ons-col>';

			    html+='</ons-row>';

			html+='</ons-list-item>';
			
		});
		html+='</ons-list>';
		
	}
	return html;
}
/** Fim da atualização **/
/** Atualização Master Hub (Botão DEU RUIM, Identificação do Tipo da Entrega) **/ 
function formatTaskDetails(data)
{
	if(empty(data)){
		return '';
	}
	var html='';
	
	html+='<ons-list-item>';
	     html+='<ons-row>';
	        html+='<ons-col style="text-align:left;flex: 0 0 70%; align-self: center; max-width: 70%;">';
	        html+='<b class="uppercase">'+ getTrans('Customer Details','customer_details') +'</b>';	        
	        html+='</ons-col>';  
	        html+='<ons-col style="text-align:right;flex: 0 0 30%; max-width: 30%;">';
	html+='<p class="button-toolbar-action" id="task-action-wrap-deu-ruim" ></p>';
	        html+='</ons-col>'; 
	      html+='</ons-row>';           
	    html+='</ons-list-item>';   
	
	html+='<ons-list-item class="back-white normal-shadow normal-border-top">';
     html+='<ons-row>';
        html+='<ons-col width="100%" >';
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-android-time" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/delivery-time.svg' onerror='this.src='delivery-time.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+ data.delivery_time +'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="delivery_before">'+ getTrans('Delivery before: ','delivery_before') +'</b>'+data.delivery_time+'</p>';                      
             html+='</div>';
          html+='</div>';    
				
			  if (data.tipo_veiculo == 'moto' || data.tipo_veiculo == 'moto+' || data.tipo_veiculo == 'carro' || data.tipo_veiculo == 'caminhao' || data.tipo_veiculo == 'bicicleta' || data.tipo_veiculo == ''){
				  if (data.tipo_veiculo == ''){
					 data.tipo_veiculo = 'Moto'; 
				  }
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="tipo_transportador">'+ getTrans('Tipo do Transportador: ','tipo_transportador') +'</b>'+data.tipo_veiculo+'</p>';
		             html+='</div>';
		          html+='</div>';
				} else {
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="tipo_transportador">'+ getTrans('Tipo do Transportador: ','tipo_transportador') +'</b>'+data.tipo_veiculo+'</p>';
		             html+='</div>';
		          html+='</div>';
				}            
	
			  if (data.tempo_entrega >= 0){
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-time.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
				  if (data.tempo_entrega != 0){
			 		 html+='<p><b class="opaque trn" data-trn-key="tempo_entrega">'+ getTrans('Tempo Total da Entrega: ','tempo_entrega') +'</b>'+ getTrans('cerca de','cerca_de') +' '+data.tempo_entrega+' minutos.</p>';
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="tempo_entrega">'+ getTrans('Tempo da Entrega: ','tempo_entrega') +'</b>'+ getTrans('tempo nao calculado','tempo_nao_calculado') +'</p>';
				  }
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}            
			  if (data.km_entrega >= 0){
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-address.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
				  if (data.km_entrega != 0 || !empty(data.km_entrega)){
				  if (data.km_entrega <= 0.3){
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('por volta de 100 mts.','por_volta_de_100_mts') +'</p>';
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('por volta de','por_volta_de') +' '+data.km_entrega+' km.</p>';
				  } 
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('km nao calculado.','nao_calculado') +'</p>';
				  }
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}        
	
          html+='<div class="table mtb5">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-android-contact" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/customer-name.svg' onerror='this.src='customer-name.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+ data.customer_name +'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="customer_name">'+ getTrans('Customer name: ','customer_name') +'</b>'+data.customer_name+'</p>';
             html+='</div>';
          html+='</div>     ';    
          
          if (!empty(data.contact_number)){
	          html+='<div class="table">';
	             html+='<div class="col a">';
	             // html+='<ons-icon icon="ion-ios-telephone" size="20px"></ons-icon>';
			     html+="<img class='opaque svg-task' src='lib/images/menu--order-details/contact-number.svg' onerror='this.src='contact-number.png''>";
	             html+='</div>';
	             html+='<div class="col">';
	             // html+='<p><a class="tel" href="tel:'+data.contact_number+'">'+data.contact_number+'</a></p>';
			 	 html+='<p><b class="opaque trn" data-trn-key="contact_number">'+ getTrans('Contact number: ','contact_number') +'</b><a class="tel" href="tel:'+data.contact_number+'"></a>'+data.contact_number+'</p>';
	             html+='</div>';
	          html+='</div>     ';   
          } 
                    
         html+='</ons-col>';
         html+='<ons-col class="tag-align">';
	        html+='<span class="tag-crimson tag trn '+ data.trans_type_raw+' " data-trn-key="'+ data.trans_type_raw+'">'+ getTrans('Entrega ',data.trans_type)+'</span>';
	     html+='</ons-col>';
         
     html+='</ons-row>';
   html+='</ons-list-item>';
 
   return html;
}
/** Fim da atualização **/
/** Atualização Master Hub (Personalização - Oculta dados do entregador) **/ 
function formatTaskDetailsBlock(data)
{
	if(empty(data)){
		return '';
	}
	var html='';
	
	html+='<ons-list-item>';
	     html+='<ons-row>';
	        html+='<ons-col style="text-align:left;">';
	        html+='<b class="uppercase">'+ getTrans('Customer Details','customer_details') +'</b>';	        
	        html+='</ons-col>';  
	      html+='</ons-row>';           
	    html+='</ons-list-item>';   
	
	html+='<ons-list-item class="back-white normal-shadow normal-border-top">';
     html+='<ons-row>';
        html+='<ons-col width="100%" >';
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-android-time" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/delivery-time.svg' onerror='this.src='delivery-time.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+ data.delivery_time +'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="delivery_before">'+ getTrans('Delivery before: ','delivery_before') +'</b>'+data.delivery_time+'</p>';                      
             html+='</div>';
          html+='</div>';    
				
			  if (data.tipo_veiculo == 'moto' || data.tipo_veiculo == 'moto+' || data.tipo_veiculo == 'carro' || data.tipo_veiculo == 'caminhao' || data.tipo_veiculo == 'bicicleta' || data.tipo_veiculo == ''){
				  if (data.tipo_veiculo == ''){
					 data.tipo_veiculo = 'Moto'; 
				  }
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="tipo_transportador">'+ getTrans('Tipo do Transportador: ','tipo_transportador') +'</b>'+data.tipo_veiculo+'</p>';
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}            
	
			  if (data.tempo_entrega >= 0){
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-time.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
				  if (data.tempo_entrega != 0){
			 		 html+='<p><b class="opaque trn" data-trn-key="tempo_entrega">'+ getTrans('Tempo Total da Entrega: ','tempo_entrega') +'</b>'+ getTrans('cerca de','cerca_de') +' '+data.tempo_entrega+' minutos.</p>';
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="tempo_entrega">'+ getTrans('Tempo da Entrega: ','tempo_entrega') +'</b>'+ getTrans('tempo nao calculado','tempo_nao_calculado') +'</p>';
				  }
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}            
			  if (data.km_entrega >= 0){
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-address.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
				  if (data.km_entrega != 0 || !empty(data.km_entrega)){
				  if (data.km_entrega <= 0.3){
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('por volta de 100 mts.','por_volta_de_100_mts') +'</p>';
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('por volta de','por_volta_de') +' '+data.km_entrega+' km.</p>';
				  } 
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('km nao calculado.','nao_calculado') +'</p>';
				  }
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}        
	
          html+='<div class="table mtb5">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-android-contact" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/customer-name.svg' onerror='this.src='customer-name.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+ data.customer_name +'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="customer_name">'+ getTrans('Customer name: ','customer_name') +'</b>'+ getTrans('Clique em aceitar ','clique_aceitar') +'</p>';
             html+='</div>';
          html+='</div>';    
                    
         html+='</ons-col>';
         html+='<ons-col class="tag-align">';
	        html+='<span class="tag-crimson tag trn '+ data.trans_type_raw+' " data-trn-key="'+ data.trans_type_raw+'">'+ getTrans('Entrega ',data.trans_type)+'</span>';
	     html+='</ons-col>';
         
     html+='</ons-row>';
   html+='</ons-list-item>';
 
   return html;
}

function formatTaskDetailsMerchant(data)
{
	if(empty(data)){
		return '';
	}
	var html='';
	
	html+='<ons-list-item>';
	     html+='<ons-row>';
	        html+='<ons-col style="text-align:left;flex: 0 0 70%; align-self: center; max-width: 70%;">';
	        html+='<b class="uppercase">'+ getTrans('Customer Details','customer_details') +'</b>';	 
	        html+='</ons-col>'; 
	        html+='<ons-col style="text-align:right;flex: 0 0 30%; max-width: 30%;">';
	html+='<p class="button-toolbar-action" id="task-action-wrap-deu-ruim" ></p>';
	        html+='</ons-col>'; 
	      html+='</ons-row>';           
	    html+='</ons-list-item>';   
	
	html+='<ons-list-item class="back-white normal-shadow normal-border-top">';
     html+='<ons-row>';
        html+='<ons-col width="100%" >';
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-android-time" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/delivery-time.svg' onerror='this.src='delivery-time.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+ data.delivery_time +'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="delivery_before">'+ getTrans('Delivery before: ','delivery_before') +'</b>'+data.delivery_time+'</p>';                      
             html+='</div>';
          html+='</div>';    
				
			  if (data.tipo_veiculo == 'moto' || data.tipo_veiculo == 'moto+' || data.tipo_veiculo == 'carro' || data.tipo_veiculo == 'caminhao' || data.tipo_veiculo == 'bicicleta' || data.tipo_veiculo == ''){
				  if (data.tipo_veiculo == ''){
					 data.tipo_veiculo = 'Moto'; 
				  }
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="tipo_transportador">'+ getTrans('Tipo do Transportador: ','tipo_transportador') +'</b>'+data.tipo_veiculo+'</p>';
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}            
	
			  if (data.tempo_entrega >= 0){
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-time.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
				  if (data.tempo_entrega != 0){
			 		 html+='<p><b class="opaque trn" data-trn-key="tempo_entrega">'+ getTrans('Tempo Total da Entrega: ','tempo_entrega') +'</b>'+ getTrans('cerca de','cerca_de') +' '+data.tempo_entrega+' minutos.</p>';
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="tempo_entrega">'+ getTrans('Tempo da Entrega: ','tempo_entrega') +'</b>'+ getTrans('tempo nao calculado','tempo_nao_calculado') +'</p>';
				  }
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}            
			  if (data.km_entrega >= 0){
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-address.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
				  if (data.km_entrega != 0 || !empty(data.km_entrega)){
				  if (data.km_entrega <= 0.3){
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('por volta de 100 mts.','por_volta_de_100_mts') +'</p>';
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('por volta de','por_volta_de') +' '+data.km_entrega+' km.</p>';
				  } 
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('km nao calculado.','nao_calculado') +'</p>';
				  }
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}        
	
          html+='<div class="table mtb5">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-android-contact" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/customer-name.svg' onerror='this.src='customer-name.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+ data.customer_name +'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="customer_name">'+ getTrans('Customer name: ','customer_name') +'</b>'+ getTrans('Clique em aceitar ','clique_aceitar') +'</p>';
             html+='</div>';
          html+='</div>     ';    
          
          if (!empty(data.contact_number)){
	          html+='<div class="table">';
	             html+='<div class="col a">';
	             // html+='<ons-icon icon="ion-ios-telephone" size="20px"></ons-icon>';
			     html+="<img class='opaque svg-task' src='lib/images/menu--order-details/contact-number.svg' onerror='this.src='contact-number.png''>";
	             html+='</div>';
	             html+='<div class="col">';
	             // html+='<p><a class="tel" href="tel:'+data.contact_number+'">'+data.contact_number+'</a></p>';
			 	 html+='<p><b class="opaque trn" data-trn-key="contact_number">'+ getTrans('Contact number: ','contact_number') +'</b><a class="tel" href="tel:'+data.contact_number+'"></a>'+data.contact_number+'</p>';
	             html+='</div>';
	          html+='</div>     ';   
          } 
                    
         html+='</ons-col>';
         html+='<ons-col class="tag-align">';
	        html+='<span class="tag-crimson tag trn '+ data.trans_type_raw+' " data-trn-key="'+ data.trans_type_raw+'">'+ getTrans('Entrega ',data.trans_type)+'</span>';
	     html+='</ons-col>';
         
     html+='</ons-row>';
   html+='</ons-list-item>';
 
   return html;
}

function formatTaskDetailsClient(data)
{
	if(empty(data)){
		return '';
	}
	var html='';
	
	html+='<ons-list-item>';
	     html+='<ons-row>';
	        html+='<ons-col style="text-align:left;flex: 0 0 70%; align-self: center; max-width: 70%;">';
	        html+='<b class="uppercase">'+ getTrans('Customer Details','customer_details') +'</b>';	 
	        html+='</ons-col>'; 
	        html+='<ons-col style="text-align:right;flex: 0 0 30%; max-width: 30%;">';
	html+='<p class="button-toolbar-action" id="task-action-wrap-deu-ruim" ></p>';
	        html+='</ons-col>'; 
	      html+='</ons-row>';           
	    html+='</ons-list-item>';   
	
	html+='<ons-list-item class="back-white normal-shadow normal-border-top">';
     html+='<ons-row>';
        html+='<ons-col width="100%" >';
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-android-time" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/delivery-time.svg' onerror='this.src='delivery-time.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+ data.delivery_time +'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="delivery_before">'+ getTrans('Delivery before: ','delivery_before') +'</b>'+data.delivery_time+'</p>';                      
             html+='</div>';
          html+='</div>';    
				
			  if (data.tipo_veiculo == 'moto' || data.tipo_veiculo == 'moto+' || data.tipo_veiculo == 'carro' || data.tipo_veiculo == 'caminhao' || data.tipo_veiculo == 'bicicleta' || data.tipo_veiculo == ''){
				  if (data.tipo_veiculo == ''){
					 data.tipo_veiculo = 'Moto'; 
				  }
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="tipo_transportador">'+ getTrans('Tipo do Transportador: ','tipo_transportador') +'</b>'+data.tipo_veiculo+'</p>';
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}            
	
			  if (data.tempo_entrega >= 0){
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-time.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
				  if (data.tempo_entrega != 0){
			 		 html+='<p><b class="opaque trn" data-trn-key="tempo_entrega">'+ getTrans('Tempo Total da Entrega: ','tempo_entrega') +'</b>'+ getTrans('cerca de','cerca_de') +' '+data.tempo_entrega+' minutos.</p>';
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="tempo_entrega">'+ getTrans('Tempo da Entrega: ','tempo_entrega') +'</b>'+ getTrans('tempo nao calculado','tempo_nao_calculado') +'</p>';
				  }
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}            
			  if (data.km_entrega >= 0){
				html+='<div class="table mtb5">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--task/delivery-address.svg' onerror='this.src='vehicle.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
				  if (data.km_entrega != 0 || !empty(data.km_entrega)){
				  if (data.km_entrega <= 0.3){
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('por volta de 100 mts.','por_volta_de_100_mts') +'</p>';
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('por volta de','por_volta_de') +' '+data.km_entrega+' km.</p>';
				  } 
				  } else {
			 		 html+='<p><b class="opaque trn" data-trn-key="distancia_entrega">'+ getTrans('Percurso: ','distancia_entrega') +'</b>'+ getTrans('km nao calculado.','nao_calculado') +'</p>';
				  }
		             html+='</div>';
		          html+='</div>';
				} else {
		            //não mostra nada
				}        
	
          html+='<div class="table mtb5">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-android-contact" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/customer-name.svg' onerror='this.src='customer-name.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+ data.customer_name +'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="customer_name">'+ getTrans('Customer name: ','customer_name') +'</b>'+data.customer_name+'</p>';
             html+='</div>';
          html+='</div>     ';    
          
          if (!empty(data.contact_number)){
	          html+='<div class="table">';
	             html+='<div class="col a">';
	             // html+='<ons-icon icon="ion-ios-telephone" size="20px"></ons-icon>';
			     html+="<img class='opaque svg-task' src='lib/images/menu--order-details/contact-number.svg' onerror='this.src='contact-number.png''>";
	             html+='</div>';
	             html+='<div class="col">';
	             // html+='<p><a class="tel" href="tel:'+data.contact_number+'">'+data.contact_number+'</a></p>';
			 	 html+='<p><b class="opaque trn" data-trn-key="contact_number">'+ getTrans('Contact number: ','contact_number') +'</b><a class="tel" href="tel:'+data.contact_number+'"></a>'+data.contact_number+'</p>';
	             html+='</div>';
	          html+='</div>     ';   
          } 
                    
         html+='</ons-col>';
         html+='<ons-col class="tag-align">';
	        html+='<span class="tag-crimson tag trn '+ data.trans_type_raw+' " data-trn-key="'+ data.trans_type_raw+'">'+ getTrans('Entrega ',data.trans_type)+'</span>';
	     html+='</ons-col>';
         
     html+='</ons-row>';
   html+='</ons-list-item>';
 
   return html;
}

function formatTaskDetailsEstabelecimento(data)
{
	if(empty(data)){
		return '';
	}
	var html='';
	
	html+='<ons-list-item>';
	     html+='<ons-row>';
	        html+='<ons-col style="text-align:left;">';
	        html+='<b class="uppercase">'+ getTrans('Customer Details','customer_details') +'</b>';	        
	        html+='</ons-col>';  
	      html+='</ons-row>';           
	    html+='</ons-list-item>';   
	
	html+='<ons-list-item class="back-white normal-shadow normal-border-top">';
     html+='<ons-row>';
        html+='<ons-col width="100%" >';
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-android-time" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/delivery-time.svg' onerror='this.src='delivery-time.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+ data.delivery_time +'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="delivery_before">'+ getTrans('Delivery before: ','delivery_before') +'</b>'+data.delivery_time+'</p>';                      
             html+='</div>';
          html+='</div>';    
          
          html+='<div class="table mtb5">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-android-contact" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/customer-name.svg' onerror='this.src='customer-name.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+ data.customer_name +'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="customer_name">'+ getTrans('Customer name: ','customer_name') +'</b>'+data.customer_name+'</p>';
             html+='</div>';
          html+='</div>     ';    
                    
         html+='</ons-col>';
         html+='<ons-col class="tag-align">';
	        html+='<span class="tag-crimson tag trn '+ data.trans_type_raw+' " data-trn-key="'+ data.trans_type_raw+'">'+ getTrans('Entrega ',data.trans_type)+'</span>';
	     html+='</ons-col>';
         
     html+='</ons-row>';
   html+='</ons-list-item>';
 
   return html;
}
/** Fim da atualização **/
/*task  map*/
function TaskDetailsChevron_1(data )
{
	if(empty(data)){
		return '';
	}
	var html='';
	html+='<ons-list-item class="back-white normal-shadow" tappable onclick="viewTaskMap('+data.task_id+', '+ "'" +data.task_lat +"'" +', '+ "'" +data.task_lng +"'" +', '+ "'" + data.delivery_address + "'" + ' )"  >';
     html+='<ons-col width="90%" >     ';            
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-location" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/delivery-address.svg' onerror='this.src='delivery-address.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+data.delivery_address+'</p>';
/** Atualização Master Hub (Correção de Layout) **/
			 html+='<p><b class="opaque trn" data-trn-key="delivery_to">'+ getTrans('Delivery to: ','delivery_to') +'</b>'+data.delivery_address+'</p>';
/** Fim da atualização **/
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';

    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';
   return html;
}
/** Atualização Master Hub (Modificação de Serviços no Aplicativo) **/
/*task  map*/
function TaskDetailsChevron_1_retorno(data )
{
	if(empty(data)){
		return '';
	}
	var html='';
	html+='<ons-list-item class="back-white normal-shadow" tappable onclick="viewTaskMap('+data.task_id+', '+ "'" +data.retorno_task_lat +"'" +', '+ "'" +data.retorno_task_lng +"'" +', '+ "'" + data.retorno_address + "'" + ' )"  >';
     html+='<ons-col width="90%" >     ';            
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-location" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/delivery-address.svg' onerror='this.src='delivery-address.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+data.delivery_address+'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="retornar_para">'+ getTrans('Retornar para: ','retornar_para') +'</b>'+data.retorno_address+'</p>';
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';

    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';
	if (data.trans_type_raw == "coleta_retorno" || data.trans_type_raw == "pre_coleta_retorno"){
   return html;
	} else {
		return ''
	}
}

/*task  map*/
function TaskDetailsChevron_1_precoleta(data )
{
	if(empty(data)){
		return '';
	}
	var html='';
	html+='<ons-list-item class="back-white normal-shadow" tappable onclick="viewTaskMap('+data.task_id+', '+ "'" +data.precoleta_task_lat +"'" +', '+ "'" +data.precoleta_task_lng +"'" +', '+ "'" + data.pre_coleta_address + "'" + ' )"  >';
     html+='<ons-col width="90%" >     ';            
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-location" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/delivery-address.svg' onerror='this.src='delivery-address.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+data.delivery_address+'</p>';
			 html+='<p><b class="opaque trn" data-trn-key="1coletar_em">'+ getTrans('1ª Coleta em: ','1coletar_em') +'</b>'+data.pre_coleta_address+'</p>';
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';

    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';
	if ( data.trans_type_raw == "pre_coleta" || data.trans_type_raw == "pre_coleta_retorno"){
   return html;
	} else {
		return ''
	}
}

/*task  map*/
function TaskDetailsChevron_1_coleta(data )
{
	if(empty(data)){
		return '';
	}
	var html='';
	html+='<ons-list-item class="back-white normal-shadow" tappable onclick="viewTaskMap('+data.task_id+', '+ "'" +data.coleta_task_lat +"'" +', '+ "'" +data.coleta_task_lng +"'" +', '+ "'" + data.coleta_address + "'" + ' )"  >';
     html+='<ons-col width="90%" >     ';            
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-location" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/delivery-address.svg' onerror='this.src='delivery-address.png''>";
             html+='</div>';
             html+='<div class="col">';
             // html+='<p>'+data.delivery_address+'</p>';
	if (data.trans_type_raw == "coleta" || data.trans_type_raw == "coleta_retorno"){
			 html+='<p><b class="opaque trn" data-trn-key="coletar_em">'+ getTrans('Coletar em: ','coletar_em') +'</b>'+data.coleta_address+'</p>';
	} else {
			 html+='<p><b class="opaque trn" data-trn-key="2coletar_em">'+ getTrans('2ª Coleta em: ','2coletar_em') +'</b>'+data.coleta_address+'</p>';
	}
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';

    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';
	if (data.trans_type_raw == "coleta" || data.trans_type_raw == "coleta_retorno" || data.trans_type_raw == "pre_coleta" || data.trans_type_raw == "pre_coleta_retorno"){
   return html;
	} else {
		return ''
	}
}
/** Fim da atualização **/
/*task  description*/
function TaskDetailsChevron_2(data )
{
	if(empty(data)){
		return '';
	}
	var html='';
	html+='<ons-list-item class="back-white" tappable onclick="viewTaskDescription('+data.task_id+')"  >';
     html+='<ons-col width="90%" >     ';            
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-ios-list-outline" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/task-id.svg' onerror='this.src='task-id.png''>";
             html+='</div>';
             html+='<div class="col">';
             html+='<p>' + getTrans("Task Description","task_description") + '</p>';
             html+='<p class="opaque concat-text">'+data.task_description+'</p>';
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';

    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';
   return html;
}

/*task  add signature*/
function TaskAddSignature( data )
{
	if(empty(data)){
		return '';
	}
		
	if(data.driver_enabled_signature!=1){
	   return '';
	}
	
	dump( data.status_raw );
	
	var html='';
	html+='<ons-list-item class="back-white" tappable onclick="ShowSignaturePage('+data.task_id+','+ "'"+ data.customer_signature_url + "'" +', '+ "'" + data.status_raw + "',"+ "'"+ data.recipient_name + "'"  +'  )"  >';
     html+='<ons-col width="90%" >     ';            
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-edit" size="20px"></ons-icon>';
 		 	 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/signature.svg' onerror='this.src='signature.png''>";
             html+='</div>';
             html+='<div class="col">';
             if (data.status_raw=="inprogress"){
                 html+='<p>'+ getTrans("Add Signature",'add_signature') +'</p>';  
             } else {
             	 html+='<p>'+ getTrans("View Signature",'view_signature') +'</p>';  
             }           
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';

    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';
   
   if (data.status_raw=="inprogress" || data.status_raw=="successful"){
       return html;
   } else return '';
}

/*task history*/
function TaskDetailsChevron_3( data )
{
	if(empty(data)){		
		return '';
	}
	dump(data);
	var html='';
	html+='<ons-list-item class="back-white normal-shadow normal-border-bottom">';
     html+='<ons-col>';            
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-ios-albums-outline" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/history.svg' onerror='this.src='history.png''>";
             html+='</div>';
             html+='<div class="col">';
             html+='<b class="opaque">'+ getTrans("Task History",'task_history') +'</b>';
             html+='<div class="top10"></div>';
             
             $.each( data, function( key, val ) { 
                html+='<div class="table  equal-col">';
                
                   html+='<div class="col col-1">';
                   html+='<b class="capitalize">'+val.status+'</b>' + " " + getTrans("at",'at') + " ";
                   html+=val.date + " - ";
                   html+=val.time;
                   html+='</div>';
                   
                html+='</div>';
             }); 
                
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';    
   html+='</ons-list-item>';
   return html;
}

function taskDescription(data)
{
	if(empty(data)){
		return;
	}
	var html='';
	html+='<ons-list> ';
	   html+='<ons-list-item  modifier="task-list"  >  ';
	     html+='<ons-row>';
	       html+='<ons-col>';
	         html+='<p>'+ data.task_description +'</p>';
	       html+='</ons-col>';
	     html+='</ons-row>';
	   html+='</ons-list-item>';
	html+='</ons-list>';
	return html;
}

function OptionListTransport(fname, key, val, id )
{
	var html='';
	html+='<ons-list-item  modifier="task-list" tappable ripple onclick="setTransportType('+ "'" +  key + "'"  +', '+ "'"+ val + "'" +' ) ">';
	  html+='<label class="left">';
	    html+='<ons-input name="'+fname+'" value="'+key+'" type="radio" input-id="radio-'+id+'"></ons-input>';
	  html+='</label>';
	  html+='<label for="radio-'+id+'" class="center">';
	    html+= val;
	  html+='</label>';
	html+='</ons-list-item>';                            
	return html;
}


function OptionListLanguage(fname, key, val, id )
{
	dump( getStorage("kr_lang_id") );
	ischeck='';
	if ( getStorage("kr_lang_id") == key ){
		ischeck='checked';
	}
	var html='';
	/*html+='<ons-list-item  modifier="task-list" tappable ripple onclick="SetLanguage('+ "'" +  key + "'"  +', '+ "'"+ val + "'" +' ) ">';
	  html+='<label class="left">';
	    html+='<ons-input name="'+fname+'" '+ ischeck +'  value="'+key+'" type="radio" input-id="radio-'+id+'"></ons-input>';
	  html+='</label>';
	  html+='<label for="radio-'+id+'" class="center">';
	    html+= val;
	  html+='</label>';
	html+='</ons-list-item>'; */  

	
    html+='<ons-list-item tappable onclick="SetLanguage('+ "'" +  key + "'"  +', '+ "'"+ val + "'" +' ) " >';
      html+='<label class="left">';
        html+='<ons-radio name="'+fname+'" '+ ischeck +' input-id="lang-'+x+'" ></ons-radio>';
      html+='</label>';
      html+='<label for="lang-'+x+'" class="center">';
        html+=val;
      html+='</label>';
    html+='</ons-list-item>';
    
	return html;
}

function OrderDetails(data)
{
	if(empty(data)){
		return '';
	}
	if (data.order_id<=0){
		return '';
	}
	var html='';
	html+='<ons-list-item class="back-white" tappable onclick="ShowOrderDetails('+data.order_id+')"  >';
     html+='<ons-col width="90%" >     ';            
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-coffee" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/order-details.svg' onerror='this.src='order-details.png''>";
             html+='</div>';
             html+='<div class="col">';
             html+='<p>' + getTrans("View Order Details","view_order_details") + '</p>';             
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';

    /*html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';*/
    
    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col>';
   html+='</ons-list-item>';
   return html;
}

function formatOrderDetails(data , data2 )
{	
	if(empty(data)){
		return;
	}
	
	/*loop tru item*/
	/*settings*/
	dump(data.settings);
	if(!empty(data.settings)){
		setStorage('currency_position',data.settings.currency_position);
		setStorage('decimal_place',data.settings.decimal_place);
		setStorage('decimal_separator',data.settings.decimal_separator);
		setStorage('thousand_separator',data.settings.thousand_separator);
		setStorage('currency_set',data.settings.currency_set);
	}
	
	var item='';

	client_total = data.order_info.order_change - data.total.total;

	item+= '<div class="tablee mtb5">';
/** Atualização Master Hub (Correção de Tradução) **/
		item+='<p class="col w60 uppercase">'+ getTrans("N. do Pedido","order_id") + " " + data.order_info.order_id+'</p>'
/** Fim da atualização **/
		if (data.order_info.order_change>0){
		item+='<p class="col w40 change" style="text-align:center;">'+ getTrans("Change","change") + ": " + prettyPrice(client_total)+'</p>'
	item+= '</div>';
	}
		
	if (data2.length>0){
		$.each( data2, function( key_1, val_1 ) { 			
			item+= '<div class="table">';	   	      
	   	      item+= '<div class="col b" style="width:40%;">'+ val_1.label + '</div>';	   	     
	   	      item+= '<div class="capitalize col c">'+  val_1.value  +'</div>';
	   	   item+= '</div>';
		});
	}
		
	
	
	//alert(data.item.length);	
	//if (data.item.length>0){	
	var is_array = 2;
	
	if ( !empty(data.html)){
		item+= data.html;
	} else {
		if ( !empty(data.item)){
		   $.each( data.item, function( key, val ) {     
		   	   size='';
		   	   if( !empty(val.size_words)){
		   	   	  size = ' ('+val.size_words+')';
		   	   }
		   	   var item_total_price = parseFloat(val.qty)* parseFloat(val.discounted_price);
		   	   item+= '<div class="table">';
		   	      item+= '<div class="col a">'+ val.qty +' x</div>';
		   	      if ( !empty(val.order_notes)){
		   	      	 notes='<br/><span class="order-notes">'+val.order_notes+'</span>';
		   	         item+= '<div class="col b"><b>'+ val.item_name + size + '</b>'+ notes +'</div>';	   	     
		   	      } else {
		   	      	 item+= '<div class="col b"><b>'+ val.item_name + size + '</b></div>';	   	     
		   	      }
		   	      item+= '<div class="col c">'+  prettyPrice(item_total_price)  +'</div>';
		   	   item+= '</div>';
		   	   
		   	   if (!empty(val.cooking_ref)){
		   	   	   item+= '<p class="indent">'+val.cooking_ref+'</p>';
		   	   }
		   	   
		   	   /*ingredients*/
		   	   if (val.ingredients.length>0){	
		   	   	   item+= '<p class="indent top10"><b>'+ getTrans("Ingredients","ingredients")  +'</b></p>';
		   	   	   $.each( val.ingredients, function( key_ing, val_ing ) {     
		   	   	   	    item+= '<p class="indent">'+val_ing+'</p>';
		   	   	   });
		   	   }
	
		   	   // sub item
		   	   if ( !empty(val.new_sub_item) ){
		   	   	   $.each( val.new_sub_item, function( key_sub, val_sub ) {     	   	   	   	    
		   	   	   	    item+= '<p class="indent top10"><b>'+ key_sub  +'</b></p>';
		   	   	   	    if ( val_sub.length>0){	
		   	   	   	    $.each( val_sub, function( key_sub1, val_sub1 ) {   
		   	   	   	    	var sub_item_total_price = parseFloat(val_sub1.addon_qty)* parseFloat(val_sub1.addon_price); 
	                        item+= '<div class="table">';
					   	      item+= '<div class="col a">'+ val_sub1.addon_qty +' x</div>';
					   	      item+= '<div class="col b">'+ val_sub1.addon_name + '</div>';	   	     
					   	      item+= '<div class="col c">'+ prettyPrice(sub_item_total_price) +'</div>';
					   	   item+= '</div>';
		   	   	   	    });	
		   	   	   	    }
		   	   	   });
		   	   }	   	      	  
		   	   
		   	   item+='<div class="sep"></div>';
		   	   
		   });	
		}	
	
	
	//Total
	//item+='<div class="sep"></div>';
	
	if ( !empty(data.total) ){	
		total=data.total;		
		if (total.discounted_amount>0){
   	   	   item+= ReceiptFooter( getTrans('Discount','discount') , '('+prettyPrice(total.discounted_amount)+')' ); 
   	    }
   	    if (total.less_voucher>0){
   	   	   item+= ReceiptFooter( getTrans('Less Voucher','less_voucher') , '('+prettyPrice(total.less_voucher)+')' ); 
   	    }
   	    
   	    if (total.pts_redeem_amt>0){
   	   	   item+= ReceiptFooter( getTrans('Redeem points','redeem_points') , '('+prettyPrice(total.pts_redeem_amt)+')' ); 
   	    }
   	    
   	    item+= ReceiptFooter( getTrans('Sub Total','sub_total') , prettyPrice(total.subtotal) );   
   	    	   
   	    if (total.delivery_charges>0){
   	   	   item+= ReceiptFooter( getTrans('Delivery Fee','delivery_fee') , prettyPrice(total.delivery_charges) ); 
   	    }
   	    if (total.merchant_packaging_charge>0){
   	   	   item+= ReceiptFooter( getTrans('Packaging','packaging') , prettyPrice(total.merchant_packaging_charge) ); 
   	    }
   	    if (total.delivery_charges>0){
   	   	   item+= ReceiptFooter( getTrans('Tax','tax')+' '+total.tax_amt+'%', prettyPrice(total.taxable_total) ); 
   	    }
   	    
   	    if(!empty(total.tips)){
   	      if (total.tips>0){
   	   	     item+= ReceiptFooter( getTrans('Tips','tips')+' '+total.tips_percent+'', prettyPrice(total.tips) ); 
   	      }
   	    }
   	    
   	    if (total.total>0){
   	   	   item+= ReceiptFooter( '<b>'+ getTrans('Total','total')+'</b>', prettyPrice(total.total) ); 
   	    }
	}	
	
	} /*end html value*/
	
	
	var html='';
	html+='<ons-list>';
	   html+='<ons-list-item class="shadow" modifier="task-list"  >  ';
	     html+='<ons-row>';
	       html+='<ons-col>';
	         html+= item ;
	       html+='</ons-col>';
	     html+='</ons-row>';
	   html+='</ons-list-item>';
	html+='</ons-list>';
	return html;
}

function ReceiptFooter( label , value )
{
	item='';
    item+= '<div class="table">';
      item+= '<div class="col a"></div>';
      item+= '<div class="col b">'+label+'</div>';	   	     
      item+= '<div class="col c">'+ value  +'</div>';
    item+= '</div>';
   	return item;   
}

function prettyPrice( price )
{
	var decimal_place = getStorage("decimal_place");		
	var currency_position= getStorage("currency_position");
	var currency_symbol = getStorage("currency_set");
	var thousand_separator = getStorage("thousand_separator");
	var decimal_separator = getStorage("decimal_separator");	
	
	if(empty(currency_position)){
		currency_position='';
	}
	if(empty(decimal_place)){
		decimal_place=2;
	}
	if(empty(decimal_separator)){
		decimal_separator='.';
	}
	if(empty(thousand_separator)){
		thousand_separator='';
	}
	if(empty(currency_symbol)){
		currency_symbol='';
	}
	
	price = number_format(price,decimal_place, decimal_separator ,  thousand_separator ) ;	
	if ( currency_position =="left"){
		return currency_symbol+" "+price;
	} else {
		return price+" "+currency_symbol;
	}
}

function number_format(number, decimals, dec_point, thousands_sep) 
{
  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}

function formatNotifications(data)
{	
	if(empty(data)){
		return;
	}		
	var item='';
	var html='';
	
	if (data.length>0){	
	   html+='<ons-list>';
	   $.each( data, function( key, val ) {     
	   	   dump(val);
	   	   item='';
	   	   item+= '<p><b>'+val.push_title+'</b></p>';
	   	   item+= '<p class="top10">'+val.push_message+'</p>';
/** Atualização Master Hub (Personalização - Status) **/ 
	   	   item+= '<date class="tag-status aceito_pelo_entregador ">'+val.date_created+'</date>';
/** Fim da atualização **/
	   	   
	   	   link="";
	   	   if (val.actions!="CANCEL_TASK"){
	   	   	   link='onclick="showTask('+val.task_id+')"';
	   	   }
	   	   if (val.actions=="private" || val.actions=="bulk"){
	   	   	   link="";
	   	   }
	   	   
	   	   html+='<ons-list-item '+ link +' tappable  modifier="task-list"  >  ';
		     html+='<ons-row>';
		       html+='<ons-col>';
		         html+= item ;
		       html+='</ons-col>';
		     html+='</ons-row>';
		   html+='</ons-list-item>';
	   	   
	   });
	   html+='</ons-list>';
	   return html;
	}
	return '';	
}

function TaskDetailsChevron_4(data )
{
	if(empty(data)){
		return '';
	}
	
	if (!empty(data.drop_address)){
		resp = pickupDetails(data);
		return resp;
	}
	
	if(empty(data.merchant_id)){
		return '';
	}
	
	if(data.merchant_id<=0){
		return '';
	}	
	
	var html='';
	html+='<ons-list-item tappable onclick="viewTaskMap('+data.task_id+', '+ "'" +data.merchant_lat +"'" +', '+ "'" +data.merchant_lng +"'" +', '+ "'" + data.merchant_address + "'" + ' )"  >';
     html+='<ons-col width="90%" >     ';            
         html+='<div class="table">';
             html+='<div class="col a">';
             html+='<ons-icon icon="ion-location" size="20px"></ons-icon>';
             html+='</div>';
             html+='<div class="col">';
             html+='<p>'+data.merchant_name+" - "+data.merchant_address+'</p>';
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';
		
    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';
/** Atualização Master Hub (Modificação de Serviços no Aplicativo) **/
  if (data.trans_type_raw == "coleta" || data.trans_type_raw == "coleta_retorno" || data.trans_type_raw == "pre_coleta" || data.trans_type_raw == "pre_coleta_retorno"){  
   return '';
  } else {
	 return html; 
  }
/** Fim da atualização **/
}

function MercadoPoint_pagamento(data)
{
	if(empty(data)){
		return '';
	}
	
	var html='';
	html+='<ons-list-item tappable onclick="cobrarcomMercadoPoint('+data.task_id+', '+ "'" +data.merchant_lat +"'" +', '+ "'" +data.merchant_lng +"'" +', '+ "'" + data.merchant_address + "'" + ' )"  >';
     html+='<ons-col width="90%" >     ';            
         html+='<div class="table">';
             html+='<div class="col a">';
             html+='<ons-icon icon="ion-location" size="20px"></ons-icon>';
             html+='</div>';
             html+='<div class="col">';
             html+='<p><b>'+ getTrans('Cobrar com a Máquina de Cartão','cobrar_maquina')+'</b></p>';
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';
		
    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';

	 return html; 
}

function pickupDetails(data)
{
	var html='';
	
		html+='<ons-list-item>';
	     html+='<ons-row>';
	        html+='<ons-col style="text-align:left;">';
	        
	        if ( data.trans_type_raw=="delivery"){	        
	           html+='<b class="uppercase">'+ getTrans('Pickup Details','pickup_details') +'</b>';
	        } else {
	           html+='<b class="uppercase">'+ getTrans('Drop Details','drop_details') +'</b>';
	        }
	        
	        html+='</ons-col>';  
	      html+='</ons-row>';           
	    html+='</ons-list-item>';   
	    
	    html+='<ons-list-item class="back-white normal-shadow normal-border-top">';
	     html+='<ons-row>';
	        html+='<ons-col width="100%" >';
	        
	         if (!empty(data.merchant_name)){
/** Atualização Master Hub (Botão DEU RUIM, Modificação de Serviços no Aplicativo) **/ 
		 if (!empty(data.resgate_entrega)){ 
		         html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='merchant-name.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p style="font-size: 22px;">'+data.resgate_entrega+'</p>';
		             html+='</div>';
		          html+='</div>';   
				} else {
		         html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/merchant-name.svg' onerror='this.src='merchant-name.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="merchant_name">'+ getTrans('Merchant name: ','merchant_name') +'</b>'+data.merchant_name+'</p>';
		             html+='</div>';
		          html+='</div>';   
				}
	         } else if (!empty(data.dropoff_merchant_name)){
		 if (!empty(data.resgate_entrega)){ 
		         html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/profile--vehicle/vehicle.svg' onerror='this.src='merchant-name.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p style="font-size: 22px;">'+data.resgate_entrega+'</p>';
		             html+='</div>';
		          html+='</div>';   
				} else {
		         html+='<div class="table">';
		             html+='<div class="col a">';
		             // html+='<ons-icon icon="ion-home" size="20px"></ons-icon>';
			 		 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/merchant-name.svg' onerror='this.src='merchant-name.png''>";
		             html+='</div>';
		             html+='<div class="col">';
		             // html+='<p>'+ data.merchant_name +'</p>';
			 		 html+='<p><b class="opaque trn" data-trn-key="merchant_name">'+ getTrans('Merchant name: ','merchant_name') +'</b>'+data.dropoff_merchant_name+'</p>';
		             html+='</div>';
		          html+='</div>';   
				}
			 }
	          
	         if (!empty(data.dropoff_contact_name)){
	          html+='<div class="table mtb5">';
	             html+='<div class="col a">';
	             // html+='<ons-icon icon="ion-android-contact" size="20px"></ons-icon>';
			 	 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/contact_name.svg' onerror='this.src='contact_name.png''>";
	             html+='</div>';
	             html+='<div class="col">';
	             // html+='<p>'+ data.dropoff_contact_name +'</p>';
			     html+='<p><b class="opaque trn" data-trn-key="contact_name">'+ getTrans('Contact name: ','contact_name') +'</b>'+data.dropoff_contact_name+'</p>';
	             html+='</div>';
	          html+='</div>';   
	         }
	          
	         if (!empty(data.dropoff_contact_number)){
	         html+='<div class="table">';
	             html+='<div class="col a">';
	             // html+='<ons-icon icon="ion-ios-telephone" size="20px"></ons-icon>';
			 	 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/contact-number.svg' onerror='this.src='contact-number.png''>";
	             html+='</div>';
	             html+='<div class="col">';
	             // html+='<p><a class="tel" href="tel:'+data.dropoff_contact_number+'">'+data.dropoff_contact_number+'</a></p>';
			     html+='<p><b class="opaque trn" data-trn-key="contact_number">'+ getTrans('Contact number: ','contact_number') +'</b><a class="tel" href="tel:'+data.dropoff_contact_number+'">'+data.dropoff_contact_number+'<a/></p>';
	             html+='</div>';
	         html+='</div>';     
	         }
	        
	        
	        html+='</ons-col>';
	       html+='</ons-row>';
	   html+='</ons-list-item>';    
	   
	     if (data.trans_type == "coleta" || data.trans_type == "coleta_retorno" || data.trans_type == "pre_coleta" || data.trans_type == "pre_coleta_retorno"){  
   
  } else {

		html+='<ons-list-item class="back-white" tappable onclick="viewDropOffMap()"  >';
	     html+='<ons-col width="90%" >     ';            
	         html+='<div class="table">';
	             html+='<div class="col a">';
	             // html+='<ons-icon icon="ion-location" size="20px"></ons-icon>';
			 	 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/drop-address.svg' onerror='this.src='drop-address.png''>";
	             html+='</div>';
	             html+='<div class="col">';
	                          
	             // html+='<p>'+data.drop_address+'</p>';
			     html+='<p><b class="opaque trn" data-trn-key="delivery_address">'+ getTrans('Delivery address: ','delivery_address') +'</b>'+data.drop_address+'</p>';
	             
	             html+='</div>';
	          html+='</div> ';
	    html+='</ons-col>';

    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';
  }
/** Fim da atualização **/
   return html;
}

function DriverNotes( notes, data)
{	
	if(empty(data)){
		return '';
	}
	
	if ( data.driver_enabled_notes!=1){
		return '';
	}
	
	var html='';
	html+='<ons-list-item class="back-white" tappable onclick="showAddNote('+data.task_id+','+ "'" + data.status_raw + "'"  + ')"  >';
     html+='<ons-col width="90%" >     ';            
         html+='<div class="table">';
             html+='<div class="col a">';
             // html+='<ons-icon icon="ion-compose" size="20px"></ons-icon>';
			 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/add-note.svg' onerror='this.src='add-note.png''>";
             html+='</div>';
             html+='<div class="col">';      
             
             if ( data.status_raw=="cancelled" || data.status_raw=="successful" || data.status_raw=="failed"){	  	  	  
             	html+='<p>'+ getTrans("View Notes",'view_notes') +'</p>';               
             	if ( data.history_notes!=2){
             	html+='<span style="margin-left:10px;" class="new-notification">'+data.history_notes.total+'</span>'; 
             	}
             } else {
             	html+='<p>'+ getTrans("Add Notes",'add_notes') +'</p>';   
             	if ( data.history_notes!=2){
             	html+='<span style="margin-left:10px;" class="new-notification">'+data.history_notes.total+'</span>'; 
             	}
             }                    
             
             html+='</div>';
          html+='</div> ';
    html+='</ons-col>';

    html+='<ons-col width="10%">';
	    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
	html+='</ons-col> 	        ';
   html+='</ons-list-item>';
      
   switch(data.status_raw)
   {
   	  case "assigned":   	  
   	    return "";
   	  break;
   	  
   	  default:
   	    return html;
   	  break;
   }
}

function fillNotes(data)
{
	if(empty(data)){
		return '';
	}
	
	var html='';
	html+='<ons-list class="shadow" modifier="knotes">';
	$.each( data.details, function( key, val ) {     
		  dump(val);
		  
		  html+='<ons-list-item>';

			 html+='<ons-row>';
			   html+='<ons-col width="90%">';
				 html+='<p class="line-normal mb10 capitalize">'+val.notes+'</p>';
				 html+='<div class="table line-normal equal-col mb0">';
				   html+='<div class="note-date col col-1">'+val.date_created+'</div>';
				 html+='</div>';
				 
			   html+='</ons-col width="10%">';
			   html+='<ons-col class="popnotes_col">';
				  html+='<ons-button modifier="quiet" onclick="showNotesPopover(this,'+val.id+','+ "'" + val.notes + "'" +' )">';
					html+='<ons-icon icon="ion-android-more-vertical" style="color:grey;" size="20px"></ons-icon>';
				  html+='</ons-button>';
			   html+='</ons-col>';
			 html+='</ons-row>';
		  
		html+='</ons-list-item>';

	});
	html+='</ons-list>'; 
	
	$("#list-notes").html(html);
		
	if ( data.msg=="cancelled" || data.msg=="successful" || data.msg=="failed"){
		$(".popnotes_col").hide();
	}
	
}

function addPhotoChevron(data)
{
	dump('addPhotoChevron');
	
	if(empty(data)){
		return '';
	}
	
	if ( data.driver_enabled_addphoto!=1){
		return '';
	}
	
	var html='';
	
	if ( data.status_raw=="cancelled" || data.status_raw=="successful" || data.status_raw=="failed"){	
	} else {
		html+='<ons-list-item class="back-white" tappable onclick="javascript:addPhotoSelection();" >';
	     html+='<ons-col width="90%" >     ';            
	         html+='<div class="table">';
	             html+='<div class="col a">';
	             // html+='<ons-icon icon="ion-image" size="20px"></ons-icon>';
			 	 html+="<img class='opaque svg-task' src='lib/images/menu--order-details/photo.svg' onerror='this.src='photo.png''>";
	             html+='</div>';
	             html+='<div class="col">';      
	             
	             html+='<p>'+ getTrans("Add Photo",'add_photo') +'</p>'; 
	             
	             html+='</div>';
	          html+='</div> ';
	    html+='</ons-col>';
	
	    html+='<ons-col width="10%">';        
		    html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
		html+='</ons-col> 	        ';
	   html+='</ons-list-item>';
   }
   
   if (data.task_photo!=2){
   	   html+='<ons-list-item tappable onclick="javascript:showPhotoPage();" >';
	     html+='<ons-col width="90%" >     ';            
	         html+='<div class="table">';
	             html+='<div class="col a">';
	             html+='<ons-icon icon="ion-images" size="20px"></ons-icon>';
	             html+='</div>';
	             html+='<div class="col">';      
	             
	             html+='<b>'+ getTrans("View Photo",'view_photo') +'</b>';  
	             html+='<span style="margin-left:10px;" class="new-notification">'+data.task_photo.total+'</span>';
	             
	             html+='</div>';
	          html+='</div> ';
	    html+='</ons-col>';
	
	    html+='<ons-col width="10%">';   	         
		     html+='<ons-icon icon="ion-ios-arrow-right" size="20px"></ons-icon>';
		html+='</ons-col> 	        ';
	   html+='</ons-list-item>';
   }
      
   switch(data.status_raw)
   {
   	  case "unassigned":
   	    return "";
   	  break;
   	   
   	  default:
   	    return html;
   	  break;
   }
}

function gridPhoto(data , status_raw)
{
	dump(status_raw);
   var html='';   
   
   if (data.details.length>0){   	  
      $.each( data.details, function( key, val ) {       	        	  
      	           	     
      	     html+='<ons-row>';
      	     
      	     if ( status_raw=="cancelled" || status_raw=="successful" ||status_raw=="failed"){	
      	     	html+='<ons-col height="200" style="background:url('+val.photo_url+') no-repeat center center; background-size:cover;"   >';      	  
      	     } else {
      	      html+='<ons-col height="200" style="background:url('+val.photo_url+') no-repeat center center; background-size:cover;"  onclick="deletePhoto('+val.id+')" >';      	  
      	     }
      	            	      
      	          html+='<div class="img_loader" id="img_loader_wrap">';
      	                  
			        html+='<div class="spinner">';
					  html+='<div class="double-bounce1"></div>';
					  html+='<div class="double-bounce2"></div>';
					html+='</div>';
			      
			         html+='<img class="grid_photos" src="'+ val.photo_url +'"/>';
			      html+='</div>';
      	      
			      			  
      	      html+='</ons-col>';      	        	            	     
      	      
      	     html+='</ons-row>';      	    
      	        
      });            
      $("#list-photos").html(html);    
      imageLoaded('.img_loader'); 
   } else {
   	 dump('no photo');   	 
   }
}

/** Atualização Master Hub (Cobrança por km adicional e dinamico) **/
fillCidadeList = function(data, selected_key){
	
	var html='<ons-select id="cidade" name="cidade" class="cidade w100" style="width:100%;" >';
	$.each( data, function( key, val ) {
		
		selected = '';			
		if(!empty(selected_key)){
		    if(selected_key==key){
		    	selected="selected";
		    }
	    }
	    
		html+='<option value="'+key+'" '+ selected +'  >'+val+'</option>';
	});
	html+='</ons-select>';
	$(".cidade_wrap").html(html);
};

fillModoContaList = function(data, selected_key){
	
	var html='<ons-select id="modo_conta" name="modo_conta" class="modo_conta w100" style="width:100%;" >';
	$.each( data, function( key, val ) {
		
		selected = '';			
		if(!empty(selected_key)){
		    if(selected_key==key){
		    	selected="selected";
		    }
	    }
	    
		html+='<option value="'+key+'" '+ selected +'  >'+val+'</option>';
	});
	html+='</ons-select>';
	$(".modoconta_wrap").html(html);
};

fillCicloRecebimentoList = function(data, selected_key){
	
	var html='<ons-select id="ciclo_recebimento" name="ciclo_recebimento" class="ciclo_recebimento w100" style="width:100%;" >';
	$.each( data, function( key, val ) {
		
		selected = '';			
		if(!empty(selected_key)){
		    if(selected_key==key){
		    	selected="selected";
		    }
	    }
	    
		html+='<option value="'+key+'" '+ selected +'  >'+val+'</option>';
	});
	html+='</ons-select>';
	$(".ciclorecebimento_wrap").html(html);
};

fillCidadeResidList = function(data, selected_key){
	
	var html='<ons-select id="cidade_resid" name="cidade_resid" class="cidade_resid w100" style="width:100%;" >';
	$.each( data, function( key, val ) {
		
		selected = '';			
		if(!empty(selected_key)){
		    if(selected_key==key){
		    	selected="selected";
		    }
	    }
	    
		html+='<option value="'+val+'" '+ selected +'  >'+val+'</option>';
	});
	html+='</ons-select>';
	$(".cidade_resid_wrap").html(html);
};
/** Fim da atualização **/
fillTransportList = function(data, selected_key){
	
	var html='<ons-select id="transport_type_id" name="transport_type_id" class="transport_type_id w100" onchange="switchTransportFields( $(this).val() )" style="width:100%;" >';
	$.each( data, function( key, val ) {
		
		selected = '';			
		if(!empty(selected_key)){
		    if(selected_key==key){
		    	selected="selected";
		    }
	    }
	    
		html+='<option value="'+key+'" '+ selected +'  >'+val+'</option>';
	});
	html+='</ons-select>';
	$(".transport_wrap").html(html);
};