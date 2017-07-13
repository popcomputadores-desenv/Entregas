var ajax_url= krms_driver_config.ApiUrl ;
var dialog_title_default= krms_driver_config.DialogDefaultTitle;
var search_address;
var ajax_request;
var networkState;
var reload_home;
var translator;

var ajax_request2;
var ajax_request3;
var map;
var watchID;
var app_running_status;
var push;

jQuery.fn.exists = function(){return this.length>0;}

function dump(data)
{
	console.debug(data);
}

function setStorage(key,value)
{
	localStorage.setItem(key,value);
}

function getStorage(key)
{
	return localStorage.getItem(key);
}

function removeStorage(key)
{
	localStorage.removeItem(key);
}

function explode(sep,string)
{
	var res=string.split(sep);
	return res;
}

function urlencode(data)
{
	return encodeURIComponent(data);
}

function empty(data)
{
	if (typeof data === "undefined" || data==null || data=="" ) { 
		return true;
	}
	return false;
}

function isDebug()
{
	//on/off
	//return true;
	return false;
}

function hasConnection()
{	
	if (isDebug()){
		return true;
	}
	var networkState = navigator.connection.type;   
	if ( networkState=="Connection.NONE" || networkState=="none"){	
		return false;
	}	
	return true;
}

$( document ).on( "keyup", ".numeric_only", function() {
  this.value = this.value.replace(/[^0-9\.]/g,'');
});	 

/*START DEVICE READY*/
document.addEventListener("deviceready", function() {
	
	
	navigator.splashscreen.hide();
	
	app_running_status="active";
	
	/*check if background tracking is already on if yes then turn off*/
	var bg_tracking = getStorage("bg_tracking");	
	if (!empty(bg_tracking)){
		if ( bg_tracking==1 || bg_tracking=="1"){
			backgroundGeolocation.stop();
		}
	}
	
	window.plugins.insomnia.keepAwake();
		        
	if ( !empty(krms_driver_config.PushProjectID)) {
		
		push = PushNotification.init({
	        "android": {
	            "senderID": krms_driver_config.PushProjectID,
	            "clearBadge":true
	        },	        
	        "ios": {"alert": "true", "badge": "true", "sound": "true", "clearBadge": "true" }, 
	        "windows": {} 
	    });
	    
	    push.on('registration', function(data) {     	     	
	    	setStorage("device_id", data.registrationId );
	    	setStorage("device_platform", device.platform );	    	     	        
	    });
	    
	    push.on('notification', function(data) {	
	     	 //alert(JSON.stringify(data));
	     	 //switch (data.additionalData.additionalData.push_type)
	     	 
	     	 var vibrate_interval=getStorage("vibrate_interval");
	     	 if (empty(vibrate_interval)){
	     	 	vibrate_interval=3000;
	     	 } 
	     	 
	     	 vibrate_interval=parseInt(vibrate_interval)+1;	
	     	 navigator.vibrate(vibrate_interval);	     	 
	     	 	     	 
	     	 if ( data.additionalData.foreground ){
	     	  	 //when the app is active
	     	  	 setBaloon();
	     	  	 playNotification();	     	  	 
	     	  	 switch ( data.additionalData.data.actions )
	     	  	 {
	     	  	 	case "ASSIGN_TASK":
	     	  	 	case "CANCEL_TASK":
	     	  	 	case "UPDATE_TASK":
	     	  	 	if( $('#home').is(':visible') ){
	     	  	 		getTodayTask('');
	     	  	 	} 
	     	  	 	toastMsg( data.message ); 	  	 	
	     	  	 	break;
	     	  	 	
	     	  	 	case "private":
	     	  	 	case "bulk":
	     	  	 	onsenAlert( data.message );
	     	  	 	break;
	     	  	 	
	     	  	 	default:
	     	  	 	toastMsg( data.message ); 	  	 	
	     	  	 	break;
	     	  	 	
	     	  	 }
	     	 } else {	     	 	 
	     	 	 //when the app is not active
	     	 	 setBaloon();	     	 	 
	     	  	 switch ( data.additionalData.data.actions )
	     	  	 {
	     	  	 	case "ASSIGN_TASK":
	     	  	 	case "CANCEL_TASK":
	     	  	 	case "UPDATE_TASK":
	     	  	 	if( $('#home').is(':visible') ){
	     	  	 		getTodayTask('');
	     	  	 	} 
	     	  	 	toastMsg( data.message );
	     	  	 	break;
	     	  	 		     	  	 	
	     	  	 	case "private":
	     	  	 	case "bulk":
	     	  	 	onsenAlert( data.message );
	     	  	 	break;
	     	  	 	
	     	  	 	default:
	     	  	 	toastMsg( data.message ); 	  	 	
	     	  	 	break;
	     	  	 }
	     	 }
	    }); 	
	    
	    push.finish(function () {
	       //alert('finish successfully called');
	    });
	        
	    push.on('error', function(e) {
	       //onsenAlert("push error");
	    });   
	}
	
 }, false);
/*END DEVICE READY*/

// set device
ons.platform.select('android');
//ons.platform.select('ios');

ons.ready(function() {
	
	/*ons.setDefaultDeviceBackButtonListener(function() {	   	   
	});*/	
	
	if (isDebug()){
		dump("ons.ready");
		setStorage("device_id","device_1233456789");
	}
		
}); /*end ready*/


function setBaloon()
{
	var push_count = getStorage("push_count");
	if(empty(push_count)){
		push_count=0;
	}
	push_count=parseInt(push_count)+1;
	dump('setbaloon=>'+push_count);
	if (!empty(push_count)){
		if (push_count>0){
			setStorage("push_count", push_count );	
		    $(".baloon-notification").html(push_count);
		    $(".baloon-notification").show();
		}
	}
}

document.addEventListener("offline", noNetConnection, false);

function noNetConnection()
{
	toastMsg( getTrans("Internet connection lost","net_connection_lost") );
}

document.addEventListener("online", hasNetConnection, false);

function hasNetConnection()

{	

checkGPS();
	//toastMsg( getTrans("Connected","connected") );
	//callAjax("DeviceConnected",'');
}

document.addEventListener("backbutton", function (e) {	   
   if( $('#pageLogin').is(':visible') ){
   	
   	 if( $('.alert-dialog-container').is(':visible') ){
   	 	
   	 } else {
	   	ons.notification.confirm({
		  message: getTrans("Are you sure to close the app?","close_app") ,	  
		  title: dialog_title_default ,		  
		  buttonLabels: [ getTrans("Yes","yes") ,  getTrans("No","no") ],
		  animation: 'default', // or 'none'
		  primaryButtonIndex: 1,
		  cancelable: true,
		  callback: function(index) {	 
		  	   e.preventDefault();     	   
		  	   if (index==0){	  	   	 
					if (navigator.app) {
					   navigator.app.exitApp();
					} else if (navigator.device) {
					   navigator.device.exitApp();
					} else {
					   window.close();
					}
		  	   } else {
		  	   	   return false;
		  	   }
		  }
		});  
   	 }
   	
   } else if ( $('#home').is(':visible') ){
   	  
   	   if( $('.alert-dialog-container').is(':visible') ){
   	   } else {
		   ons.notification.confirm({
			  message: getTrans("Are you sure you want to logout?","logout_confirm") ,	  
			  title: dialog_title_default ,			  
			  buttonLabels: [ getTrans("Yes","yes") ,  getTrans("No","no") ],
			  animation: 'default', // or 'none'
			  primaryButtonIndex: 1,
			  cancelable: true,
			  callback: function(index) {	
			  	   e.preventDefault();   	   
			  	   if (index==0){	  	   			  	   	        	   	 
					   Logout();		  	   	
			  	   } else {
			  	       return false;	
			  	   }
			  }
			});
   	    }
	   
   } else if ( $('#taskDetails').is(':visible') ){   	  
   	   //sNavigator.popPage({cancelIfRunning: true}); 
   	   kNavigator.popPage().then(function() {
		    reloadHome();		    		   
	   });	   
   } else {   	  
   	   navigator.app.backHistory();
   }
}, false);	

function refreshCon(action , params)
{
	if(empty(params)){
		params='';
	}
	dump(action);
	if (hasConnection()){
		callAjax(action,params)
	}
}

document.addEventListener("show", function(event) {	
	dump( "page id show :" + event.target.id );	
	switch (event.target.id){		
		case "pageLogin":	
		if ( isAutoLogin()!=1){			
			checkGPS();
		}	
		break;				
		
		case "home":	
		    var onduty = document.getElementById('onduty').checked==true?1:2 ;			    
		    if ( onduty==1){		  	  	 
		  	  	 $(".duty_status").html( getTrans("On-Duty",'on_duty') );
		  	} else {		  	  	 
		  	  	 $(".duty_status").html( getTrans("Off-duty",'off_duty')  );
		  	}				
		  	reloadHome();  	  					  	  					  	 
		    checkGPS();	
		break;
		
		case "photoPage":			
		  callAjax('getTaskPhoto', 'task_id='+$(".task_id_details").val() );
		break;
		
		case "Signature":
		    callAjax('loadSignature', 'task_id='+$(".task_id_global").val() );
		break;
		
	}	
}, false);

document.addEventListener("init", function(event) {
		 dump( "page id :" + event.target.id );
		 
		 switch (event.target.id) {		 
			/* document.getElementById("onduty").addEventListener('change', function(e) {
	               console.log('click', e.target.isInteractive );
	         });*/
						
			case "signup":
		     initIntelInputs();
		     TransLatePage();
		     translateForms();		     		    
		    break;			
			
			case "Map":			  
			case "Notes":			  
			  TransLatePage();
			break;
					    			
			case "Notification":
			  TransLatePage();
			  callAjax('GetNotifications','');
			  
			   var pullHook = document.getElementById('pull-hook-notification');
			   pullHook.onAction = function(done) {						 	  
		              AjaxNotification("GetNotifications",'',done);
	             }; 
				 pullHook.addEventListener('changestate', function(event) {
				 	  var message = '';
				 	   dump(event.state);
				 	   switch (event.state) {
					      case 'initial':
					        message = '<ons-icon size="35px" icon="ion-arrow-down-a"></ons-icon> Puxe para baixo para atualizar';
					        break;
					      case 'preaction':
					        message = '<ons-icon size="35px" icon="ion-arrow-up-a"></ons-icon> Solte';
					        break;
					      case 'action':
					        message = '<ons-icon size="35px" spin="true" icon="ion-load-d"></ons-icon> Carregando...';
					        break;
				      }
				      pullHook.innerHTML = message;
				});
			  
			break;
			
			case "Signature":
			case "profile":		
			case "OrderDetails":				
			TransLatePage();
			break;
			
			case "pageGetSettings":		
							
			if (isDebug()){
				if ( hasConnection()){
				    callAjax("GetAppSettings",'');
				} else {				
				   toastMsg( getTrans("Not connected to internet","no_connection") );
				   $(".loading_settings").html( getTrans("Not connected to internet","no_connection") );
				   $(".refresh_net").show();
				}	  
			} else {
				document.addEventListener("deviceready", function() {	            
		           if ( hasConnection()){
				       callAjax("GetAppSettings",'');
					} else {				
					   toastMsg( getTrans("Not connected to internet","no_connection") );
					   $(".loading_settings").html( getTrans("Not connected to internet","no_connection") );
					   $(".refresh_net").show();
					}	             
	            }, false);
			}
            
			break;
			
			case "page-login":
			case "pageLogin":
			if ( isAutoLogin()==1){
				$("#frm-login").hide();
			    $(".login-header").hide();
			    $(".auto-login-wrap").show();
			} else {
				enabled_signup=getStorage("enabled_signup");
				if(enabled_signup==1){
					$(".sign-wrap").show();
				}
			}
			TransLatePage();				
			break;
			
			case "pageforgotpass":			
			TransLatePage();
			break;
			
			case "SettingPage":			
			
			if (isDebug()){
		    	$(".software_version").html( "1.0 - Debug Ativado" );
		    } else {
		    	$(".software_version").html( BuildInfo.version );
		    }
		    
		    device_id=getStorage('device_id');
   			if (!empty(device_id)){
   			  	$('.device_id').html( device_id );
   			}
		    			
			callAjax("GetSettings",'');
			TransLatePage();
			
			break;
			
			case "profilePage":			
			  TransLatePage();
			  callAjax("GetProfile",'');			  			  
			break;			
			
			case "taskDetails":
			case "viewTaskDescription":
			$(".toolbar-title").html( getTrans("Getting info...",'getting_info')  );
						
			break;
			
			case "CalendarView":
			TransLatePage();
			$('#calendar').fullCalendar({
				height: 500,
				header: {
					left: 'prev',
					center: 'title',
					right: 'next'
				},
				eventClick: function(calEvent, jsEvent, view) {
					 //alert('Event: ' + calEvent.id);					 
				},
				dayClick: function(date, jsEvent, view) {						 
					 kNavigator.popPage().then(function() {
					 	 setStorage('kr_todays_date_raw', date.format() );
					 	 $(".todays_date").html( date.format('MMMM, DD') );					 	 
					     getTodayTask('');
				     });					
				},
				events: function (start, end, timezone, callback) {
					_start  = start.format('YYYY-MM-DD');
					_end  = end.format('YYYY-MM-DD');
					params="&start="+_start;
					params+="&end="+_end;
					
					if ( !hasConnection() ){
		               toastMsg( getTrans("Not connected to internet",'no_connection') );	
		               return;
	                }
					
					dump(ajax_url+"/CalendarTask/?token=" + getStorage("kr_token") + params);
					
				    $.ajax({
				     	 type: "post",
				     	  url: ajax_url+"/CalendarTask/?token=" + getStorage("kr_token") + params,
				     	  dataType: 'jsonp',
				     	  timeout: 6000,
				     	  crossDomain: true,
		                  beforeSend: function() {
		                  	loader.show();
		                  },
				     	  success: function (data) {	
				     	     hideAllModal();	
				     	     if ( data.details.length>0){				     	  	  
					     	  	  var events = [];				     	  	  
					     	  	  $.each(data.details, function (i, task_day) {				     	  	  	   
					     	  	  	   events.push({
						                    /*start: moment({
						                        year: task_day.year,
						                        month: task_day.month,
						                        day: task_day.day
						                    }),*/
						                    start : task_day.id,
						                    title: task_day.title,
						                    allDay: true,
						                    id:task_day.id,
						                    className:"total_task"
						                });
					     	  	  });
					     	  	  callback(events);
				     	  	  }
				     	  },
				     	  error: function (request,error) {	  
				     	  	  hideAllModal();		 
				     	  	  dump('errr');  
				     	  }
				    });
				}
			});
			break;
						
			
			case "home":
			
			 var app_name=getStorage("app_name");
			 if(!empty(app_name)){
			    $(".app-title").html(app_name);
			 }
			
			 var pullHook = document.getElementById('pull-hook');
			 pullHook.onAction = function(done) {		
			 	  params="date="+ getStorage("kr_todays_date_raw");
			 	  var onduty = document.getElementById('onduty').checked==true?1:2 ;	
			 	  params+="&onduty="+onduty;
	              AjaxTask("GetTaskByDate",params,done);
             }; 
			 pullHook.addEventListener('changestate', function(event) {
			 	  var message = '';
			 	   dump(event.state);
			 	   switch (event.state) {
				      case 'initial':
				        message = '<ons-icon size="35px" icon="ion-arrow-down-a"></ons-icon> Puxe para baixo para atualizar';
				        break;
				      case 'preaction':
				        message = '<ons-icon size="35px" icon="ion-arrow-up-a"></ons-icon> Solte';
				        break;
				      case 'action':
				        message = '<ons-icon size="35px" spin="true" icon="ion-load-d"></ons-icon> Carregando...';
				        break;
			      }
			      pullHook.innerHTML = message;
			 });
			 
			 break;					 			 
			 	 
	 } /*end switch*/
	 		 
}, false);


function autoLogin()
{
	dump('autoLogin');
	var kr_remember = getStorage("kr_remember");	
	if ( kr_remember=="on"){
		var kr_username=getStorage("kr_username");
		var kr_password=getStorage("kr_password");
		var kr_remember=getStorage("kr_remember");
		if (!empty(kr_username) && !empty(kr_password)){
			dump('auto login');
			$("#frm-login").hide();
			$(".login-header").hide();
			$(".auto-login-wrap").show();
			var params="username="+kr_username+"&password="+kr_password+"&remember="+kr_remember;
			
			params+="&device_id="+ getStorage("device_id");
	        params+="&device_platform="+ getStorage("device_platform");
			
			dump(params);
			callAjax("login",params);
		}
	}
}

function exitKApp()
{
	ons.notification.confirm({
	  message: getTrans("Are you sure to close the app?","close_app") ,	  
	  title: dialog_title_default ,
	  buttonLabels: [ getTrans('Yes','yes') , getTrans('No','no') ],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {	  	   
	  	   if (index==0){	  	   	      	   	  
				if (navigator.app) {
				   navigator.app.exitApp();
				} else if (navigator.device) {
				   navigator.device.exitApp();
				} else {
				   window.close();
				}
	  	   }
	  }
	});
}

function showPage(page_id, action )
{	
	if (action==1){
	   popover.hide();
	}
	var options = {
	  animation: 'slide',
	  onTransitionEnd: function(){		  
	  } 
	};  
	kNavigator.pushPage(page_id, options);		
}

/*mycall*/
function callAjax(action,params)
{
	dump("action=>"+action);	
	
	if ( !hasConnection() ){
		toastMsg( getTrans("Not connected to internet",'no_connection') );	
		return;
	}
	
	//params+="&lang_id="+getStorage("kr_lang_id");
	params+="&lang="+getStorage("kr_lang_id");
	
	if(!empty(krms_driver_config.APIHasKey)){
		params+="&api_key="+krms_driver_config.APIHasKey;
	}		
	if ( !empty( getStorage("kr_token") )){		
		params+="&token="+  getStorage("kr_token");
	}
	
	dump(ajax_url+"/"+action+"?"+params);
	
	ajax_request = $.ajax({
		url: ajax_url+"/"+action, 
		data: params,
		type: 'post',                  
		async: false,
		dataType: 'jsonp',
		timeout: 6000,
		crossDomain: true,
		 beforeSend: function() {
			if(ajax_request != null) {			 	
			   /*abort ajax*/
			   hideAllModal();	
	           ajax_request.abort();
			} else {    
				/*show modal*/			   
				loader.show();			    
			}
		},
		complete: function(data) {					
			//ajax_request=null;   	
			ajax_request= (function () { return; })();     				
			hideAllModal();		
		},
		success: function (data) {	
			
			dump(data);
		   	if (data.code==1){
		   		
		   		switch(action)
		   		{
		   			case "login":		
		   			dump('LOGIN OK');  
		   			setStorage("kr_username", data.details.username);
		   			setStorage("kr_password", data.details.password);
		   			setStorage("kr_remember", data.details.remember);
		   			setStorage("kr_todays_date", data.details.todays_date);
		   			setStorage("kr_todays_date_raw", data.details.todays_date_raw);
		   			setStorage("kr_token", data.details.token);
		   			
		   			setStorage("kr_location_accuracy", data.details.location_accuracy);
		   			
					kNavigator.pushPage("home.html", {
					  animation: 'slide',
					  callback: function(){		 					  	  
					  	  $(".todays_date").html( getStorage("kr_todays_date") );
					  	  if ( data.details.on_duty==1){
					  	  	 onduty.checked=true;
					  	  	 $(".duty_status").html( getTrans("On-Duty",'on_duty') );
					  	  } else {
					  	  	 onduty.checked=false;
					  	  	 $(".duty_status").html( getTrans("Off-duty",'off_duty')  );
					  	  }				  	  
					  	  					  	  
					  	  getTodayTask( data.details.todays_date_raw );
					  	  
					  } 
					});
		   			break;
		   			
		   			case "ChangeDutyStatus":
		   			  if ( data.details==1){
		   			     $(".duty_status").html( getTrans("On-Duty",'on_duty') );
		   			  } else {
		   			  	 $(".duty_status").html( getTrans("Off-duty",'off_duty')  );
		   			  }
		   			break;
		   			
		   			case "getTaskByDate":
		   			$(".no-task-wrap").hide();
		   			$("#task-wrapper").show();
		   			dump( 'fill task' );
		   			$("#task-wrapper").html( formatTask( data.details ) );  
		   			
		   			$(".total_order_total").html(data.msg);
		   			 			
		   			break;
		   			
		   			case "TaskDetails":
		   			$(".toolbar-title").html ( data.msg ) ;
		   			$(".task_id_details").val( data.details.task_id );
		   			
		   			$("#task-details").html( 
		   			   formatTaskDetails(data.details) + 	  // customer details   			   
		   			   TaskDetailsChevron_1(data.details)  +  // delivery address
		   			   TaskDetailsChevron_4(data.details)  +  // merchant address
		   			   TaskDetailsChevron_2(data.details) +   // task description
		   			   OrderDetails(data.details) +           // order details
		   			   TaskAddSignature( data.details ) +	  // task signature
		   			   DriverNotes( data.history_notes , data.details ) +	// driver notes	   			   
		   			   addPhotoChevron(data.details) +  // take picture
		   			   TaskDetailsChevron_3(data.details.history)  +  // task history		   			   
		   			   '<div style="height:100px;"></div>'
		   			);
		   			
		   			//show signature
		   			
		   			$("#task-action-wrap").html( 
		   			  swicthButtonAction( data.details.task_id, data.details.status_raw )
		   			);
		   			
		   			$(".task_id_global").val( data.details.task_id );
		   			
		   			setStorage("enabled_resize_photo",data.details.enabled_resize_photo);
		   			setStorage("photo_resize_width",data.details.photo_resize_width);
		   			setStorage("photo_resize_height",data.details.photo_resize_height);
		   					   					   			
		   			break;
		   			
		   			case "viewTaskDescription":
		   			$(".toolbar-title").html ( data.msg ) ;
		   			$("#task-description").html( taskDescription(data.details) );
		   			break;
		   			
		   			
		   			case "changeTaskStatus":
		   			
		   			  reload_home=1;
		   			  if ( data.details.reload_functions =="TaskDetails"){
		   			  	   callAjax("TaskDetails",'task_id=' + data.details.task_id );
		   			  }
		   			  
		   			  if ( data.details.reload_functions=="getTodayTask"){
		   			  	   kNavigator.popPage().then(function() {
							    //getTodayTask('');
						   })
		   			  }
		   			  
		   			  $("#task-action-wrap").html( 
		   			     swicthButtonAction( data.details.task_id, data.details.status_raw )
		   			  );
		   			  
		   			break;
		   			
		   			case "AddSignatureToTask":
		   			    kNavigator.popPage().then(function() {							
		   			    	callAjax("TaskDetails",'task_id=' + data.details );
				        });
		   			break;
		   			
		   			
		   			case "GetProfile":
		   			$(".driver-fullname").html( data.details.full_name );
		   			$(".team-name").html( data.details.team_name );
		   			$(".driver-email").html( data.details.email );
		   			$(".phone").val( data.details.phone );
		   			
		   			$(".transport_type_id2").html( data.details.transport_type_id2 );
		   			$(".transport_description").val( data.details.transport_description );
		   			$(".licence_plate").val( data.details.licence_plate );
		   			$(".color").val( data.details.color );
		   			
		   			$(".transport_type_id").val( data.details.transport_type_id );
		   			switchTransportFields( data.details.transport_type_id );
		   			
		   			if ( !empty(data.details.profile_photo)){
		   				$(".profile-bg").css('background-image', 'url(' + data.details.profile_photo + ')');
		   				$(".profile-bg").css("background-size","cover");
		   				$(".avatar").attr("src", data.details.profile_photo );
		   				imageLoaded('.img_loader');
		   			} else {
		   				imageLoaded('.img_loader');
		   			}
		   			
		   			break;
		   			
		   			
		   			case "GetTransport":
		   			  var html='';
		   			  x=1;	   			 
		   			  $.each( data.details, function( key, val ) { 		   			  	  
		   			  	  html+=OptionListTransport('transport_type', key, val , x);
		   			  	  x++;
		   			  });
		   			  $("#transport-list").html(  html );
		   			break;
		   			
		   			case "ProfileChangePassword":
		   			  setStorage("kr_password", data.details);
		   			  onsenAlert( data.msg );   
		   			break;
		   			
		   			//silent
		   			case "SettingPush":
		   			case "DeviceConnected":		   			
		   			break;
		   			
		   			case "GetSettings":
		   			  
		   			  if ( data.details.enabled_push==1){
		   			      enabled_push.checked=true;
		   			  } else {
		   			  	  enabled_push.checked=false;
		   			  }
		   			  
		   			  kr_lang_id=getStorage("kr_lang_id");
		   			  if(!empty(kr_lang_id)){
		   			  	  $(".language_selected").html( data.details.language[kr_lang_id] );
		   			  }
		   			  
		   			break;
		   			
		   			case "LanguageList":
		   			 $("#language-list").html('');
		   			 var html='';
		   			  x=1;	   			 
		   			  $.each( data.details, function( key, val ) { 		   			  	  
		   			  	  //html+=OptionListLanguage('lang_id', val.lang_id, val.language_code , x);
		   			  	  html+=OptionListLanguage('lang_id', val, val , x);
		   			  	  x++;
		   			  });
		   			  $("#language-list").html(  html );
		   			break;
		   			
		   			case "GetAppSettings":
		   			   dump('GetAppSettings');		 	
		   			   
		   			   if (!empty(data.details.admin_country_set)){
		   			   	   setStorage("mobile_country_code",data.details.admin_country_set);
		   			   } else {
		   			   	   removeStorage("mobile_country_code");
		   			   }	   			   
		   			   		   			   
		   			   setStorage("kr_translation",JSON.stringify(data.details.translation));
		   			   
		   			   //set sounds url
		   			   setStorage("notification_sound_url",data.details.notification_sound_url);		   			   
		   			   setStorage("enabled_signup",data.details.enabled_signup);		   			   
		   			   setStorage("vibrate_interval",data.details.vibrate_interval);
		   			   
		   			   /*tracking*/		   			   
		   			   setStorage("record_track_Location",data.details.record_track_Location);
		   			   setStorage("disabled_tracking_bg",data.details.disabled_tracking_bg);
		   			   setStorage("track_interval",data.details.track_interval);
		   			   
		   			   setStorage("app_name",data.details.app_name);
		   			   
		   			   // set the language id
		   			   if ( !empty(data.details.app_language)){
		   			   	      setStorage("kr_lang_id",data.details.app_language);  
		   			   } else {
			   			   if ( empty( getStorage("kr_lang_id") )){
			   			   	  setStorage("kr_lang_id","");  
			   			   } 
		   			   }
		   			   		   			   
		   			   var auto_login = isAutoLogin();
	                   
	                   if ( auto_login == 1) {	       
	                   	   dump('execute auto login');   	                   	   
	                   	   kNavigator.pushPage("pagelogin.html", {
							  animation: 'fade',
							   callback: function(){		
							   	  var kr_username=getStorage("kr_username");
		                          var kr_password=getStorage("kr_password");
		                          var kr_remember=getStorage("kr_remember");							  	  
							  	  var params="username="+kr_username+"&password="+kr_password;
							  	  params+="&remember="+kr_remember;
							  	  
							  	  params+="&device_id="+ getStorage("device_id");
	                              params+="&device_platform="+ getStorage("device_platform");
							  	  
							  	  dump(params);
			                      callAjax("login",params);
							  } 
						   });
	                   } else {
	                   	   kNavigator.pushPage("pagelogin.html", {
							  animation: 'fade',
							  callback: function(){						  	  
							  } 
						   });
	                   }
	                   
		   			break;
		   			
		   			case "ViewOrderDetails":
		   			$("#order-details").html( formatOrderDetails( data.details , data.msg ) );
		   			break;
		   			
		   			case "GetNotifications":		   			
		   			$("#notifications-details").html( formatNotifications( data.details ) );
		   			clearPushCount();
		   			break;
		   			
		   			
		   			case "clearNofications":
		   			$("#notifications-details").html('');	
		   			clearPushCount();
		   			break;
		   			
		   			case "Logout":
		   			removeStorage('kr_token');
		   			break;
		   					   					   			
		   			case "loadNotes":		   			
		   			  fillNotes(data);
		   			break;
		   			
		   			case "addNotes":		   			
		   			  $(".notes_fields").val('');
		   			  callAjax("loadNotes","task_id="+ data.details.task_id );		 
		   			break;
		   			
		   			case "deleteNotes":		   			
		   			  notes_popover.hide();
		   			  callAjax("loadNotes","task_id="+ data.details.task_id );		 		   			  		   			  
		   			break;
		   			
		   			case "updateNotes":   			   			  
		   			  var dialog_notes = document.getElementById('editNotes');
		   			  dialog_notes.hide();
		   			  callAjax("loadNotes","task_id="+ data.details.task_id );		 		   			  		   			  
		   			break;
		   			
		   			case "trackDistance":
		   			  showDistanceInfo(data.details);
		   			break;
		   			
		   			case "signup":
		   			  onsenAlert( data.msg );
		   			  kNavigator.popPage({cancelIfRunning: true}); 
		   			break;
		   			
		   			case "UploadTaskPhoto":
		   			var dialog = document.getElementById('addphotoSelection');
	                dialog.hide();	    
	                
	                callAjax("TaskDetails",'task_id=' + $(".task_id_details").val() );
	                            
		   			break;
		   			
		   			
		   			case "getTaskPhoto":
		   			  gridPhoto(data , data.msg);
		   			break;
		   			
		   			case "deletePhoto":
		   			   callAjax('getTaskPhoto', 'task_id='+$(".task_id_details").val() );
		   			break;
		   			
		   			case "loadSignature":
		   			  if (data.details.status=="successful"){
		   			  	 $(".toolbar-title-signature").html( getTrans("View Signature",'view_signature') );
	  	 	             $(".signature-action").hide();
	  	 	             if (!empty(data.details.data)){
	  	 	             	
	  	 	             	 signature_html='<div class="img_loaded" >';
				  	 	     signature_html += '<img src="'+data.details.data.customer_signature_url+'" />';
				  	 	     signature_html+='</div>';
				  	 	   
				  	 	     $("#signature-pan").html ( signature_html )  ;
				  	 	   
				  	 	     imageLoaded('.img_loaded');
				  	 	     
				  	 	     $(".recipient_name").hide();
	  	 	             }
		   			  } else {
		   			  	 $(".toolbar-title-signature").html( getTrans("Add Signature",'add_signature') );
	  	 	             $(".signature-action").show();	
	  	 	             $(".recipient_name").show();  	 	               
	  	 	             $sigdiv = $("#signature-pan") ;
	  	 	             //$sigdiv.jSignature();
		   			     $(".recipient_name").val( data.details.data.receive_by );
		   			     if (!empty(data.details.data)){
		   			     	 $(".signature_id").val( data.details.data.id );
		   			     	 dump(data.details.data.signature_base30);		   			     	 
	  	 	                 $sigdiv.jSignature("setData", "data:"+data.details.data.signature_base30 ) ;	  	 	                 
		   			     }
		   			  }
		   			break;
		   					   					   			
		   			default:
		   			  onsenAlert( data.msg );
		   			break;
		   		}
		   		
		   	} else { // failed 
		   		
		   		switch (action)
		   		{
		   			case "loadNotes":
		   			$("#list-notes").html('');
		   			break;
		   					   					   			
		   			case "getTaskByDate":		   			  
		   			  $(".no-task-wrap").show();
		   			  $(".no-task-wrap p").html( data.msg );
		   			  $("#task-wrapper").html('');
		   			  //$("#task-wrapper").hide();
		   			  toastMsg( data.msg );
		   			break;

		   			case "login":
		   			checkGPS();		   			   		
		   			$("#frm-login").show();
			        $(".login-header").show();
			        $(".auto-login-wrap").hide();
		   			onsenAlert( data.msg );
		   			removeStorage("kr_remember");
		   			break;
		   			
		   			//silent		   			
		   			case "SettingPush":
		   			case "GetAppSettings":
		   			case "DeviceConnected":
		   			case "Logout":
		   			break;
		   					   			
		   			case "GetNotifications":
		   			clearPushCount();
		   			toastMsg( data.msg );
		   			break;
		   			
		   			case "getTaskPhoto":
		   			  $("#list-photos").html('');
		   			break;
		   			
		   			case "trackDistance":
		   			toastMsg( data.msg );
		   			break;
		   				
		   			case "loadSignature":
		   			 $(".toolbar-title-signature").html( getTrans("Add Signature",'add_signature') );
	  	 	         $(".signature-action").show();
	  	 	         $("#signature-pan").jSignature();	
		   			break;
		   			
		   			default:		   			
		   			onsenAlert( data.msg );
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
				break;
												
				default:
				toastMsg( getTrans("Network error has occurred please try again!",'network_error') );		
				break;
			}
		}
	});
}

function AjaxTask(action, params , done)
{
	dump('AjaxTask');
	if ( !hasConnection() ){
		toastMsg( getTrans("Not connected to internet","no_connection") );
		done();
		return;
	}

	//params+="&lang_id="+getStorage("kr_lang_id");
	params+="&lang="+getStorage("kr_lang_id");
	if(!empty(krms_driver_config.APIHasKey)){
		params+="&api_key="+krms_driver_config.APIHasKey;
	}		
	if ( !empty( getStorage("kr_token") )){		
		params+="&token="+  getStorage("kr_token");
	}
	
	dump(ajax_url+"/"+action+"?"+params);
	
	ajax_request = $.ajax({
		url: ajax_url+"/"+action, 
		data: params,
		type: 'post',                  
		async: false,
		dataType: 'jsonp',
		timeout: 6000,
		crossDomain: true,
		 beforeSend: function() {
			if(ajax_request != null) {			 				   
	           ajax_request.abort();
			} else {    
			}
		},
		complete: function(data) {					
			ajax_request=null;   	     							
		},
		success: function (data) {	
			dump(data);
			done();
			if ( data.code==1){
				
				$(".no-task-wrap").hide();
		   	    $("#task-wrapper").show();
		   		dump( 'fill task' );
		   	    $("#task-wrapper").html( formatTask( data.details ) );		   			
				
			} else {				
	   			$(".no-task-wrap").show();
	   		    $(".no-task-wrap p").html( data.msg );	  
	   		    $("#task-wrapper").html(''); 
	   		    toastMsg( data.msg );			
			}
		},
		error: function (request,error) {	  		    
			done();
		}
	});
	
}

function getTrans(words,words_key)
{
	
}

function onsenAlert(message,dialog_title)
{
	if (typeof dialog_title === "undefined" || dialog_title==null || dialog_title=="" ) { 
		dialog_title=dialog_title_default;
	}
	ons.notification.alert({
      message: message,
      title:dialog_title
    });
}

function toastMsg( message )
{	
	
	if (isDebug()){
		onsenAlert( message );
		return ;
	}
	 
    window.plugins.toast.showWithOptions(
      {
        message: message ,
        duration: "long",
        position: "bottom",
        addPixelsY: -40 
      },
      function(args) {
      	
      },
      function(error) {
      	onsenAlert( message );
      }
    );
}

function hideAllModal()
{	
	setTimeout('loader.hide()', 1);
}

function login() {	
	var params = $( ".frm").serialize();
	params+="&device_id="+ getStorage("device_id");
	params+="&device_platform="+ getStorage("device_platform");
	dump(params);	
	callAjax("login",params);
}

function forgotPass()
{
	dump('forgotPass');
	var params = $( "#frm-forgotpass").serialize();
	dump(params);
	callAjax("ForgotPassword",params);
}

var xx=0;
var lastUpdateTime,
/*minFrequency = 10*2000;*/
minFrequency = 8000;

function getCurrentPosition()
{	 
	 watchID = navigator.geolocation.watchPosition( function(position) {
	 //navigator.geolocation.getCurrentPosition( function(position) {	 
	 
	     var now = new Date();
	     
	     dump( position.coords.latitude);	 
	     dump(  position.coords.longitude );	   
	     
	     var now = new Date();
	     
	    if(!empty(app_running_status)){
		     if (app_running_status=="background"){
		     	 return;
		     }
	     }
	     	     	    
	     app_track_interval = getStorage("track_interval");
	     if (!empty(app_track_interval)){
	     	 minFrequency=app_track_interval;
	     }	     	  
	     
	     if(!empty(lastUpdateTime)){	     	 
	     	 var freq_time = now.getTime() - lastUpdateTime.getTime();	 
	     	 if ( freq_time <  minFrequency ) {
	     	 	 dump("Ignoring position update");
	     	 	 return ;
	     	 }
	     }
	     lastUpdateTime = now;	 	     	     
	     //$(".watch-id").html( xx++ );	     
	     
	     //params = 'lat='+ position.coords.latitude + "&lng=" + position.coords.longitude;
	     params = 'lat='+ position.coords.latitude + "&lng=" + position.coords.longitude;
	     params+="&app_version="+ BuildInfo.version;
	     
	     params+="&altitude="+ position.coords.altitude;
	     params+="&accuracy="+ position.coords.accuracy;
	     params+="&altitudeAccuracy="+ position.coords.altitudeAccuracy;
	     params+="&heading="+ position.coords.heading;
	     params+="&speed="+ position.coords.speed;
	     params+="&track_type=active";
	     	     
	     callAjax2('updateDriverLocation', params);
	     
	 },function(error) {
	 	 dump('error position');
	 	 navigator.geolocation.clearWatch(watchID);
	 },
	   { timeout: 10000, enableHighAccuracy : getLocationAccuracy() } 
	 );	 	 
}

var showChangePassword = function() {
  var dialog = document.getElementById('dialogChangePass');
  if (dialog) {
      dialog.show();
  } else {
    ons.createDialog('changePassword.html')
      .then(function(dialog) {
        dialog.show();       
        setTimeout('TransLatePage()', 300);	
    });
  }
};

function changePassword()
{
	var params = $( "#frm-changepass").serialize();
	callAjax("ChangePassword",params);
}

var onduty_handle=0;

function changeDuty()
{		
	onduty_handle++;
	dump(onduty_handle);
	var onduty = document.getElementById('onduty').checked==true?1:2 ;	
	params="onduty="+onduty;
	//if ( onduty_handle==2){
	   callAjax("ChangeDutyStatus",params);
	   onduty_handle=0;
	//}
	if ( onduty==2){		
		navigator.geolocation.clearWatch(watchID);
	} else {
		checkGPS();
	}
}

var showMenu = function(element) {   
   popover.show(element);
};

function getTodayTask(raw_date)
{
   if (empty(raw_date)){
   	   raw_date=getStorage('kr_todays_date_raw');
   }
   callAjax("getTaskByDate","date="+raw_date);
}

function showTask(task_id)
{
   dump(task_id);	
   reload_home=2;
   /*kNavigator.pushPage("taskDetails.html", {
      animation: 'slide',
   }).then(function(page) {   
   	    callAjax("TaskDetails",'task_id=' + task_id);
   });      */    
   kNavigator.pushPage("taskDetails.html", {
	  animation: 'slide',
	  callback: function(){		 					  	  
	  	callAjax("TaskDetails",'task_id=' + task_id);
	  } 
   });
}

function viewTaskDescription(task_id)
{	
	kNavigator.pushPage("viewTaskDescription.html", {
	  animation: 'none',
	  callback: function(){		 					  	  
	  	callAjax("viewTaskDescription",'task_id=' + task_id);
	  } 
   });
}

function swicthButtonAction( task_id, status_raw )
{
	dump(status_raw);
	var html=''; var action='';
	switch (status_raw)
	{
		case "assigned":
		case "unassigned":
		case "pending":
		case "accepted":
		action='acknowledged';
		html+='<p><ons-button modifier="large"';
		html+='onclick="changeTaskStatus('+task_id+','+ "'"+action+"'" +' )" > '+ getTrans("Accept",'accept') +' </ons-button></p>';
		
		action='declined';
		html+='<p><ons-button modifier="quiet"';
		html+='onclick="declinedTask('+task_id+','+ "'"+action+"'" +' )" >'+ getTrans("Decline",'decline') +'</ons-button></p>';
		break;
		
		case "acknowledged":
		action='started';
		html+='<p><ons-button modifier="large"';
		html+='onclick="changeTaskStatus('+task_id+','+ "'"+action+"'" +' )" >'+ getTrans('Start','start') +'</ons-button></p>';
		
		action='cancelled';
		html+='<p><ons-button modifier="quiet"';
		html+='onclick="ShowAddReason('+task_id+','+ "'"+action+"'" +' )" >'+ getTrans('Cancel','cancel') +'</ons-button></p>';
		break;
		
		case "started":
		action='inprogress';
		html+='<p><ons-button modifier="large"';
		html+='onclick="changeTaskStatus('+task_id+','+ "'"+action+"'" +' )" >'+getTrans('Arrived','arrived')+'</ons-button></p>';
		
		action='cancelled';
		html+='<p><ons-button modifier="quiet"';
		html+='onclick="ShowAddReason('+task_id+','+ "'"+action+"'" +' )" >'+getTrans('Cancel','cancel')+'</ons-button></p>';
		break;
		
		case "inprogress":
		action='successful';
		html+='<p><ons-button modifier="large"';
		html+='onclick="changeTaskStatus('+task_id+','+ "'"+action+"'" +' )" >'+getTrans('Successful','successful')+'</ons-button></p>';
		
		action='failed';
		html+='<p><ons-button modifier="quiet"';
		html+='onclick="ShowAddReason('+task_id+','+ "'"+action+"'" +' )" >'+getTrans('Failed','failed')+'</ons-button></p>';
		break;
		
		case "successful":
		break;
		
		case "failed":
		break;
		
		case "declined":
		break;
		
		case "cancelled":
		break;
		
		default:
		break;
	}
	return html ;	
}

function changeTaskStatus(task_id, status_raw )
{
	dump(task_id );
	dump(status_raw);		
	callAjax("changeTaskStatus",'task_id=' + task_id +"&status_raw="+status_raw ) ;
}

function reloadHome()
{
	dump('reloadHome');
	dump(reload_home);
	if ( reload_home==1){
	   getTodayTask('');
	   reload_home=2;
	}
}

function ShowAddReason(task_id , status_raw)
{
	dump(task_id);
	dump(status_raw);
	
	var dialog = document.getElementById('reasonTask');
	if (dialog) {
	      dialog.show();	      
	      $("#reason_task_id").val( task_id );
	      $("#reason_status_raw").val( status_raw );
	} else {
	    ons.createDialog('reasonTask.html')
	      .then(function(dialog) {
	        dialog.show();	        
	        $("#reason_task_id").val( task_id );
	        $("#reason_status_raw").val( status_raw );
	        setTimeout('TransLatePage()', 300);	
	    });
	}	
}

function declinedTask( task_id , status_raw )
{
	/*dump(task_id);
	dump(status_raw);
	dump(dialog_title_default);
	dump( getTrans("Are you sure?","are_you_sure") );	*/
	
	ons.notification.confirm({
		title:dialog_title_default,
		message:  getTrans("Are you sure?","are_you_sure"),
		buttonLabels: [ getTrans('No',"no"), getTrans('Yes','yes') ],
	})
	.then(
      function(answer) {
        if (answer === 1) {
           dump('ok');
           callAjax("changeTaskStatus",'task_id=' + task_id +"&status_raw="+status_raw ) ;
        }
      }
    );
}

function AddReasonTask()
{	
	if ( $("#reason").val()==""){
		onsenAlert("Reason is required");
		return;
	}
	var task_id=$("#reason_task_id").val();
	var status_raw=$("#reason_status_raw").val();
	reasonTask.hide();
	callAjax("changeTaskStatus",'task_id=' + task_id +"&status_raw="+status_raw + "&reason="+ $("#reason").val() ) ;
}

function ShowSignaturePage( task_id , signature , status , recipient_name )
{	
	kNavigator.pushPage("Signature.html", {
	  animation: 'none',
	  callback: function(){		 		
	  	 $(".task_id_signature").val(  task_id );	  	 
	  	 if ( status=="successful"){
	  	 	$(".toolbar-title-signature").html( getTrans("View Signature",'view_signature') );
	  	 	$(".signature-action").hide();
	  	 	if ( !empty(signature)){	  	 	
	  	 		
	  	 	   signature_html='<div class="img_loaded" >';
	  	 	   signature_html += '<img src="'+signature+'" />';
	  	 	   signature_html+='</div>';
	  	 	   
	  	 	   $("#signature-pan").html ( signature_html )  ;	  	 	   
	  	 	   imageLoaded('.img_loaded');	  	 	
	  	 	   
	  	 	}
	  	 	
	  	 	if(!empty(recipient_name)){	  	 		
	  	 		$(".recipient_name").val( recipient_name );		  	 	
	  	 	}
	  	 	
	  	 } else {	  	 	  	 	
	  	 	$(".toolbar-title-signature").html( getTrans("Add Signature",'add_signature') );
	  	 	$(".signature-action").show();
	  	 	$("#signature-pan").jSignature();	  	
	  	 }	  	 	  	 
	  } 
   });
}

function resetSignature()
{
	dump('resetSignature');
	$("#signature-pan").jSignature("reset");	  	
}

function AddSignatureToTask()
{
	//var datapair = $("#signature-pan").jSignature("getData", "svgbase64");
	var datapair = $("#signature-pan").jSignature("getData","base30");	
	callAjax("AddSignatureToTask","image="+datapair +"&task_id=" + $(".task_id_signature").val() + "&recipient_name="+ $(".recipient_name").val()  + "&signature_id="+ $(".signature_id").val()  );
}

function imageLoaded(div_id)
{	
	$(div_id).imagesLoaded()
	  .always( function( instance ) {
	    console.log('all images loaded');
	  })
	  .done( function( instance ) {
	    console.log('all images successfully loaded');
	  })
	  .fail( function() {
	    console.log('all images loaded, at least one is broken');
	  })
	  .progress( function( instance, image ) {
	    var result = image.isLoaded ? 'loaded' : 'broken';	    	   
	    image.img.parentNode.className = image.isLoaded ? '' : 'is-broken';
	    console.log( 'image is ' + result + ' for ' + image.img.src );	    
	});
}

function showCalendarView()
{
	kNavigator.pushPage("CalendarView.html", {
	  animation: 'slide',
	  callback: function(){		 					  	  
	  	  dump('CalendarView');		  
	  } 
   });
}

function showTransportType()
{
   var dialog = document.getElementById('transporType');
   if (dialog) {
      dialog.show();
   } else {
      ons.createDialog('transporType.html')
      .then(function(dialog) {
      	callAjax("GetTransport",'');
        dialog.show();
      });
   }   
}

function setTransportType(key , val)
{	
	dump(key); dump(val);
	transporType.hide();
	$(".transport_type_id2").html( val );
	$(".transport_type_id").val( key );
	switchTransportFields( key );
}

function switchTransportFields( transport_type )
{
	if ( transport_type=="walk" ){
		$(".with-car").hide();
	} else {
		$(".with-car").show();
	}
}

function UpdateForms(form_id , action )
{
	var params = $( "#"+form_id).serialize();	
	callAjax(action,params);
}

var switch_handle=0;

function UpdatePush()
{
	switch_handle++;
	dump('UpdatePush');
	var enabled_push = document.getElementById('enabled_push').checked==true?1:2 ;	
	params="enabled_push="+enabled_push;
	//if ( switch_handle==2){
	   callAjax("SettingPush",params);
	   switch_handle=0;
	//}
}


function ShowLanguageOption()
{
   var dialog = document.getElementById('LanguageList');
   if (dialog) {
   	  callAjax("LanguageList",'');
      dialog.show();
   } else {
      ons.createDialog('LanguageList.html')
      .then(function(dialog) {
      	callAjax("LanguageList",'');
        dialog.show();
      });
   }   
}

function SetLanguage(lang_id , language)
{
	dump(lang_id);
	dump(language);
	$(".language_selected").html( language );
	setStorage("kr_lang_id",language);
	LanguageList.hide();
	TransLatePage();
	reload_home=1;
}

function Logout()
{	
	removeStorage('kr_username');
	removeStorage('kr_password');
	removeStorage('kr_remember');	
	
	popover.hide();
	$(".auto-login-wrap").hide();
	$("#frm-login").show();
	$(".login-header").show();
    kNavigator.popPage().then(function() {	
    	// clear watch id
    	navigator.geolocation.clearWatch(watchID);
    	callAjax("Logout",'');			    	   
    });
}

function TransLatePage()
{
	var dictionary;
	dump('TransLating page');
	if (typeof getStorage("kr_translation") === "undefined" || getStorage("kr_translation")==null || getStorage("kr_translation")=="" ) { 	   
		return;		
	} else {
		dictionary =  JSON.parse( getStorage("kr_translation") );
	}	
	if (!empty(dictionary)){
		//dump(dictionary);
		var kr_lang_id=getStorage("kr_lang_id");		
		if (!empty(kr_lang_id)){
			//dump(kr_lang_id);
			translator = $('body').translate({lang: kr_lang_id, t: dictionary});
			translateForms();
			translateTabs();
		}
	}
}

function translateForms()
{
	var t='';
	$.each( $(".field-wrap") , function() { 				
		var temp_value=$(this).find("input.text-input").attr("placeholder");		
		//dump("->"+temp_value);
		if(!empty(temp_value)){
			key = $(this).find("ons-input").data("trn-key");			
		    t = getTrans(temp_value, key );		    
		    $(this).find("input.text-input").attr("placeholder",t);
		    $(this).find("._helper").html(t);		    
		}
	});	
}

function translateTabs()
{
	var t='';
	$.each( $(".tab-bar__item") , function() { 				
		var temp_value=$(this).find(".tab-bar__label").html();		
		if(!empty(temp_value)){		
			key = $(this).data("trn-key");							
			t = getTrans(temp_value, key );		    
		    $(this).find(".tab-bar__label").html(t);    
		}
	});	
}

function getTrans(words,words_key)
{
	var temp_dictionary='';		
	
	if (typeof getStorage("kr_translation") === "undefined" || getStorage("kr_translation")==null || getStorage("kr_translation")=="" ) { 	   
		return words;
	} else {
		temp_dictionary =  JSON.parse( getStorage("kr_translation") );
	}	
		
	if (!empty(temp_dictionary)){
		//dump(temp_dictionary);		
		var default_lang=getStorage("kr_lang_id");
		//dump(default_lang);
		if (default_lang!="undefined" && default_lang!=""){
			//dump("OK");
			if ( array_key_exists(words_key,temp_dictionary) ){
				//dump('found=>' + words_key +"=>"+ temp_dictionary[words_key][default_lang]);				
				if(!empty(temp_dictionary[words_key][default_lang])){
				   return temp_dictionary[words_key][default_lang];
				} 
			} 
		}
	}	
		
	return words;
}

function array_key_exists(key, search) {  
  if (!search || (search.constructor !== Array && search.constructor !== Object)) {
    return false;
  }
  return key in search;
}

function isAutoLogin()
{
   var auto_login=2;
   var kr_remember = getStorage("kr_remember");	
   if ( kr_remember=="on"){
   	   var kr_username=getStorage("kr_username");
       var kr_password=getStorage("kr_password");
       var kr_remember=getStorage("kr_remember");
       if (!empty(kr_username) && !empty(kr_password)){
       	    auto_login=1;
       }
   } 
   return auto_login;
}

function ShowOrderDetails( order_id )
{
	kNavigator.pushPage("OrderDetails.html", {
	 animation: 'slide',
	  callback: function(){		 					  	  
	  	 callAjax("ViewOrderDetails",'order_id=' + order_id );
	  } 
   });
}

var watch_count=1;

var onSuccess = function(position) {
	var html='';
	html='Lat : '+position.coords.latitude;
	html+='<br/>';
	html+= watch_count++;
	html+='<br/>';
	html+='Lat : '+position.coords.longitude;
	$(".location-res").html( html );
};

function onError(error) {
    alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
}

function checkGPS()
{				
	 if (isDebug()){
		return ;
	 }
	 
	 if ( device.platform =="iOS"){	 	 	 	 
	 	 getCurrentPosition();
	 	 return;
	 }
	 
     cordova.plugins.locationAccuracy.request( onRequestSuccess, 
	 onRequestFailure, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
}

function onRequestSuccess(success){
    //alert("Successfully requested accuracy: "+success.message);
    getCurrentPosition();
}

function onRequestFailure(error){
    //alert("Accuracy request failed: error code="+error.code+"; error message="+error.message);    
    if(error.code == 4){
    	toastMsg( getTrans("You have choosen not to turn on location accuracy",'turn_off_location') );
    	checkGPS();
    } else {
    	toastMsg( error.message );
    }
}

/*function toastOnSuccess()
{
}
function toastOnError()
{
}*/

function viewTaskMap(task_id , task_lat, task_lng , delivery_address )
{
	 setStorage("task_lat", task_lat );
	 setStorage("task_lng", task_lng );
	 setStorage("delivery_address", delivery_address );
	 
	 setStorage("map_action",'map1');
	 
	 var task_full_data = JSON.parse(getStorage("task_full_data"));	 
	
	 kNavigator.pushPage("Map.html", {
		  animation: 'fade',
		  callback: function(){		
		  	
		  	  if(!empty(task_full_data)){		  	  	  		  	  	  
		  	  	  if ( task_full_data.status_raw=="cancelled" || task_full_data.status_raw=="successful" || task_full_data.status_raw=="failed"){
		  	  	  	  $(".direction_wrap").hide();
		  	  	  	  $(".floating_action").hide();
		  	  	  }
		  	  }
		  	
		  	 viewTaskMapInit();				  	  
		  } 
	 });
}

function viewTaskMapInit()
{
	var task_lat=getStorage('task_lat');
	var task_lng=getStorage('task_lng');
	dump(task_lng);
	dump(task_lat);
	dump(getStorage("delivery_address"));

	if (isDebug()){
		return;
	}
	
	google_lat = new plugin.google.maps.LatLng( task_lat , task_lng );
	
	/*
    var div = document.getElementById("map_canvas");  
    map = plugin.google.maps.Map.getMap(div,{     
     'camera': {
      'latLng': google_lat,
      'zoom': 17
     }
    });      
    map.on(plugin.google.maps.event.MAP_READY, onMapInit); 
    */
	
	//$('.page__background').not('.page--menu-page__background').css('background-color', 'rgba(0,0,0,0)');	 
	
	setTimeout(function(){ 	    
        var div = document.getElementById("map_canvas");
        $('#map_canvas').css('height', $(window).height() - $('#map_canvas').offset().top);
        
        map = plugin.google.maps.Map.getMap(div, {     
	     'camera': {
	      'latLng': google_lat,
	      'zoom': 17
	     }
	    });
	    
	    
	    map.clear();
		map.off();
				
		map.setCenter(google_lat);             
		map.setZoom(17);
		
        map.setBackgroundColor('white');
        
        map.on(plugin.google.maps.event.MAP_READY, onMapInit); 
        
    }, 300); // and timeout for clear transitions        
}

function onMapInit()
{			
	/*map.clear();
	map.showDialog();*/
	map.clear();	
	var task_lat=getStorage('task_lat');
	var task_lng=getStorage('task_lng');
	var delivery_address=getStorage('delivery_address');
	
	map.addMarker({
	  'position': new plugin.google.maps.LatLng( task_lat , task_lng ),
	  'title': delivery_address ,
	  'snippet': getTrans( "Destination" ,'destination')
     }, function(marker) {
     	
	    marker.showInfoWindow();	
	    
	    navigator.geolocation.getCurrentPosition( function(position) {	    
	    	  
	    	 var driver_location = new plugin.google.maps.LatLng(position.coords.latitude , position.coords.longitude); 	
	    	 //demo
	    	 //var driver_location = new plugin.google.maps.LatLng( 34.039413 , -118.25480649999997 ); 	
	    	 
	    	 var destination = new plugin.google.maps.LatLng( task_lat , task_lng );
	    	 
	    	  map.addPolyline({
			    points: [
			      destination,
			      driver_location
			    ],
			    'color' : '#AA00FF',
			    'width': 10,
			    'geodesic': true
			   }, function(polyline) {
			   	
			   	  map.animateCamera({
					  'target': driver_location,
					  'zoom': 17,
					  'tilt': 30
					}, function() {
						
					   var data = [      
				          {'title': getTrans('You are here','you_are_here'), 'position': driver_location }  
				       ];
				   
					   addMarkers(data, function(markers) {
					    markers[markers.length - 1].showInfoWindow();
					   });
						
				   });  
				   
			   });   
	    	 // end position success
	    	 
	      }, function(error){
	    	 toastMsg( error.message );
	    	 // end position error
	      }, 
          { timeout: 10000, enableHighAccuracy : getLocationAccuracy() } 
        );	    	  
    });     
}

function addMarkers(data, callback) {
  var markers = [];
  function onMarkerAdded(marker) {
    markers.push(marker);
    if (markers.length === data.length) {
      callback(markers);
    }
  }
  data.forEach(function(markerOptions) {
    map.addMarker(markerOptions, onMarkerAdded);
  });
}

function viewTaskDirection()
{	
	/*plugin.google.maps.external.launchNavigation({
	  "from": "Tokyo, Japan",
	   "to": "Kyoto, Japan"
	});*/	
		
   /*var delivery_address=getStorage('delivery_address');
   dump(delivery_address);*/
      
   var task_lat=getStorage('task_lat');
   var task_lng=getStorage('task_lng');
   
   dump(task_lat); dump(task_lng);
   
   var map_action = getStorage("map_action");
   dump(map_action);
   if ( map_action=="map2"){   	   
   	   task_lat=getStorage('dropoff_lat');
       task_lng=getStorage('dropoff_lng');
   }   
	
   navigator.geolocation.getCurrentPosition( function(position) {	    
   	         
         var yourLocation = new plugin.google.maps.LatLng(position.coords.latitude , position.coords.longitude); 	        
         //demo
         //var yourLocation = new plugin.google.maps.LatLng(34.039413 , -118.25480649999997); 	        
         
         var destination_location = new plugin.google.maps.LatLng(task_lat , task_lng); 	        
         
         plugin.google.maps.external.launchNavigation({
	         "from": yourLocation,
	         "to": destination_location
	      });	

    	 // end position success    	 
      }, function(error){
    	 toastMsg( error.message );
    	 // end position error
      }, 
      { timeout: 10000, enableHighAccuracy : getLocationAccuracy() } 
    );	    	  		
}

function clearPushCount()
{
	removeStorage("push_count");
	$(".baloon-notification").html('');
	$(".baloon-notification").hide();
}

function playNotification()
{
	 //var sound_url= getStorage("notification_sound_url");
	 var sound_url= "file:///android_asset/www/audio/fb-alert.mp3";
	 dump(sound_url);
	 if(!empty(sound_url)){
        playAudio(sound_url);
	 }
}

var my_media;

function playAudio(url) {
    // Play the audio file at url    
    my_media = new Media(url,
        // success callback
        function () {
            dump("playAudio():Audio Success");
            my_media.stop();
            my_media.release();
        },
        // error callback
        function (err) {
            dump("playAudio():Audio Error: " + err);
        }
    );
    // Play audio
    my_media.play();
}

function stopNotification()
{
	my_media.stop();
    my_media.release();
}

function AjaxNotification(action, params , done)
{
	dump('AjaxNotification');
	if ( !hasConnection() ){
		toastMsg( getTrans("Not connected to internet","no_connection") );
		done();
		return;
	}

	params+="&lang_id="+getStorage("kr_lang_id");
	if(!empty(krms_driver_config.APIHasKey)){
		params+="&api_key="+krms_driver_config.APIHasKey;
	}		
	if ( !empty( getStorage("kr_token") )){		
		params+="&token="+  getStorage("kr_token");
	}
	
	dump(ajax_url+"/"+action+"?"+params);
	
	ajax_request3 = $.ajax({
		url: ajax_url+"/"+action, 
		data: params,
		type: 'post',                  
		async: false,
		dataType: 'jsonp',
		timeout: 6000,
		crossDomain: true,
		 beforeSend: function() {
			if(ajax_request != null) {			 				   
	           ajax_request3.abort();
			} else {    
			}
		},
		complete: function(data) {					
			//ajax_request3=null;   	     							
			ajax_request3 = (function () { return; })();    
		},
		success: function (data) {	
			dump(data);
			done();
			if ( data.code==1){		
				$("#notifications-details").html( formatNotifications( data.details ) );		
			} else {		
				$("#notifications-details").html('');	
				toastMsg( data.msg );		   					
			}
		},
		error: function (request,error) {	  		    
			done();
		}
	});
	
}

function getLocationAccuracy()
{
	var location_accuracy = getStorage("kr_location_accuracy");
	if(!empty(location_accuracy)){
		if ( location_accuracy == 1){
			return true;
		}
	}
	return false;
}



function showAddNote(task_id, status_raw )
{	
	kNavigator.pushPage("Notes.html", {
	  animation: 'slide',
	  callback: function(){		 					  	  
	  	  dump('Notes');		  
	  	  $(".task_id").val(task_id);
	  	  
	  	  if ( status_raw=="cancelled" || status_raw=="successful" || status_raw=="failed"){	  	  	  
	  	  	  $(".add_notes_wrapper").hide();	  	
	  	  	  $(".toolbar-title-notes").html( getTrans("View Notes",'view_notes') );  	  
	  	  }
	  	  
	  	  callAjax("loadNotes","task_id="+task_id);
	  } 
   });
}

var showNotesPopover = function(element,id,notes) {   
   $(".notes_id").val(id);
   $(".notes_value").val(notes);
   notes_popover.show(element);  
};

function addNotes()
{
	var params = $( ".frm-notes").serialize();	
	params+="&task_id="+$(".task_id_details").val();	
	callAjax("addNotes",params);
}

function deleteNotes()
{
	notes_popover.hide();
	
	ons.notification.confirm({
	  message: getTrans("Are you sure?","are_you_sure") ,	  
	  title: dialog_title_default ,		  
	  buttonLabels: [ getTrans("Yes","yes") ,  getTrans("No","no") ],
	  animation: 'default', // or 'none'
	  primaryButtonIndex: 1,
	  cancelable: true,
	  callback: function(index) {	 	  	     	  
	  	   if (index==0){	  	   	 
				callAjax("deleteNotes","id=" + $(".notes_id").val() );
	  	   } else {
	  	   	   return false;
	  	   }
	  }
	});  	
}

function editNotes()
{
   var dialog = document.getElementById('editNotes');
   notes_popover.hide();      
   
   if (dialog) {   	  
      dialog.show();
      $(".edit_notes_fields").val( $(".notes_value").val() );
      TransLatePage();
   } else {
      ons.createDialog('editNotes.html')
      .then(function(dialog) {      	
      	$(".edit_notes_fields").val( $(".notes_value").val() );
        dialog.show();
        TransLatePage();
      });
   }   
}

function updateNotes()
{
	var params='';
	params+="id="+$(".notes_id").val();
	params+="&notes="+$(".edit_notes_fields").val();
	callAjax("updateNotes", params );
}

function view3DirectionMap(data)
{

	if(!isDebug()){
	   loader.show();
	}
	
	setStorage("map_action",'map2');
	var data = JSON.parse(getStorage("task_full_data"));
	if(!empty(data)){
		
		kNavigator.pushPage("Map.html", {
		  animation: 'fade',
		  callback: function(){		

		  	  dump(data);		
		  	  //alert(JSON.stringify(data));	 
		  	  		  	  
             if(!empty(data)){		  	  	  		  	  	  
		  	  	  if ( data.status_raw=="cancelled" || data.status_raw=="successful" || data.status_raw=="failed"){	  	  	  
		  	  	  	  $(".direction_wrap").hide();
		  	  	  	  $(".floating_action").hide();
		  	  	  }
		  	  }
		  	  
		  	  setStorage("task_lat", data.task_lat );
		  	  setStorage("task_lng", data.task_lng );
		  	  
		  	  //$(".direction_wrap").hide(); 		  	  
		  	  /*var params='';
		  	  params="driver_lat="+data.driver_lat;
		  	  params+="&driver_lng="+data.driver_lng;
		  	  params+="&dropoff_lat="+data.dropoff_lat;
		  	  params+="&dropoff_lng="+data.dropoff_lng;		  	  
		  	  params+="&task_lat="+data.task_lat;
		  	  params+="&task_lng="+data.task_lng;		  	  
		  	  callAjax("trackDistance",params);*/
		  	  

		  	  if (isDebug()){
		        return;
	          }
		  	  
		  	  var dropoff_location = new plugin.google.maps.LatLng( data.dropoff_lat , data.dropoff_lng );
		  	  var task_location = new plugin.google.maps.LatLng( data.task_lat , data.task_lng );

		  	  /*alert("dropoff "+data.dropoff_lat + " => "+ data.dropoff_lng );
		  	  alert("task location "+data.task_lat + " => "+ data.task_lng );*/
		  	  
		  	  setStorage("dropoff_lat", data.dropoff_lat );
		  	  setStorage("dropoff_lng", data.dropoff_lng );		  	  
		  	  
		  	  setTimeout(function(){ 	    
		        var div = document.getElementById("map_canvas");
		        $('#map_canvas').css('height', $(window).height() - $('#map_canvas').offset().top);
		        
		        map = plugin.google.maps.Map.getMap(div, {     
			     'camera': {
			      'latLng': dropoff_location,
			      'zoom': 17
			     }
			    });
			    
			    map.clear();
		        map.off();
			    
		        map.setBackgroundColor('white');		        
		        map.on(plugin.google.maps.event.MAP_READY, function(){
		        			        	 
		        	 
		        	 navigator.geolocation.getCurrentPosition( function(position) {	   
		        	
		        	    var driver_location = new plugin.google.maps.LatLng(position.coords.latitude , position.coords.longitude); 	
		        	    
		        	    //alert("driver_location "+position.coords.latitude + " => "+ position.coords.longitude );
		        	    
		        	    
		        	    var task_data = JSON.parse(getStorage("task_full_data"));
		        	    		        	    
		        	    /*alert(task_data.map_icons.driver);
		        	    alert(task_data.map_icons.merchant);
		        	    alert(task_data.map_icons.customer);*/
		        	    		        	    
		        	    var data_marker = [      
						{ 
					        'title': getTrans("You are here","you_are_here"),
					        'position': driver_location ,
					        //'snippet': getTrans( "Driver name" ,'driver_name'),
					        'icon': {
						       'url': task_data.map_icons.driver
						    }
					      },{ 
					        'title': data.drop_address , 							            
					        'position': dropoff_location ,
					        'snippet': getTrans( "Merchant Address" ,'merchant_address'),
					        'icon': {
						       'url': task_data.map_icons.merchant
						    }
					      },{ 
					        'title': data.delivery_address , 
					        'position': task_location ,
					        'snippet': getTrans( "Delivery Address" ,'delivery_address'),
					        'icon': {
						       'url': task_data.map_icons.customer
						    }
					      }  
					    ];
					    
					    
					   hideAllModal(); 
					    
					   map.setCenter(driver_location);             
					   map.setZoom(17);
		        	    				        					    
					   addMarkers(data_marker, function(markers) {
					    
					   	  	map.addPolyline({
							points: [
							  driver_location,
							  dropoff_location
							],
							'color' : '#AA00FF',
							'width': 10,
							'geodesic': true
							}, function(polyline) {
							   
							   map.animateCamera({
								  'target': dropoff_location,
								  'zoom': 17,
								  'tilt': 30
								}, function() {
																	
									map.addPolyline({
									points: [
									  dropoff_location,
									  task_location
									],
									'color' : '#AA00FF',
									'width': 10,
									'geodesic': true
									}, function(polyline) {
									   
										map.animateCamera({
										  'target': task_location,
										  'zoom': 17,
										  'tilt': 30
										}, function() {
											
										}); /*end camera*/
										 
									}); /*end line*/  	
											
															   
							   });  /*end camera*/
								
							}); /*end line*/  
					   	
					   }); /*end markers*/
					    				    
		        	 	 	
		        	 }, function(error){
		        	 	 hideAllModal();	
				    	 toastMsg( error.message );
				    	 // end position error
				      }, 
			          { timeout: 10000, enableHighAccuracy : getLocationAccuracy() } 
			        );	   	
		        	
		       }); 
		        		        
		    }, 300); // and timeout for clear transitions  	  	  
		  	  	  	  
		  } 
	    });
	
	} else {
		hideAllModal();	
		onsenAlert( getTrans("Map not available",'map_not_available') );
	}
}

function trackDistance()
{
	var map_action=getStorage("map_action");
	dump("map_action+>"+map_action);
	var data = JSON.parse(getStorage("task_full_data"));
	if(!empty(data)){
	    dump(data);
	    switch (map_action)
	    {
	    	case "map2":
	    	  var params='';
		  	  params="driver_lat="+data.driver_lat;
		  	  params+="&driver_lng="+data.driver_lng;
		  	  params+="&dropoff_lat="+data.dropoff_lat;
		  	  params+="&dropoff_lng="+data.dropoff_lng;		  	  
		  	  params+="&task_lat="+data.task_lat;
		  	  params+="&task_lng="+data.task_lng;	
		  	  params+="&map_action="+map_action;	  	  
		  	  callAjax("trackDistance",params);
	    	break;
	    	
	    	case "map1":
	    	  var params='';
		  	  params="driver_lat="+data.driver_lat;
		  	  params+="&driver_lng="+data.driver_lng;
		  	  params+="&task_lat="+data.task_lat;		  	  
		  	  params+="&task_lng="+data.task_lng;		  	  
		  	  params+="&map_action="+map_action
		  	  callAjax("trackDistance",params);
	    	break;
	    	
	    	default:
	    	break;
	    }
	}
}

function showDistanceInfo(data)
{
   dump(data);
   var dialog = document.getElementById('trackDistanceDialog');
   var html='';
   if ( data.map_action=="map2"){
   	
   	   if ( data.merchant_distance!=2){
   	   	   html+='<p><b>'+getTrans("Your location to merchant",'location_to_merchant')+':</b></p>';
		   html+='<p>';
		   html+=getTrans("distance",'distance')+': '+ data.merchant_distance.distance +'<br/>';		   
		   html+= getTrans("duration",'duration')+ ': '+data.merchant_distance.duration ;
		   html+='</p>';
		   html+='<hr/>';
   	   }
   	   if ( data.delivery_distance!=2){
   	   	   html+='<p><b>'+getTrans("Merchant to customer",'merchant_to_customer')+':</b></p>';
		   html+='<p>';
		   html+=getTrans("distance",'distance')+': '+ data.delivery_distance.distance +'<br/>';		   
		   html+= getTrans("duration",'duration')+ ': '+data.delivery_distance.duration;
		   html+='</p>';		   
   	   }
   	
   } else if ( data.map_action =="map1"){   	
   	   if ( data.merchant_distance!=2){
   	   	   html+='<p><b>'+getTrans("Your location to customer",'location_to_customer')+':</b></p>';
		   html+='<p>';
		   html+=getTrans("distance",'distance')+': '+ data.merchant_distance.distance+'<br/>';
		   html+= getTrans("duration",'duration')+ ': '+data.merchant_distance.duration;
		   html+='</p>';
		   html+='<hr/>';
   	   }   
   }
   
   if (dialog) {   	  
   	  $(".distance_info").html(html);
      dialog.show();      
   } else {
      ons.createDialog('trackDistanceDialog.html')
      .then(function(dialog) {      	      	
      	$(".distance_info").html(html);
        dialog.show();
      });
   }   
}

function closeDistanceDialog()
{
	var dialog = document.getElementById('trackDistanceDialog');
	dialog.hide();
}

function initIntelInputs()
{
	 var mobile_country_code=getStorage("mobile_country_code");
	 dump(mobile_country_code);
	 if(!empty(mobile_country_code)){
	 	 $(".mobile_inputs").intlTelInput({      
		    autoPlaceholder: false,		      
		    defaultCountry: mobile_country_code,  
		    autoHideDialCode:true,    
		    nationalMode:false,
		    autoFormat:false,
		    utilsScript: "lib/intel/lib/libphonenumber/build/utils.js"
		 });
	 } else {
		 $(".mobile_inputs").intlTelInput({      
		    autoPlaceholder: false,		        
		    autoHideDialCode:true,    
		    nationalMode:false,
		    autoFormat:false,
		    utilsScript: "lib/intel/lib/libphonenumber/build/utils.js"
		 });
	 }
}

function signup()
{	
	var params = $( "#frm-signup").serialize();	
	params+="&device_platform="+ getStorage("device_platform");	
	callAjax("signup",params);
}

function showDeviceGallery(action_type)
{		
	
	dump("action_type=>"+action_type);
	/*where action type
	1 = profile
	2 = task add picture
	
	*/
			
	if(isDebug()){
		uploadLoader.show();
		$(".bytes_send").html("10%");		
		setTimeout(function(){
			uploadLoader.hide();
			$("#progress_bar").attr("value",0);
			$(".bytes_send").html("0%");
		 }, 3000);	
		return;
	}
	
	
	switch (action_type)
	{
		case 1:
		case "1":
		
		navigator.camera.getPicture(uploadPhoto, function(){
			toastMsg( getTrans("Get photo failed","get_photo_failed") );
		},{
		    destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
		    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
	    });
	    
	    
		break;
		
		case 2:
		case "2":
		
		var dialog = document.getElementById('addphotoSelection');
	    dialog.hide();
	    	   
	    navigator.camera.getPicture(uploadTaskPhoto, function(){
			toastMsg( getTrans("Get photo failed","get_photo_failed") );
		},{
		    destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
		    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
	    });
		
		break;
	}		
}

function uploadPhoto(imageURI)
{
	 
	 uploadLoader.show();
	 
	 setTimeout(function(){
		$("#progress_bar").attr("value",0);
		$(".bytes_send").html("5%");
	 }, 1);	
	 	 
	 var options = new FileUploadOptions();
	 options.fileKey = "file";
	 options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
	 options.mimeType = "image/jpeg";
	 	 
	 var params = {};
	 params.token = getStorage("kr_token") ;	 
	 options.params = params;
 
	 options.chunkedMode = false;	
	 
	 var headers={'headerParam':'headerValue'};
	 options.headers = headers;
	
	 var ft = new FileTransfer();	 	 	 
	 
	 ft.onprogress = function(progressEvent) {
     if (progressEvent.lengthComputable) {
     	    //toastMsg( "progressEvent=>"+progressEvent.loaded + " - " + progressEvent.total );
     	    
     	    var loaded_bytes= parseInt(progressEvent.loaded);
     	    var total_bytes= parseInt(progressEvent.total);
     	    
     	    var loaded_percent = (loaded_bytes/total_bytes)*100;	        
     	    loaded_percent=Math.ceil(loaded_percent);
     	    
	        
	        $("#progress_bar").attr("value",loaded_percent);
		    $(".bytes_send").html(loaded_percent+"%");
	        
	        if(loaded_bytes>=total_bytes){	        	        
	        	uploadLoader.hide();
	        	$("#progress_bar").attr("value",0);
		        $(".bytes_send").html("0%");
	        }
     	    
	        loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);	        
	        
	    } else {	    		    	
	        loadingStatus.increment();	        
	    }
	 };
	 	 
	 ft.upload(imageURI, ajax_url+"/UploadProfile", function(result){
	    //alert(JSON.stringify(result));
	    /*alert(result.responseCode);
	    alert(JSON.stringify(result.response));	*/
	    	    
	    
	    var response=explode("|",result.response);
	    //alert(response[0]);	
	    toastMsg(response[1]);	
	    
	    if ( response[0]=="1" || response[0]==1){
		    $(".profile-bg").css('background-image', 'url(' + response[2] + ')');
			$(".profile-bg").css("background-size","cover");
			$(".avatar").attr("src", response[2] );
			
			$("#img_loader_wrap").addClass("img_loader");
			
		    imageLoaded('.img_loader');
	    }
		
		if( $('#uploadLoader').is(':visible') ){
			uploadLoader.hide();
			$("#progress_bar").attr("value",0);
		    $(".bytes_send").html("0%");
		}
	    
	 }, function(error){
	 	 uploadLoader.hide();
	     toastMsg( getTrans("An error has occurred: Code","error_occured") + " "+ error.code);
	 }, options);
}

function addPhotoSelection()
{
	var dialog = document.getElementById('addphotoSelection');
	if (dialog) {
	      dialog.show();	      	      
	} else {
	    ons.createDialog('addphotoSelection.html')
	      .then(function(dialog) {
	        dialog.show();	        	        
	        setTimeout('TransLatePage()', 300);	
	    });
	}	
}

function showCemara()
{
		
	if (isDebug()){
		toastMsg("show camera");
		var dialog = document.getElementById('addphotoSelection');
	    dialog.hide();
		return;
	}
	
	/*navigator.camera.getPicture(uploadTaskPhoto, function(){
		toastMsg( getTrans("Get photo failed","get_photo_failed") );
	},{
	    destinationType: Camera.DestinationType.FILE_URI,
	    sourceType: Camera.PictureSourceType.CAMERA,
	    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
    });*/
	
	var cam_options = {
		destinationType: Camera.DestinationType.FILE_URI,
	    sourceType: Camera.PictureSourceType.CAMERA,
	    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
	};
	
	var app_resize_picture = getStorage("enabled_resize_photo");
	
	if ( app_resize_picture==1){
		cam_options={
			destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: Camera.PictureSourceType.CAMERA,
		    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY),
		    targetHeight: getStorage("photo_resize_width") ,
			targetWidth:  getStorage("photo_resize_height")
		};
	}
	
	navigator.camera.getPicture(uploadTaskPhoto, function(){
		toastMsg( getTrans("Get photo failed","get_photo_failed") );
	}, cam_options );
}

function uploadTaskPhoto(imageURI)
{
	
     uploadLoader.show();
	 
	 setTimeout(function(){
		$("#progress_bar").attr("value",0);
		$(".bytes_send").html("0%");
	 }, 1);	
	 	 
	 var options = new FileUploadOptions();
	 options.fileKey = "file";
	 options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
	 options.mimeType = "image/jpeg";
	 	 
	 var params = {};
	 params.token = getStorage("kr_token") ;	 
	 params.task_id = $(".task_id_details").val() ;	 
	 options.params = params;
 
	 options.chunkedMode = false;	
	 
	 var headers={'headerParam':'headerValue'};
	 options.headers = headers;
	
	 var ft = new FileTransfer();	 	 	 
	 
	 ft.onprogress = function(progressEvent) {
     if (progressEvent.lengthComputable) {
     	    
     	    var loaded_bytes= parseInt(progressEvent.loaded);
     	    var total_bytes= parseInt(progressEvent.total);
     	    
     	    var loaded_percent = (loaded_bytes/total_bytes)*100;	        
     	    loaded_percent=Math.ceil(loaded_percent);
     	    	        
	        $("#progress_bar").attr("value",loaded_percent);
		    $(".bytes_send").html(loaded_percent+"%");
	        
	        if(loaded_bytes>=total_bytes){	        	        
	        	uploadLoader.hide();
	        	$("#progress_bar").attr("value",0);
		        $(".bytes_send").html("0%");
	        }
     	    
	        loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);	        
	        
	    } else {	    		    	
	        loadingStatus.increment();	        
	    }
	 };
	 	 
	 ft.upload(imageURI, ajax_url+"/UploadTaskPhoto", function(result){
	    //alert(JSON.stringify(result));
	    /*alert(result.responseCode);
	    alert(JSON.stringify(result.response));	*/

	    if( $('#uploadLoader').is(':visible') ){
			uploadLoader.hide();
			$("#progress_bar").attr("value",0);
		    $(".bytes_send").html("0%");
		}    
	    
	    var response=explode("|",result.response);	    
	    toastMsg(response[1]);		   
	    if ( response[0]=="1" || response[0]==1){
	    	var dialog = document.getElementById('addphotoSelection');
	        dialog.hide();	    	                
	        callAjax("TaskDetails",'task_id=' + $(".task_id_details").val() );
	    }
	    
	 }, function(error){
	 	 uploadLoader.hide();
	     toastMsg( getTrans("An error has occurred: Code","error_occured") + " "+ error.code);
	 }, options);
}

function showPhotoPage()
{
   //photoPage	
   showPage("photoPage.html",'');
}

function deletePhoto(id)
{
	ons.notification.confirm({
	  title: dialog_title_default ,		  
      message: getTrans("Delete this photos?","delete_this_photo") ,
      callback: function(idx) {
        switch (idx) {
          case 0:            
            break;
          case 1:
            callAjax("deletePhoto",'id=' + id );
            break;
        }
      }
    });
}

/*Location tracking in background*/
document.addEventListener("pause", onBackgroundMode, false);

function onBackgroundMode() {    
    	
	app_running_status="background";
	
	if ( !hasConnection() ){	
		backgroundGeolocation.stop();
		return;
	}
	
	var kr_token=getStorage("kr_token");
	//toastMsg(kr_token);
	if(empty(kr_token)){
		backgroundGeolocation.stop();
		return;
	}
	
	var app_disabled_bg_tracking=getStorage("disabled_tracking_bg");
	if (app_disabled_bg_tracking==1 || app_disabled_bg_tracking=="1"){
		backgroundGeolocation.stop();
		return;
	}
	
	var min_frequency = getStorage("track_interval");
	
	if (min_frequency<=0){
		min_frequency=8000;
	}
	if (empty(min_frequency)){
		min_frequency=8000;
	}
	
	//toastMsg(min_frequency);
		
	backgroundGeolocation.configure(function(location){
		
		//toastMsg('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);
		
		//callAjax2("UpdateActivity","lat="+location.latitude + "&lng="+ location.longitude );
		params = 'lat='+ location.latitude + "&lng=" + location.longitude + "&app_version=" + BuildInfo.version;
		
		params+="&altitude="+ location.altitude;
	    params+="&accuracy="+ location.accuracy;
	    params+="&altitudeAccuracy=";
	    params+="&heading="+ location.bearing;
	    params+="&speed="+ location.speed;
	    params+="&track_type=background";
		
        callAjax2('updateDriverLocation', params);
		
		/*stop watch position*/
        navigator.geolocation.clearWatch(watchID);
		
		backgroundGeolocation.finish();
		//20000
		
	}, function(error){
		
		 toastMsg('BackgroundGeolocation error');
		
	}, {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 1,
	        interval: min_frequency,
        activitiesInterval: min_frequency,
        locationProvider: backgroundGeolocation.provider.ANDROID_ACTIVITY_PROVIDER,
        stopOnStillActivity:false,
        notificationTitle: BuildInfo.name ,
        notificationText: getTrans("Tracking","tracking") +  "...",
        pauseLocationUpdates:false,
        fastestInterval: min_frequency,
        stopOnTerminate: true,
        stopOnStillActivity: false
    });
	
    setStorage("bg_tracking",1);
    /*stop watch position*/
    navigator.geolocation.clearWatch(watchID);
    
    backgroundGeolocation.start();   
}

document.addEventListener("resume", onForegroundMode, false);

function onForegroundMode()
{	
	app_running_status="active";
	
	setStorage("bg_tracking",2);
	checkGPS();
	backgroundGeolocation.stop();
		
	/*clear badge*/
	push.setApplicationIconBadgeNumber(function() {
	    //console.log('success');
	}, function() {
	    //console.log('error');
	}, 0);
}