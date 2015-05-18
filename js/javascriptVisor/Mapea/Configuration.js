/**
 * Archivo con la configuracion de los distintos parametros de Mapea 
 */
Mapea.Configuration = {
    /**
     * URL del servicio de impresion
     */
    printerUrl : "http://geoprint-sigc.juntadeandalucia.es/geoprint/pdf",

    /**
     * URL de los servicios web de Callejero
     */
    callejeroWSUrl : "http://sigc.i-administracion.junta-andalucia.es/callejeroandalucia/geocoder/services/callejero?wsdl",

    /**
     * URL de Geobusquedas
     */
    geosearchUrl : "http://geobusquedas-sigc.juntadeandalucia.es/sigc/search?fq=-(keywords:via,plazas,avenida,carreteras,autovia,autopista)",

    /**
     * URL de la operacion de busqueda por localizacion
     */
    geosearchByLocation : "http://geobusquedas-sigc.juntadeandalucia.es/sigc/search?fq=-(keywords:Calles,direcciones,plazas,avenida,carreteras,autovia,autopista,vias,calzada,camino,glorieta,plazoleta,ronta,rotonda,direcciones,municipales)&rows=100",

    /**
     * Radio (en metros) usado en las busquedas por localizacion
     */
    geosearchByLocationDistance : 600,

    /**
     * Numero de capas disponibles para la version movil
     */
    numLayerMobile : 10,

    /**
     * Parametros de los contextos WMC
     */
    contexts : "callejerocacheado,callejero,ortofoto,idea,ortofoto09,callejero2011cache,ortofoto2011cache,hibrido2011cache",

    /**
     * URL de los archivos WMC correspondientes a los distintos contextos
     */
    contextsUrl : "http://mapea-sigc.juntadeandalucia.es/Componente/mapConfig/contextCallejeroCache.xml,http://mapea-sigc.juntadeandalucia.es/Componente/mapConfig/contextCallejero.xml,http://mapea-sigc.juntadeandalucia.es/Componente/mapConfig/contextOrtofoto.xml,http://mapea-sigc.juntadeandalucia.es/Componente/mapConfig/contextIDEA.xml,http://mapea-sigc.juntadeandalucia.es/Componente/mapConfig/contextOrtofoto2009.xml,http://mapea-sigc.juntadeandalucia.es/Componente/mapConfig/callejero2011cache.xml,http://mapea-sigc.juntadeandalucia.es/Componente/mapConfig/ortofoto2011cache.xml,http://mapea-sigc.juntadeandalucia.es/Componente/mapConfig/hibrido2011cache.xml",

    /**
     * Titulos de los correspondientes contextos
     */
    contextsTitle : "mapa callejero cache,mapa del callejero,mapa ortofoto,mapa idea,mapa ortofoto09,Callejero,Ortofoto,Híbrido",

    /**
     * Parametros de los temas disponibles
     */
    themes : "default,dark,classic",

    /**
     * URL de los distintos temas disponibles
     */
    themesUrl : "http://mapea-sigc.juntadeandalucia.es/Componente/javascriptVisor/Mapea/theme/default,http://mapea-sigc.juntadeandalucia.es/Componente/javascriptVisor/Mapea/theme/dark,http://mapea-sigc.juntadeandalucia.es/Componente/javascriptVisor/Mapea/theme/classic",

    /**
     * Projeccion por defecto con sus unidades. Formato: SRS*unidades
     */
    SRS : 'EPSG:23030*m',
    
    /**
     * Mapeo de capas tileadas para el modulo de impresion
     */
    wmsTiledLayers : 'base,SPOT_Andalucia,orto_2010-11_25830,CallejeroCompleto,orto_2010-11_23030',
    wmsTiledServers : 'http://www.callejerodeandalucia.es/servicios/base/gwc/service/wms?,http://www.callejerodeandalucia.es/servicios/base/gwc/service/wms?,http://www.ideandalucia.es/geowebcache/service/wms?,http://www.juntadeandalucia.es/servicios/mapas/callejero/wms-tiled?,http://www.ideandalucia.es/geowebcache/service/wms?',
    wmsLayers : 'CDAU_base,mosaico_spot_2005,orto_2010-11,CallejeroCompleto,orto_2010-11',
    wmsServers : 'http://www.callejerodeandalucia.es/servicios/base/wms?,http://www.juntadeandalucia.es/medioambiente/mapwms/REDIAM_SPOT_Andalucia_2005?,http://www.ideandalucia.es/wms/ortofoto2010?,http://www.juntadeandalucia.es/servicios/mapas/callejero/wms?,http://www.ideandalucia.es/wms/ortofoto2010?'
};
