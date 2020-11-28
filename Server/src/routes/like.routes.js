const {Router} = require('express');
import {db, wrapResponse, wrapAccess, handleDefault} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/like/add
router.get(
    '/add',
    wrapAccess(auth, access.like.add),
    wrapResponse((request, response) => {
        const { projectId, likeTypeId } = request.query;
        const checkUserIsNotAuthor = (project) => {
            if (project.author === request.user.userId) {
                response.status(400).json({ message: 'Пользователь не может поставить лайк своему проекту' });
                throw 'internal';
            }
        };
        const checkLikeAlreadyExists = (result) => {
            if (result) {
                response.status(400).json({ message: 'Лайк от текущего пользователя уже стоит на проекте' });
                throw 'internal';
            }
        };

        let weight = 1;
        var like = null;
		if(likeTypeId == 1) weight = 1; 
		if(likeTypeId == 2) weight = -1; 
		if(likeTypeId == 3) weight = 10; 
		console.log(likeTypeId)
        //switch (likeTypeId) {
        //    case 1: weight = 1; 
		//	break;
        //    case 2: weight = -1; 
		//	break
		//	case 3: weight = 10; 
		//	break;
        //}

        request.pool.connect()
            .then(client => {
                return client
                    .query(db.queries.select('project', { project_id: projectId }))
                    .then(db.getOne)
                    .then(checkUserIsNotAuthor)

                    .then(() => client.query(db.queries.select('likes', {
                        user_id: request.user.userId,
                        project_id: projectId
                    })))
                    .then(db.getOne)
                    .then(checkLikeAlreadyExists)

                    .then(() => client.query(db.queries.insert('likes', {
                        user_id: request.user.userId,
                        project_id: projectId,
                        likestatus_id: likeTypeId,
                        weight: weight
                    })))
                    .then(db.getOne).then(res => { like = res; })
                    .then(() => client.release())
                    .then(() => response.json({ likeId: like.like_id }))
                    .catch(e => {
                        client.release();
                        handleDefault(e, response);
                    })
            })
    })
);

module.exports = router;