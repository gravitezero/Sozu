Sozu
====

Sozu is a very simple asynchroneous calls joining library.

## Example

	myResult = new sozu(this).

	needs(setTimeout,function(){
      console.log('ready');
    }, 30).

    then(function(){
      console.log('finished');
    });

## About the name

Sozu is a japanese word for a balancing bamboo fountain.  
Zen stuff.