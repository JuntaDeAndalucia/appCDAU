var iframeMapa;

var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener("deviceready", this.onDeviceReady, true);
       
    },
    onDeviceReady: function() {
	//console.log("Ready!");
	iframeMapa = document.createElement('iframe');
	iframeMapa.id="imapa";
	iframeMapa.scrolling='no';	
	document.getElementById('divMapa').appendChild(iframeMapa);
	iframeMapa.onload=function(){
		//console.log('loaded');
		navigator.splashscreen.hide();
	};
	navigator.geolocation.getCurrentPosition(setMap, setMapNoLocation, {maximumAge: 15000, timeout: 5000, enableHighAccuracy:true});
    }
};

function setMap(pos) {
	var prj25830 ="+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs";
	posProj = proj4(prj25830,[pos.coords.longitude,pos.coords.latitude]);
	iframeMapa.src = configMap() + "&zoom=10&center="+posProj[0]+","+posProj[1]; 
}

function setMapNoLocation(error) {
	iframeMapa.src = configMap();
}

function configMap(){
	var src = urlMapea + "?controls=location";
	if (contextos!=""){src += "&" + contextos;}
	if (layers!=""){src += "&layers=" + layers;}
	if (urlGeosearch!=""){src += "&geosearch=" + urlGeosearch;}
	if (extra!=""){src += "&" + extra;}
	
	return src;
}

app.initialize();

