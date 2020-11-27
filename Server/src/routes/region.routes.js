const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/region/getAll
router.get(
    '/getAll',
    wrapAccess(auth, access.region.getAll),
    (request, response) =>
      request.pool
        .query(db.queries.select('regions'))
        .then(db.getAll)
        .then((result) => response.json({ regions: result }))
        .catch((e) => handleDefault(e, response))
);

module.exports = router;