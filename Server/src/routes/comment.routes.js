const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/comment/add
router.post(
    '/add',
    wrapAccess(auth, access.comment.add),
    wrapResponse((request, response) => {
        const { projectId, comment } = request.body;

        request.pool
            .query(db.queries.insert('project_comments', {
                user_id: 1,
                comment: comment,
                project: projectId
            }))
            .then(db.getOne)
            .then((result) => response.json({ commentId: result.comment_id }))
            .catch((e) => handleDefault(e, response))
    })
);

module.exports = router;