const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/kanban/getAll
router.get(
    '/getAll',
    wrapAccess(auth, access.kanban.getAll),
    (request, response) =>
      request.pool
         .query(db.queries.select('kanban_statuses'))
         .then(db.getAll)
         .then((statuses) => response.json({ statuses: statuses }))
         .catch((e) => handleDefault(e, response))
);

module.exports = router;