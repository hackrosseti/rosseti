const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/user_roles/getAll
router.get(
    '/getAll',
    wrapAccess(auth, access.user_roles.getAll),
    (request, response) =>
      request.pool
      .query(db.queries.select('users_roles'))
      .then(db.getAll)
      .then((result) => response.json({ users_roles: result }))
      .catch((e) => handleDefault(e, response))
);

module.exports = router;