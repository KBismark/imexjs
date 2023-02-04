!function(){
    /*
     * Code importation and exportation library.
     * -Version: 0.0.1-
     * -Lincense: MIT- 
     * 
     * The JSHON Project by Kwabena Bismark.
     * See project on github: https://github.com/KBismark/JSHON
     * Join us on tech forums: []
     */

    var symbolIdentifier = "$_"+Math.random()+"-";
    function setFreezedObjectProperty(obj,key,value){
        return Object.defineProperty(obj,key, {
            value:value,
            enumerable:false,
            configurable:false,
            writable:false
        });
    };
    function setWritableObjectProperty(obj,key,value){
        return Object.defineProperty(obj,key,{
            value:value,
            enumerable:false,
            configurable:false,
            writable:true
        })
    };
    function setFreezedObjectProperties(obj,propsObj){
        var keys = Object.keys(propsObj);
        for(var i=0;i<keys.length;i++){
            setFreezedObjectProperty(obj,keys[i],propsObj[keys[i]]);
        }
        return obj;
    }

    /**
     * Loads script files by creating a new script element.
     */
    function loadScripts(src,dependency){
        var script = document.createElement("script");
        script.src = [src,typeof(modulesVersion[src])=="string"?modulesVersion[src]:""].join("");
        script.onerror = function(){
            JSHON[symbolIdentifier+"requested"][dependency]=false;
            var importsKey = symbolIdentifier+"imports",i;
            var dependants = JSHON[importsKey][dependency];
            if(dependants){
                //Send unsuccessful message to all modules 
                //that depends on this particular module.
                for(i=0;i<dependants.length;i++){
                    modulesCallback(false,dependants[i]);
                }
            }
            this.onerror=null;
        };
        return script;
    }
    var modules={},modulesReqObj={abort:function(){}},
    currentModuleRequest=modulesReqObj,currentLoadingModule={
        src:null
    };
    //Allows aborting page loads. 
    function pageLoadAborter(src){
        return {
            abort:function(){
                if(src===currentLoadingModule.src){
                    currentModuleRequest.abort();
                    currentModuleRequest=modulesReqObj;
                    modules[currentLoadingModule.src].onload=null;
                    modules[currentLoadingModule.src].onerror=null;
                    modules[currentLoadingModule.src].loading=false;
                }
            }
        }
    }
    function moduleRequestsOnload(){
        if(this.status>=200&&this.status<300){
            currentModuleRequest=modulesReqObj;
            modules[this.pageSrc].loading=false;
            modules[this.pageSrc].loaded=true;
            modules[this.pageSrc].jshonLoading=true;
            var script=document.createElement("script");
            script.textContent=this.responseText;
            document.head.appendChild(script);
            JSHON.loadModule(this.pageSrc,{
                onload:scopedJSHONonload(this.pageSrc),
                onerror:scopedJSHONonerror(this.pageSrc),
                args:this.args
            });
        }else{
            this.onerror();
        }
        
    };
    function moduleRequestsOnabort(){
        currentModuleRequest=modulesReqObj;
        modules[this.pageSrc].loading=false;
        modules[this.pageSrc].onerror=null;
        modules[this.pageSrc].onload=null;
    };
    function moduleRequestsOnerror(){
        currentModuleRequest=modulesReqObj;
        var onerror = modules[this.pageSrc].onerror;
        modules[this.pageSrc].onerror=null;
        modules[this.pageSrc].onload=null;
        modules[this.pageSrc].loading=false;
        modules[this.pageSrc].loaded=false;
        if(onerror){
            onerror(this.args);
        }
    };

    function scopedJSHONonload(pageSrc){
        return function(args){
            var onload=modules[pageSrc].onload;
            modules[pageSrc].onerror=null;
            modules[pageSrc].onload=null;
            modules[pageSrc].jshonLoaded=true;
            modules[pageSrc].jshonLoading=false;
            if(currentLoadingModule.src===pageSrc){
                onload(args);
            }
            pageSrc=null;
        }
    };
    function scopedJSHONonerror(pageSrc){
        return function(args){
            var onerror = modules[pageSrc].onerror;
            modules[pageSrc].onerror=null;
            modules[pageSrc].onload=null;
            modules[pageSrc].jshonLoaded=false;
            modules[pageSrc].jshonLoading=false;
            if(onerror&&currentLoadingModule.src===pageSrc){
                onerror(args);
            }
            pageSrc=null;
        }
    };
    
    function pageLoader(src,props){
        currentModuleRequest.abort();
        if(typeof(currentLoadingModule.src)=="string"){
            modules[currentLoadingModule.src].onload=null;
            modules[currentLoadingModule.src].onerror=null;
            modules[currentLoadingModule.src].loading=false;
        }
        currentLoadingModule.src=null;
        var request = new XMLHttpRequest();
        request.pageSrc=src;
        request.args=props.args;
        request.onload=moduleRequestsOnload;
        request.onerror=moduleRequestsOnerror;
        //request.onabort=moduleRequestsOnabort;
        modules[src].onload=props.onload;
        modules[src].onerror=props.onerror;
        modules[src].loading=true;
        request.open("GET",[src,typeof(modulesVersion[src])=="string"?modulesVersion[src]:""].join(""),true);
        currentModuleRequest=request;
        currentLoadingModule.src=src;
        var importsKey = symbolIdentifier+"imports",
        dependency=symbolIdentifier+src;
        if(!JSHON[importsKey][dependency]){
            JSHON[importsKey][dependency] = [];
        }
        request.send();
    };

    ////Uses Ajax to load index files to pages
    function loadPage(src,props){
        if(modules[src]){
            if(modules[src].loaded){
                currentModuleRequest.abort();
                currentModuleRequest=modulesReqObj;
                if(typeof(currentLoadingModule.src)=="string"){
                    modules[currentLoadingModule.src].onload=null;
                    modules[currentLoadingModule.src].onerror=null;
                    modules[currentLoadingModule.src].loading=false;
                }
                currentLoadingModule.src=src;
                if(modules[src].jshonLoaded){
                    JSHON.loadModule(src,props);
                }else{
                    modules[src].onload=props.onload;
                    modules[src].onerror=props.onerror;
                    if(!modules[src].jshonLoading){
                        JSHON.reloadModule(src);
                    }
                }
            }else{
                if(!modules[src].loading){
                    pageLoader(src,props);
                }else{
                    modules[src].onload=props.onload;
                    modules[src].onerror=props.onerror;
                }
            }
            return pageLoadAborter(src);
        };
        modules[src]={
            loaded:false,
            loading:false,
            jshonLoaded:false,
            jshonLoading:false,
            onload:props.onload,
            onerror:props.onerror,
            onabort:props.onabort
        };
        if(JSHON.includesModule(src)){
            currentModuleRequest.abort();
            if(typeof(currentLoadingModule.src)=="string"){
                modules[currentLoadingModule.src].onload=null;
                modules[currentLoadingModule.src].onerror=null;
                modules[currentLoadingModule.src].loading=false;
            }
            currentLoadingModule.src=src;
            modules[src].loaded=true;
            modules[src].jshonLoading=true;
            JSHON.loadModule(src,{
                onload:scopedJSHONonload(src),
                onerror:scopedJSHONonerror(src),
                args:props.args
            });
        }else{
            pageLoader(src,props);
        }
        
        return pageLoadAborter(src);
    };

    //Sends load response (true/false) to module dependeencies
    function modulesCallback(result,dependantData){
        JSHON.import[dependantData.pathname].loadResult[dependantData.position] = result;
        if(!dependantData.regulator.firstload){
            dependantData.regulator.requests++;
            if(
                dependantData.regulator.requests==dependantData.regulator.expectedRequests
                /** All requests has returned */
            ){  
                dependantData.regulator.firstload=true;
                if(
                    JSHON.import[dependantData.pathname].loadResult.indexOf(false)<0
                    /** All dependencies are loaded successfully */
                ){
                    JSHON[symbolIdentifier+'currentPathname']=JSHON.import[dependantData.pathname].main;
                    JSHON.import[dependantData.pathname].onload();
                    JSHON.import[dependantData.pathname].onload=null;
                    JSHON.import[dependantData.pathname].onerror=null;
                    JSHON.import[dependantData.pathname].onerrorOnce=null;
                }else{
                    var importsKey = symbolIdentifier+"imports",i;
                    var dependants = JSHON[importsKey][dependantData.pathname];
                    if(dependants){
                        //Send unsuccessful message to all modules 
                        //that depends on this particular module.
                        for(i=0;i<dependants.length;i++){
                            modulesCallback(false,dependants[i]);
                        }
                    }
                    if(JSHON.import[dependantData.pathname].onerrorOnce){
                        JSHON.import[dependantData.pathname].onerrorOnce();
                        JSHON.import[dependantData.pathname].onerrorOnce=null;
                    }
                    if(JSHON.import[dependantData.pathname].onerror){
                        JSHON.import[dependantData.pathname].onerror();
                    }
                }
                dependantData.regulator.requests = 0;
            }
        }else{
            if(JSHON.import[dependantData.pathname].successful.indexOf(dependantData.position)<0){
                dependantData.regulator.requests++;
            }
            if(
                JSHON.import[dependantData.pathname].loadResult.indexOf(false)<0
                /** All dependencies are loaded successfully */
            ){
                JSHON[symbolIdentifier+'currentPathname']=JSHON.import[dependantData.pathname].main;
                JSHON.import[dependantData.pathname].onload();
                JSHON.import[dependantData.pathname].onload=null;
                JSHON.import[dependantData.pathname].onerror=null;
                JSHON.import[dependantData.pathname].onerrorOnce=null;
            }else{
                var totalReq = dependantData.regulator.requests+JSHON.import[dependantData.pathname].successful.length;
                if(totalReq==dependantData.regulator.expectedRequests){
                    var importsKey = symbolIdentifier+"imports",i;
                    var dependants = JSHON[importsKey][dependantData.pathname];
                    if(dependants){
                        //Send unsuccessful message to all modules 
                        //that depends on this particular module.
                        for(i=0;i<dependants.length;i++){
                            modulesCallback(false,dependants[i]);
                        }
                    }
                    if(JSHON.import[dependantData.pathname].onerror){
                        JSHON.import[dependantData.pathname].onerror();
                    }
                    dependantData.regulator.requests = 0;
                }
            }
        }

    }

    //Reload modules in case of failure after `loadModule()`
    function reloadModule(src){
        var dependency = symbolIdentifier+src;
        var i;
        if(this.import[dependency]/** Module is already loaded */){
            if(this.import[dependency].setup/** If module was correctly setup */){
                if(
                    this.import[dependency].loadResult.indexOf(false)>=0
                    /** Could not load dependencies of this module successfully */
                ){
                    /** Reload dependencies that were not loaded successfully */
                    for(i=0;i<this.import[dependency].loadResult.length;i++){
                        if(!this.import[dependency].loadResult[i]){
                            this.reloadModule(this.import[dependency].dependencies[i]);
                        }
                    }
                }
            }
        }else/** The module's file is not loaded at all */ {
            if(
                !this[symbolIdentifier+"requested"][dependency]
                /** If not in the process loading, request for it */
            ){
                this[symbolIdentifier+"requested"][dependency]=true;
                document.head.appendChild(loadScripts(src,dependency))
            }
        }
    };
    var inAppModuleLoads = {};
    //Loads modules
    function loadModule(src,{onload=null,onerror=null,args=undefined}){
        if(typeof (onload)=="function"){
            if(!inAppModuleLoads[src]){
                inAppModuleLoads[src] = {
                    listeners:[
                        {
                            onerror:onerror,onload:onload,
                            args:args
                        }
                    ],
                    loaded:false,
                    loading:true
                }
                JSHON.pathname = symbolIdentifier+"inAppModuleLoads-"+src;
                JSHON.include(src);
                JSHON.onerror=(function(src){
                    return function(){
                        inAppModuleLoads[src].loading=false;
                        var i;
                        for(i=0;i<inAppModuleLoads[src].listeners.length;i++){
                            if(typeof (inAppModuleLoads[src].listeners[i].onerror)=="function"){
                                inAppModuleLoads[src].listeners[i].onerror(inAppModuleLoads[src].listeners[i].args)
                            }
                        }
                    }
                })(src);
                JSHON.onload=(function(src){
                    return function(){
                        inAppModuleLoads[src].loaded=true;
                        var i;
                        for(i=0;i<inAppModuleLoads[src].listeners.length;i++){
                            inAppModuleLoads[src].listeners[i].onload(inAppModuleLoads[src].listeners[i].args)
                        }
                        inAppModuleLoads[src].listeners=null;
                    }
                })(src);
            }else{
                if(inAppModuleLoads[src].loaded){
                    onload(args);
                }else{
                    inAppModuleLoads[src].listeners.push({
                        onerror:onerror,onload:onload,
                        args:args
                    });
                    if(!inAppModuleLoads[src].loading){
                        inAppModuleLoads[src].loading=true;
                        JSHON.reloadModule(src)
                    }
                    
                }
            }
        }
    
    };

    var setRequireOnWindow = false;
    //Enable the use of `require()` to import modules
    function useRequire(){
        if(!setRequireOnWindow){
            setRequireOnWindow = true;
            setFreezedObjectProperty(window,"require",JSHON.import.from);
        }
    };

    var modulesVersion={},versioned=false;

    var JSHONImportExportModule = {
        /**
         * `JSHON.version` 
         * Set versions of modules globally. Versions are concantenated to the module's
         * source path everytime it's loaded. 
         */
        set version(obj){
            if(typeof(obj)=="object"&&null!=obj&&!versioned){
                setFreezedObjectProperties(modulesVersion,obj);
                versioned=true;
            }
        },
        /**
         * `JSHON.export`   
         * Export specific named files that can only be imported by name.
         */
        set export(obj){
            var currentFilename = symbolIdentifier+'currentPathname';
            if(this[currentFilename]==""/** Resolves to export globally*/){
                this.global=obj;
            }else{
                var path = symbolIdentifier+this[currentFilename];
                if(
                    !this.exports[path]
                    /** Ignore if a file tries to export under an existing filename */
                    /**Can't export multiple times under the same filename */
                ){
                    setFreezedObjectProperty(this.exports,path,setFreezedObjectProperties({},obj));
                    var importsKey = symbolIdentifier+"imports",i;
                    var dependants = JSHON[importsKey][path];
                    if(dependants){
                        //Send successful message to all modules 
                        //that depends on this particular module.
                        for(i=0;i<dependants.length;i++){
                            this.import[dependants[i].pathname].successful.push(dependants[i].position);
                            modulesCallback(true,dependants[i]);
                        }
                    }
                }
            }
            this[currentFilename] = "";
            versioned=true;
        },
        /**
         * `JSHON.global`   
         * Export modules that can be imported without providing the file name of the exporter.
         * These type of exports may be overwritten if there exist name collissions between 
         * previuos export and new exports.
         */
        set global(obj){
            var keys = Object.keys(obj),i;
            for(i=0;i<keys.length;i++){
                setWritableObjectProperty(this.import.global,keys[i],obj[keys[i]]);
            }
        },
        /**
         * This is used to set file names
         * @param {string} pathname
         */
        set pathname(pathname){
            if(typeof (pathname)=="string"&&pathname.length>0){
                this[symbolIdentifier+'currentPathname'] = pathname;
                if(
                    !this.import[symbolIdentifier+pathname]
                    /** Ignore if a file tries to register its name as an existing filename */
                ){
                    setFreezedObjectProperty(this.import,symbolIdentifier+pathname,{
                        setup:false,
                        dependencies:[],
                        loadResult:[],
                        onload:null,
                        onerror:null,
                        onerrorOnce:null,
                        main:pathname,
                        successful:[]
                    });
                }
            }
        },
        /**
         * Execute your code on load.
         * @param {() => void} cb
         */
        set onload(cb){
            if(typeof (cb)=="function"){
                var currentFilename = symbolIdentifier+'currentPathname';
                var path = symbolIdentifier+this[currentFilename];
                if(this[currentFilename].length>0&&!this.import[path].setup&&this.import[path].dependencies.length>0){
                    this.import[path].setup=true;
                    this.import[path].onload=cb;
                    var docFragment = document.createDocumentFragment(),i;
                    var returned = {requests:0,expectedRequests:this.import[path].dependencies.length};
                    var importsKey = symbolIdentifier+"imports",dependency,inline;
                    for(i=0;i<this.import[path].dependencies.length;i++){
                        dependency = symbolIdentifier+this.import[path].dependencies[i];
                        if(
                            this.import[dependency]
                            /** This dependency-module has already been loaded by a different module. */
                            /** No need to load again */
                        ){
                            if(
                                this.import[dependency].loadResult.indexOf(false)<0
                                /** Dependencies of themodule was successfully loaded */
                            ){

                                this.import[path].successful.push(i);
                                modulesCallback(true,{
                                    pathname:path,
                                    position:i,
                                    regulator:returned
                                });
                            }
                            else
                            /** Could not load all dependencies of the module successfully. Retry. */ {
                                JSHON[importsKey][dependency].push({
                                    pathname:path,
                                    position:i,
                                    regulator:returned
                                })
                                this.reloadModule(this.import[path].dependencies[i])
                            }
                        }else/** This dependency-module's file is not loaded at all */{
                            if(!JSHON[importsKey][dependency]){
                                JSHON[importsKey][dependency] = [];
                            }
                            JSHON[importsKey][dependency].push({
                                pathname:path,
                                position:i,
                                regulator:returned
                            });
                            if(
                                !this[symbolIdentifier+"requested"][dependency]
                                /** If not in the process loading, request for it */
                            ){
                                if(!this.inline_modules){
                                    this[symbolIdentifier+"requested"][dependency]=true;
                                    docFragment.appendChild(loadScripts(this.import[path].dependencies[i],dependency))
                                }else{
                                    if((inline=this.inline_modules()[this.import[path].dependencies[i]])){inline()}
                                    else{
                                        this[symbolIdentifier+"requested"][dependency]=true;
                                        docFragment.appendChild(loadScripts(this.import[path].dependencies[i],dependency))
                                    }
                                }
                                
                            }
                            
                        }
                        
                    }
                    document.head.appendChild(docFragment);
                }
                this[currentFilename]="";
            }
        },
        /**
         *  File specific exports
         * 
         * @param {() => void} cb
         */
        set onerror(cb){
            if(typeof (cb)=="function"){
                var path = symbolIdentifier+this[symbolIdentifier+'currentPathname'];
                if(this[symbolIdentifier+'currentPathname'].length>0&&!this.import[path].setup&&this.import[path].dependencies.length>0){
                    this.import[path].onerror=cb;
                }
            }
        },
        /**
         * File specific exports
         * 
         * @param {() => void} cb
         */
        set onerrorOnce(cb){
            if(typeof (cb)=="function"){
                var path = symbolIdentifier+this[symbolIdentifier+'currentPathname'];
                if(this[symbolIdentifier+'currentPathname'].length>0&&!this.import[path].setup&&this.import[path].dependencies.length>0){
                    this.import[path].onerrorOnce=cb;
                }
            }
        }
    };
    setFreezedObjectProperty(setFreezedObjectProperty(window,"JSHON",JSHONImportExportModule).JSHON,"loadPage",loadPage);
    setFreezedObjectProperty(setFreezedObjectProperty(JSHON,"exports",{}),symbolIdentifier+"imports",{});
    setFreezedObjectProperty(setFreezedObjectProperty(JSHON,"import",{}),symbolIdentifier+"requested",{});
    setFreezedObjectProperty(setWritableObjectProperty(JSHON,symbolIdentifier+'currentPathname',""),"reloadModule",reloadModule);
    setFreezedObjectProperty(setFreezedObjectProperty(JSHON,"loadModule",loadModule),"include",function JSHONExternalImports(src){
        var currentFilename = symbolIdentifier+'currentPathname';
        var path = symbolIdentifier+JSHON[currentFilename];
        if(JSHON[currentFilename].length>0&&!JSHON.import[path].setup){
            JSHON.import[path].dependencies.push(src);
            JSHON.import[path].loadResult.push(false);
        }
    });
    setFreezedObjectProperty(setFreezedObjectProperty(JSHON.import,"global",{}),"from",function JSHONInternalImports(src){
        var path = symbolIdentifier+src;
        return JSHON.exports[path];
    });
    setFreezedObjectProperty(setFreezedObjectProperty(JSHON,"useRequire",useRequire),"includesModule",function JSHONIncludesModule(src){
        return !!JSHON.import[symbolIdentifier+src];
    });
    
    
}();