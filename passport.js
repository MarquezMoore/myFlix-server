const passport = require('passport'),
  localStrategy = require('passport-local').Strategy,
  passportJWT = require('passport-jwt'),
  Models = require('./models.js');

let users = Models.user,
  JWTStrategy = passportJWT.Strategy,
  ExtractJwt = passportJWT.ExtractJwt;
/* 
  Local Strategy: Authentication
*/
passport.use(new localStrategy(
  {
    usernameField: 'Username', 
    passwordField: 'Password'
  },
  (username, password, done) => {
    console.log(`Username: ${username} Password: ${password}`);
    users.findOne({
      username: username
    }).then( user => {
      if(!user){
        return done(null, false, 'Incorrect username...');
      }
      if(!user.validatePassword(password)) {
        return done(null, false, 'Incorrect password...');
      }
      
      console.log('Finished');
      return done(null, user);
    }).catch( err => {
      done(err, false, {'Error': err});
    });
}));
/*
  JSON Web Token Strategy: Aurthorization
*/
const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOKEN_SECRET
}

passport.use(new JWTStrategy(opts, (jwtPayload, done) => {
  return users.findOne({
    _id: jwtPayload._id
  }).then(user => {
    if(!user){
      return done(null, false, {message: 'User does not exist'});
    }

    return done(null, user);
  }).catch(err => {
    done(err, false, {'Error': err});
  });
}));