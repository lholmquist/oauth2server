var thing = AeroGear.Authorization(),
    pipeThing;

var responseFromAuthEndpoint,
    authWindow,
    timer;

thing.add({
    name: "coolThing",
    settings: {
        clientId: "12345",
        redirectURL: "http://localhost:3000/redirector.html",
        //tokenValidationEndpoint: "https://www.googleapis.com/oauth2/v1/tokeninfo",
        authEndpoint: "http://localhost:3000/v1/auth",
        //revokeURL: "https://accounts.google.com/o/oauth2/revoke",
        scopes: "userinfo coolstuff"
    }
});

pipeThing = AeroGear.Pipeline( { authorizer: thing.services.coolThing } );


pipeThing.add([
    {
        name: "userInfo",
        settings: {
            baseURL: "http://localhost:3000/",
            endpoint: "v1/userinfo"
        }
    }
]);

function validate() {
    thing.services.coolThing.validate( responseFromAuthEndpoint, {
        success: function( response ){
            console.log( "Should be response from Validating the access token", response );
        },
        error: function( error ) {
            console.log( "error", error );
        }
    });
}

function callPipeRead() {
    pipeThing.pipes.userInfo.read({
        success:function( response ) {
            console.log( "response from successful pipe", response );
        },
        error: function( error ) {
            console.log( "error pipe", error );

            //Open the window to do the dance
            authWindow = window.open( error.authURL );
            //Watch the window for the location to change
            timer = setInterval( function() {
                if( authWindow.location.href || authWindow.location.origin ) {
                    responseFromAuthEndpoint = authWindow.location.href;
                    clearInterval( timer );
                    validate();
                    authWindow.close();
                }
            }, 500 );
        }
    });
}

$( ".pipe-read" ).on( "click", function( event ) {
    callPipeRead();
});

$( ".clear-interval" ).on( "click", function( event ) {
    clearInterval( timer );
});

$( ".clear-tokens" ).on( "click", function( event ) {
    $.ajax({
        type: "DELETE",
        url: "http://localhost:3000/v1/tokens"
    }).done( function( response ) {
        console.log( "tokens cleared from the server" );
    });
});
