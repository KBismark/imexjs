# IMEX.js
IMEX (pronounced im-ex) is a code modularization library that provides elegant and easy ways to share and reuse codes from different files or scripts in a web application or even other web applications.    

IMEXjs is simple. Write your code in modular form like you would when writing nodejs applications. This avoids code re-writing and allows for code reusability. Also, think of a component based application which may have over 1000 separate files that make up the entire code base of an app. Would you bundle all files together and serve them at once? I guess no. The best approach is to serve only files or scripts neccessary to get the app running at a particular moment. IMEX makes this easy.    

IMEXjs brings into you application what is known as a package manager. It takes care of loading your modules (script files) and managing dependencies.

## Let's get started
You can include the IMEX library in your web applications in many different ways. Some, I have listed below:
- Through jsDelivr 
```
https://cdn.jsdelivr.net/gh/KBismark/imexjs/imexjs.v0.0.1.min.js
```
or
```
https://cdn.jsdelivr.net/npm/kwabenabismark/imexjs/imexjs.v0.0.1.min.js
```

- Clone this repo 
```
git clone https://github.com/KBismark/imexjs.git
```

- and many more to be added later.


Now, in the head tag of your HTML document, place the code below to load the import and export library into your web application. 
(*Replace "path/to/imexjs" with the right path to the imex library*)    
```html
<script src="path/to/imexjs"></script>
```

IMEXjs exposes one global object, `JSHON` through which all the magics (functions) of IMEX can be accessed.
```html
<!DOCTYPE html>
<html>
    <head>
        <script src="https://cdn.jsdelivr.net/gh/KBismark/imexjs/imexjs.v0.0.1.min.js"></script>
        <script>
            console.log(JSHON)
        </script>
    </head>
    <body></body>
</html>
```

*Please note. The IMEX library is a subsidiary of the JSHON project/library. The reason for (wimdow.JSHON)*

## Properties and Methods
- [include](#include) (*Method*)
 
- [includesModule](#includesModule) (*Method*)

- [loadModule](#loadModule) (*Method*)

- [reloadModule](#reloadModule) (*Method*)

- [loadPage](#loadPage) (*Method*)

- [useRequire](#useRequire) (*Method*)

- [import](#import) (*Property*)

- [export](#export) (*Settable property*)

- [global](#global) (*Settable property*)

- [pathname](#pathname) (*Settable property*)

- [onload](#onload) (*Settable property*)

- [onerror](#onerror) (*Settable property*)

- [onerrorOnce](#onerroronce) (*Settable property*)

- [version](#version) (*Settable property*)




## pathname
In order for import and exports to be possible and also to allow loading of script files, every module must register its path. 

```js
//Create a module
!function(){
    JSHON.pathname = "the/path/to/this/file";

    //The rest of your code here...

}();
```

## include
The `include()` method is used to add dependencies of a module or a particular file. It means a module must not be executed until
all its dependencies are successfully available or loaded. The `include()` method works like the `#include` directive in the C programming 
language. This method loads or includes modules only once in your application. Many modules can have one particular module among their 
dependencies. However, you should avoid a circular dependency structure, (e.g, A => B => A)

```js
//Create a module
!function(){
    JSHON.pathname = "the/path/to/this/file";

    //Include dependencies of this module
    JSHON.include("the/path/to/another/module-1");
    JSHON.include("the/path/to/another/module-2");
    JSHON.include("the/path/to/another/module-3");
    //Add the rest of your modules to include...

}();
```

## onload
If a module has other modules that have to be loaded before its executed then, the `onload` property must be set to the callback function.    

**NOTE:** 
- Until this property is set, the dependecies of this module remains unloaded. 
- Do not set the `onload` property if your module has no dependency.

```js
//Create a module
!function(){
    JSHON.pathname = "the/path/to/this/file";

    //Include dependencies of this module
    JSHON.include("the/path/to/another/module-1");
    JSHON.include("the/path/to/another/module-2");
    JSHON.include("the/path/to/another/module-3");

    //Set the callback function
    JSHON.onload = function yourCallbackFunction(){

        //The rest of your code here...

    }
    

}();
```

## onerror
Set the `onerror` property to a function that should be executed if one or more of a module's dependencies was unable to be loaded successfully. Your `onerror()` function or calback is executed whenever an error occurs during a module dependency load.    

**NOTE:** This property must be set before setting the `onload` property.

```js
//Create a module
!function(){
    JSHON.pathname = "the/path/to/this/file";

    //Include dependencies of this module
    JSHON.include("the/path/to/another/module-1");
    JSHON.include("the/path/to/another/module-2");
    JSHON.include("the/path/to/another/module-3");

    //Set the callback functions
    JSHON.onerror = function yourErrorCallback(){

        //may wait for sometime and reloadModule() here...

    }

    JSHON.onload = function yourCallbackFunction(){

        //The rest of your code here...

    }
    

}();
```

## onerrorOnce
Set the `onerrorOnce` property to a function that should be executed if one or more of a module's dependencies was unable to be loaded successfully. Your `onerrorOnce()` function or calback is executed only the first time an error occurs during a module dependency load.


**NOTE:** This property must be set before setting the `onload` property.

```js
//Create a module
!function(){
    JSHON.pathname = "the/path/to/this/file";

    //Include dependencies of this module
    JSHON.include("the/path/to/another/module-1");
    JSHON.include("the/path/to/another/module-2");
    JSHON.include("the/path/to/another/module-3");

    //Set the callback functions
    JSHON.onerrorOnce = function yourErrorCallback(){

        //may wait for sometime and reloadModule() here or fallback here...

    }

    JSHON.onload = function yourCallbackFunction(){

        //The rest of your code here...

    }
    

}();
```

## export
Use the `export` property to expose methods or properties for other modules to access.

**NOTE:** You can only `export` once under a pathname. Do `JSHON.export = {}` if you do not want to export from a module else, the module
is never considered as a successful load. The `export` property must be a dictionary (a key-value pair object).

```js
//Create a module
!function(){
    JSHON.pathname = "the/path/to/this/file";

    //Include dependencies of this module
    JSHON.include("the/path/to/another/module-1");
    JSHON.include("the/path/to/another/module-2");
    JSHON.include("the/path/to/another/module-3");

    //Set the callback functions
    JSHON.onerrorOnce = function yourErrorCallback(){

        //fallback here...

    }

    JSHON.onerror = function yourErrorCallback(){

        //may wait for sometime and reloadModule()...
    }

    JSHON.onload = function yourCallbackFunction(){

        //Your code here...


        //Export methods and props to other modules
        JSHON.export = {
            Method1, Method2, Prop1, Prop2, App
        };

    }
    

}();
```


## import
The `import` property as its name suggests is used to import specific methods or properties exported in another module or file.

**NOTE:** Use this property only in your `onload()` callback and only `import` from modules you have `include()`d.

```js
//Create a module
!function(){
    JSHON.pathname = "the/path/to/this/file";

    //Include dependencies of this module
    JSHON.include("the/path/to/another/module-1");
    JSHON.include("the/path/to/another/module-2");
    JSHON.include("the/path/to/another/module-3");

    //Set the callback functions
    JSHON.onerrorOnce = function yourErrorCallback(){

        //may wait for sometime and reloadModule() here or fallback here...
    }

    JSHON.onload = function yourCallbackFunction(){

        //Import methods and props from other modules
        const {Method1,Method2,Prop1,Prop2} = JSHON.import.from("the/path/to/another/module-1");
        const module2App = JSHON.import.from("the/path/to/another/module-2").App;
        const module3App = JSHON.import.from("the/path/to/another/module-3").App;

        //Your code here...

        //Export methods and props to other modules
        JSHON.export = {
            Method1, Method2, Prop1, Prop2, module2App, module3App
        };
    }
    

}();
```

## useRequire
This method allows you to import modules with the `require()` method. Calling `useRequire()` sets the require method on the window
object. Using the `require()` method allows for code completions in editors like VS Code.   
The `useRequire` method takes either one or no argument. In the case where you provide an argument, the argument must be a key-value pair
object which maps the actual values you will pass as argument to the `require` method to the actulal paths of the files to be loaded.
It implicitly `includes()` the actulal paths of the files to be loaded

**NOTE:** Use this property only in your `onload()` callback and only `require` from modules you have `include()`d.

```js
//Create a module
!function(){
    JSHON.pathname = "the/path/to/this/file";

    //Call useRequire to start using `require()`
    JSHON.useRequire({
        "jquery":"the/path/to/jquery/file",
        "my-module-2":"the/path/to/another/module-2"
    });

    //Include dependencies of this module
    JSHON.include("the/path/to/another/module-1");
    JSHON.include("my-module-2");
    JSHON.include("the/path/to/another/module-3");

    //Set the callback functions
    JSHON.onerrorOnce = function yourErrorCallback(){

        //may wait for sometime and reloadModule() here or fallback here...
    }

    JSHON.onload = function yourCallbackFunction(){

        //Import methods and props from other modules
        const {Method1,Method2,Prop1,Prop2} = require("the/path/to/another/module-1");
        const module2App = require("my-module-2").App;
        const module3App = require("the/path/to/another/module-3").App;

        //Your code here...

        const exp = {
            Method1, Method2, Prop1, Prop2, module2App, module3App
        };

        //Export methods and props to other modules
        JSHON.export = exp;

        //We want the code completion feature in code editors
        //We wrap `module.exports` in the falsy IF context to make it unreachable in our app
        if(0){
            module.exports = exp;
        }
    }
    

}();
```


## loadModule
This method is used to import modules upon user interactions with your app or to import modules later in your app.


```html
<!DOCTYPE html>
<html>
    <head>
        <script src="https://cdn.jsdelivr.net/gh/KBismark/imexjs/imexjs.v0.0.1.min.js"></script>
    </head>
    <body style="text-align:center;">
        <button id="but">View Account</button>
        <div id="response" style="margin-top:30px;"></div>
        <script>
            
            //Create an inline module
            //This module is not put in a separate file
            !function(){
                JSHON.pathname = "myApp";

                var loadingProfile = false;

                //Let's load the profile module when the user clicks on the view account button
                document.getElementById("but").addEventListener("click",function(){
                    if(!loadingProfile){
                        loadingProfile = true;
                        document.getElementById("response").textContent = "Please wait while we load your profile";
                        JSHON.loadModule("/path/to/the/profile/module",{
                            args:null,
                            onload:()=>{
                                loadingProfile = false;
                                //Show the user's profile 

                            },
                            onerror:()=>{
                                loadingProfile = false;
                                document.getElementById("response").textContent = "Sorry, an error occured. Click on the button to reload.";
                            }
                        })
                    }
                },false);

                //This module does not export anything
                JSHON.export = {};
            }();

        </script>
    </body>
</html>
```