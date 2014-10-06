var jsioc;

(function(){
    'use strict';

    var jsiocData = {};

    //Utility functions for object creation and dependency handling
    function copyPrototype(newPrototype, baseObj){
        var key;

        for(key in baseObj.prototype){
            newPrototype[key] = baseObj.prototype[key];
        }

        return newPrototype;
    }

    function getDependencies(container, dependencies){
        var returnedDependencies = [],
            sanitizedDependencies = (dependencies) ? dependencies : [];

        sanitizedDependencies.forEach(function(dependency){
            returnedDependencies.push(container.locate(dependency));
        });

        return returnedDependencies;
    }

    function buildObject(baseObject){
        function FinalObject(deps){
            baseObject.apply(this, deps);
        }

        FinalObject.prototype = copyPrototype(FinalObject.prototype, baseObject);
        FinalObject.prototype.constructor = FinalObject;

        return FinalObject;
    }

    //Container object definition
    function Container(){}

    Container.prototype = {
        registeredObjects: {},

        construct: function(objectDefinition, dependencies){
            var FinalObject = buildObject(objectDefinition),
                returnedDependencies = getDependencies(this, dependencies);

            return new FinalObject(returnedDependencies);
        },

        invoke: function(userFn, dependencies){
            var returnedDependencies = getDependencies(this, dependencies);
            userFn.apply(null, returnedDependencies);
        },

        locate: function(key){
            var locatedObject = this.registeredObjects[key],
                FinalObject = buildObject(locatedObject),
                returnedDependencies = getDependencies(this, locatedObject.prototype.dependencies);

            return new FinalObject(returnedDependencies);
        },

        register: function(key, obj){
            if(this.registeredObjects[key]){
                throw new Error('Cannot reregister key: ', key);
            }
            this.registeredObjects[key] = obj;
        }
    };

    jsioc = {

        getContainer: function(){
            if(!jsiocData.container){
                jsiocData.container = new Container();
            }

            return jsiocData.container;
        }

    };

})();