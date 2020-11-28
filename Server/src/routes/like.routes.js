const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/like/add
router.get(
    '/add',
    wrapAccess(auth, access.like.add),
    (request, response) => {
        const { projectId, likeTypeId } = request.query;

        request.pool
            .query(db.queries.insert('likes', {
                user_id: request.user.userId,
                project_id: projectId,
                likestatus_id: likeTypeId,
                weight: 1
            }))
            .then(db.getOne)
            .then((result) => response.json({ likeId: result.like_id }))
            .catch((e) => handleDefault(e, response))
    }
);

module.exports = router;