describe('jsioc', function(){
    'use strict';

    describe("getContainer", function(){

        it('should return an object', function(){
            var container = jsioc.getContainer();

            expect(typeof container).toBe('object');
        });

        it('should return cached container object', function(){
            var initialContainer = jsioc.getContainer(),
                secondContainer = jsioc.getContainer();

            expect(initialContainer).toBe(secondContainer);
        });

    });

    describe('DI Container', function(){

        var container,
            TestObject,
            SecondObject;

        beforeEach(function(){
            container = jsioc.getContainer();
            container.registeredObjects = {};

            function TestObjectParent(){}
            TestObjectParent.prototype = {
                desc: "test object"
            };

            TestObject = TestObjectParent;

            function SecondObjectParent(testObj){
                this.testObj = testObj;
            }

            SecondObjectParent.prototype = {};
            SecondObjectParent.prototype.dependencies = ['TestObject'];

            SecondObject = SecondObjectParent;
        });

        describe('register', function(){

            it('should register an object to a key', function(){
                container.register('TestObject', TestObject);

                expect(container.registeredObjects.TestObject).toBe(TestObject);
            });

            it('should throw an error if key is already registered', function(){
                var errorThrown = false;

                container.register('TestObject', TestObject);

                try{
                    container.register('TestObject', {});
                } catch (error){
                    errorThrown = true;
                }

                expect(errorThrown).toBe(true);
            });

        });

        describe('locate', function(){
            beforeEach(function(){
                container.register('TestObject', TestObject);
                container.register('SecondObject', SecondObject);
            });

            it('should return an object', function(){
                var returnedObject = container.locate('TestObject');

                expect(typeof returnedObject).toBe("object");
            });

            it('should return an an object with dependencies passed in', function(){
                var returnedObject = container.locate('SecondObject');

                expect(typeof returnedObject.testObj).toBe("object");
            });

        });

        describe('construct', function(){
            beforeEach(function(){
                container.register('TestObject', TestObject);
                container.register('SecondObject', SecondObject);
            });

            it('should return a new object', function(){
                function MyObject(){}
                MyObject.prototype = {};

                var returnedObject = container.construct(MyObject);

                expect(typeof returnedObject).toBe('object');
            });

            it('should return a new object with prototypal properties attached', function(){
                function MyObject(){}
                MyObject.prototype = {
                    desc: 'My test object'
                };

                var returnedObject = container.construct(MyObject);

                expect(returnedObject.desc).toBe('My test object');
            });

            it('should initialize with defined dependencies', function(){
                function MyObject(secondObj){
                    this.secondObj = secondObj;
                }
                MyObject.prototype = {};

                var returnedObject = container.construct(MyObject, ['SecondObject']);

                expect(returnedObject.secondObj.testObj.desc).toBe('test object');

            });

        });

        describe('invoke', function(){
            beforeEach(function(){
                container.register('TestObject', TestObject);
                container.register('SecondObject', SecondObject);
            });

            it('should invoke passed function', function(){
                var spy = jasmine.createSpy('passedFunction');

                container.invoke(spy);

                expect(spy).toHaveBeenCalled();
            });

            it('should invoke passed function with required dependencies', function(){
                var receivedObject;

                function myFunction(secondObject){
                    receivedObject = secondObject;
                }

                container.invoke(myFunction, ['SecondObject']);

                expect(receivedObject.testObj.desc).toBe('test object');
            });
        });
    });

});