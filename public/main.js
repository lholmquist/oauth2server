var thing = AeroGear.Authorization(),
    pipeThing;

var responseFromAuthEndpoint,
    authWindow,
    authURL,
    timer;

thing.add({
    name: "coolThing",
    settings: {
        clientId: "12345",
        redirectURL: "http://localhost:3000/redirector.htm",
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
            addResults( "successful validate call" );
            addResults( "access_token: " + response.access_token );
        },
        error: function( error ) {
            addResults( "error validating" );
            console.log( "error", error );
        }
    });
}

function callPipeRead() {
    pipeThing.pipes.userInfo.read({
        success:function( response ) {
            addResults( "response from successful pipe" );
            addResults( response.status );
        },
        error: function( error ) {
            addResults( error.status + " " + error.statusText );
            authURL = error.authURL;
        }
    });
}

function authorize() {
    //Open the window to do the dance
    addResults( "Opening Auth URL" );
    addResults( authURL );
    authWindow = window.open( authURL );
    //Watch the window for the location to change
    timer = setInterval( function() {
        if( authWindow.location.href || authWindow.location.origin ) { //this needs to be better
            addResults( "redirect URL is back in the child" );
            responseFromAuthEndpoint = authWindow.location.href;
            clearInterval( timer );
            addResults( "Validating response returned" );
            validate();
            //authWindow.close();
        }
    }, 500 );
}

function addResults( result ) {
    $( ".results ul" ).append( $( "<li>" ).html( result ) );
}

$( ".pipe-read" ).on( "click", function( event ) {
    callPipeRead();
});

$( ".authorize" ).on( "click", function( event ) {
    authorize();
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
