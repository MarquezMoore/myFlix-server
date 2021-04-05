const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport');

let generateJWT = ( user ) => {

  return jwt.sign(user, process.env.TOKEN_SECRET, {
    subject: user.username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
}


/*
  Login Endpoint
*/

const router = (router) => {
  router.post('/login', ( req, res ) => {
    passport.authenticate('local', {session: false}, ( err, user, info ) => {
      if( err || !user ) {
        res.status(400).json({
          message: info,
          user: user
        })
      }

      req.login( user, { session: false }, err => {
        if( err ){
          res.send(err)
        }
        
        let token = generateJWT( user.toJSON() );
        console.log(token);
        return res.json({user, token})
      });
    })(req, res)
  });
}


module.exports = router;