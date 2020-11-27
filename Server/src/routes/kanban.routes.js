const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/kanban/getAll
router.get(
    '/getAll',
    wrapAccess(auth, access.kanban.getAll),
    wrapResponse(async (request, response) => {
       const statuses = await request.client.query(
          db.queries.select('kanban_statuses')
       ).then(db.getAll).catch((e) => handleDefault(response, e));
 
       response.json({ statuses });
    })
);

module.exports = router;