var authz = AeroGear.Authorization(),
    pipe;

var responseFromAuthEndpoint,
    authWindow,
    authURL,
    timer;

authz.add({
    name: "coolThing",
    settings: {
        clientId: "12345",
        redirectURL: "http://localhost:3000/redirector.html",
        authEndpoint: "http://localhost:3000/v1/auth",
        scopes: "userinfo coolstuff"
    }
});

// authz.add({
//     name: "coolThing",
//     settings: {
//         clientId: "1038594593085.apps.googleusercontent.com",
//         redirectURL: "http://localhost:3000/redirector.html",
//         //tokenValidationEndpoint: "https://www.googleapis.com/oauth2/v1/tokeninfo",
//         authEndpoint: "https://accounts.google.com/o/oauth2/auth",
//         revokeURL: "https://accounts.google.com/o/oauth2/revoke",
//         scopes: "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.readonly"
//     }
// });

pipe = AeroGear.Pipeline( { authorizer: authz.services.coolThing } );

// pipe.add([
//     {
//         name: "cal",
//         settings: {
//             baseURL: "https://www.googleapis.com/",
//             endpoint: "calendar/v3/users/me/calendarList"
//         }
//     }
// ]);

pipe.add([
    {
        name: "cal",
        settings: {
            baseURL: "http://localhost:3000/",
            endpoint: "v1/userinfo"
        }
    }
]);

function validate() {
    authz.services.coolThing.validate( responseFromAuthEndpoint, {
        success: function( response ){
            console.log( response );
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
    pipe.pipes.cal.read({
        success:function( response ) {
            addResults( "response from successful pipe" );
            console.log( response );
            for( var thing in response ) {
                addResults(  thing + " : " + response[ thing ] );
            }
        },
        error: function( error ) {
            addResults( error.status + " " + error.statusText );
            authURL = error.authURL;
        }
    });
}

function doAuthorize() {
    //Open the window to do the dance
    addResults( "Opening Auth URL" );
    addResults( authURL );
    authWindow = window.open( authURL );
    //Watch the window for the location to change
    timer = setInterval( function() {
        addResults( "intervaling" );
        if( authWindow.closed ) {
            clearInterval( timer );
            addResults( "Child Window has closed" );
            return;
        }

        if( authWindow.location.href || authWindow.location.origin ) {
            addResults( "redirect URL is back in the child" );
            responseFromAuthEndpoint = authWindow.location.href;
            clearInterval( timer );
            addResults( "About to validate response returned" );
            validate();
            authWindow.close();
        }

        //If the window is closed,  clear the interval
        if( authWindow.closed ) {
            clearInterval( timer );
            addResults( "Child Window has closed" );
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
    doAuthorize();
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
