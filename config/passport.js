const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

const strategy = new JwtStrategy(options, (payload, done) => {
  return done(null, payload);
});

module.exports = (passport) => {
  passport.use(strategy);
}
