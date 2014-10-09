var jsioc = (function(){

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

    function getDependency(container, key){
        var dependency = container.registeredObjects[key],
            isService = false;

        if(!dependency){
            dependency = container.registeredServices[key];
            isService = true;
        }

        return {dependency: dependency, isService: isService };
    }

    function buildDependencyList(dependency){
        var obj = (dependency) ? dependency : { dependencies: [] },
            dependencyList = (obj.prototype) ?
                obj.prototype.dependencies :
                obj.dependencies;

        return (dependencyList) ? dependencyList : [];
    }

    /**
     * @constructor Container
     */
    function Container(){}

    Container.prototype = {
        registeredObjects: {},
        registeredServices: {},

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
            return userFn.apply(null, returnedDependencies);
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
            var locatorObject = getDependency(this, key),
                isService = locatorObject.isService,
                dependency = locatorObject.dependency,
                dependencyList = buildDependencyList(dependency),
                returnedDependencies = getDependencies(this, dependencyList),

                FinalObject = (isService) ?
                    dependency :
                    buildObject(dependency);

            return (isService) ?
                dependency :
                new FinalObject(returnedDependencies);
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
        },

        /**
         * @method service
         * @memberof Container
         * @param {string} key
         * @param {object} obj
         */
        service: function(key, service){
            var dependencyList = (service.prototype) ?
                service.prototype.dependencies :
                [];

            if(this.registeredServices[key]){
                throw new Error('Cannot reregister key: ', key);
            }

            this.registeredServices[key] = this.invoke(service, dependencyList);
        }
    };

    return {

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