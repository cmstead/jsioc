var jsioc;

(function(){
    'use strict';

    var jsiocData = {};

    //Utility functions for object creation and dependency handling
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

        FinalObject.prototype = Object.create(baseObject.prototype);
        FinalObject.prototype.constructor = FinalObject;

        return FinalObject;
    }

    /**
     * @constructor Container
     */
    function Container(){}

    Container.prototype = {
        registeredObjects: {},

        /**
         * @method construct
         * @public
         * @description constructs an object based on the definition and its dependencies
         * @memberof Container
         * @param {object} objectDefinition Fully defined prototypal object
         * @param {array} dependencies Array of required constructor dependencies
         * @returns {FinalObject}
         */
        construct: function(objectDefinition, dependencies){
            var FinalObject = buildObject(objectDefinition),
                returnedDependencies = getDependencies(this, dependencies);

            return new FinalObject(returnedDependencies);
        },

        /**
         * @method invoke
         * @public
         * @description invokes a function passing its dependencies as arguments
         * @memberof Container
         * @param {function} userFn User defined function requiring instantiated dependencies
         * @param {array} dependencies Array of required dependencies
         */
        invoke: function(userFn, dependencies){
            var returnedDependencies = getDependencies(this, dependencies);
            userFn.apply(null, returnedDependencies);
        },

        /**
         * @method locate
         * @public
         * @description locates an object by key and returns an instance object
         * @memberof Container
         * @param  {string} key Key for registered dependency definition
         * @returns {FinalObject}
         */
        locate: function(key){
            var locatedObject = this.registeredObjects[key],
                FinalObject = buildObject(locatedObject),
                returnedDependencies = getDependencies(this, locatedObject.prototype.dependencies);

            return new FinalObject(returnedDependencies);
        },

        /**
         * @method register
         * @public
         * @memberof Container
         * @description registers a key in the container pointing to an object
         * @param {string} key Key to associate object definition with
         * @param {object} obj Object definition to associate with key
         */
        register: function(key, obj){
            if(this.registeredObjects[key]){
                throw new Error('Cannot reregister key: ', key);
            }
            this.registeredObjects[key] = obj;
        }
    };

    jsioc = {

        /**
         * @function getContainer
         * @description jsioc.getContainer - Callable to instantiate/retrieve IoC container
         * @returns {Container|*}
         */
        getContainer: function(){
            if(!jsiocData.container){
                jsiocData.container = new Container();
            }

            return jsiocData.container;
        }

    };

})();