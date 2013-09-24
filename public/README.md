## AeroGear OAuth2 Adapter sample test thing

you need to run this on a server so the quickest way is,

    python -m SimpleHTTPServer

then go to http://localhost:8000

Currently this will test against the Google OAuth2 api's.  i've created a sample app and turned on the calendar and google+ api's

The index page will not show much, so open up dev tools to see the console output.

## UPDATE:

i've add a pipe with an "Authorizer"( this is a new setting ),

a pipe.read basically just wraps the `callService` method( which i've renamed to `read` )


### Current Flow

The code will attempt to call `callService` , if there is no token, or the token has expired, then the authoriztion URL will be in the error callback. You would then use this to get an access token.

You execute this somehow, and then take that response URL and pass it to the validate method.

If a validationURLEnpoint is specified when creating the object, then that will be called and that response will be returned, if not, the parsed query string is returned as an object.

both ways store the access token in local storage

_for now i'm just pasting this into the browser and then copying the location bar once it's returned and setting the `responseFromAuthEndpoint` variable from the console then calling validate_


With the valid access token stored,  make the call to the `callService` method again
