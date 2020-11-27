const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/user_roles/getAll
router.get(
    '/getAll',
    wrapAccess(auth, access.user_roles.getAll),
    wrapResponse(async (request, response) => {
       const roles = await request.client.query(
          db.queries.getByFields('users_roles')
       ).then(db.getAll).catch((e) => handleDefault(response, e));
 
       response.json({ roles: roles });
    })
);

module.exports = router;