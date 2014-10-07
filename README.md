JSIoC
=====

JSIoC is an Inversion of Control container for Javascript.  It was built after looking at various Javascript implementations of systems and frameworks, especially Backbone.  There is nothing inherently wrong with any of the systems, but building on top of systems without any means for dependency injection makes testing a challenge.

Reviewing other IoC containers for Javascript revealed a series of implementation based around service locators or over-complicated definitions and configurations.  JSIoC is intended to be flexible, lightly opinionated and easy to use.

Here's a rundown of what JSIoC offers:

- Static handling of your IoC container
- Constructor injection of instantiated dependencies
- Invocation of functions taking dependency arguments (useful for wrapping objects in systems not supporting DI
- Locator pattern implementation for absolutely no-other-way circumstances and test setup
- Easy decoupling of objects and their dependencies
- A general sense of peace and wellbeing

Here's what it looks like to instantiate the IoC container:

    var container = jsioc.getContainer();

    //Program logic here ...

Here's what it looks like to get an existing IoC container:

    var container = jsioc.getContainer();

    //Program logic here ...

Really, what's happening here is getContainer checks to see if a container exists.  If it does, the container is returned.  If no container exists, one is created and returned.  No fuss, no muss.

Here's what it looks like when you register a object definition:

    function MyObject(){
        //constructor logic here
    }

    MyObject.prototype = {
        //Prototypal properties here
    };

    container.register("MyObject", MyObject);

Once your object is defined, this is what it looks like to instantiate a new object with a dependency on MyObject:

    function MyOtherObject(myObj){
        this.myObj = myObj;
    }

    MyOtherObject.prototype = {
        //Prototypal properties here
    };

    container.construct(MyOtherObject, ["MyObject"]);

Here's an invocation with dependencies:

    function myInstantiator(myObj){
        return new MyOtherObject(myObj);
    }

    container.invoke(myInstantiator, ["MyObject"]);

Finally, this is the locator pattern:

    var myObj = container.locate("MyObject");

Simple, right?  This easy to use little container will make your testing so much easier and break hard dependencies that can make SOLID development tough.  Give it a try.