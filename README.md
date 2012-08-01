Sozu
====

Sozu is a very simple asynchroneous calls joining library.

## Example

	myResult = new sozu(this);

	myResult.

	needs(setTimeout,function(){
      console.log "your result is ready";
    }, 30).

    then(function(){
      console.log('Thanks, I got my result after your result.');
    });

## About the name

Sozu is a japanese word for a balancing bamboo fountain.  
Zen stuff.