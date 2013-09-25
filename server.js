
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    uuid = require('node-uuid');

var app = express(),
    redirectURIs = [ "http://localhost:3000/redirector.html" ],
    accessTokens = [];

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.set('views', __dirname );
  app.engine('html', require('ejs').renderFile);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
/*
  This route will authorize peeps
*/
app.get('/v1/auth', function( request, response ) {
    console.log( request.query );
    var redirect_uri = request.query.redirect_uri,
        state = request.query.state,
        expires_in = 3600,
        access_token = {},
        token_type;

    if( redirectURIs.indexOf( redirect_uri ) > -1 ) {

        //Generate an access token and save it
        access_token.token = uuid.v1();
        access_token.expires_in = expires_in;

        accessTokens.push( access_token );

        response.set( 'Location',redirect_uri + "#access_token=" + access_token.token + "&expires_in=" + expires_in + "&state=" + state );
        response.send( 302 );
    } else {
       //NO NO. Redirect URL is not registered
       response.redirect( 'server/nononopage.html#error' );
    }
});

/*
  This route will be secure and will need an access token
*/
app.get('/v1/userinfo', function( request, response ) {
    if( request.query.access_token && request.query.access_token !== "undefined" && isAccessTokenValid( request.query.access_token ) ) {
        response.send( 200 );
    } else {
        response.send( 401 );
    }
});

app.get('/v1/tokens', function( request, response ) {
      response.send( accessTokens );
});

app.del('/v1/tokens', function( request, response ) {
  accessTokens = [];
  response.end();
});

function isAccessTokenValid( accessToken ) {
  var i,
    result = false;
  for( i in accessTokens ) {
    if( accessTokens[ i ].token === accessToken ) {
      result = true;
      break;
    }
  }

  return result;
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
