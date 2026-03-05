const checkRole = (roles) => {
  return (req, res, next) => {
    // req.user debe estar presente (usar auth middleware antes)
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso prohibido: Rol insuficiente' });
    }
    
    next();
  };
};

module.exports = checkRole;
