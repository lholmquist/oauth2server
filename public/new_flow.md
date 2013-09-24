## New Flow - Client Flow - Standalone for now,  possible integration with pipes

### First Time - No Access Token stored( in localStorage )

User will create the Authorization Object stuff with settings/options

    var thing = AeroGear.Authorization();

    thing.add({
        name: "coolThing",
        settings: {
            clientId: "12345.apps.googleusercontent.com",
            redirectURL: "http://localhost:8000/redirector.html",
            tokenValidationEndpoint: "https://www.googleapis.com/oauth2/v1/tokeninfo",
            authEndpoint: "https://accounts.google.com/o/oauth2/auth",
            revokeURL: "https://accounts.google.com/o/oauth2/revoke",
            scopes: "https://www.googleapis.com/auth/userinfo.profile",
            prompt: "force"
        }
    });

_should have the ability to specify more settings, based on the spec_

The user would then call some method( currently not good names are coming to me, maybe validate ) that takes success and error
callbacks.

    thing.services.coolThing.validate({
        success: function( response ){
            console.log( "Should be response from Validating the access token", response );
        },
        error: function( error ) {
            //should contain a constructed URL for the user
            console.log( "error", error );
        }
    });

Since this is the first time,  the error callback will be called and will contain the constructed URL that
the user should do the popup redirect dance with to get an access token.

_what "dance" they do is up to the developer_

Once that happens and they have the access token, they would call the validate method again.

this makes sure that the token they recieved is validated and will also return some other meta data related to the token, like refresh time.

Once the token has been validated, it will be stored in localStorage and would be accessable with the key of `ag-oauth2-whatever_the_client_ID_is` .

so in this example it would be something like:

    ag-oauth2-12345.apps.googleusercontent.com

There is one problem i can see here though.  If the user has to applications with the same client ID but different scopes assigned,  this would be a problem.  That use case could be considered bad practice anyway

The user can then call the "callService"( yes,  again, crappy name ) method to get access to the service they want.

    thing.services.coolThing.callService({
        serviceURL: "https://www.googleapis.com/oauth2/v2/userinfo",
        success: function( response ){
            console.log( "Should be the response from the call", response );
        },
        error: function( error ) {
            console.log( "error", error );
        }
    });

All these methods would have success/error callbacks.

### Token Expiration

If the user makes a call to a service, using the callService method, and they recieve an error such as not authorized or token invalid or token expired, I'm thinking we send what the "contructed URL" should be, similar to the validate method described above.

Since this is a Client Side flow,  there is no refresh token, so the client wouldn't be able to refresh the access token without doing the "dance" again.







