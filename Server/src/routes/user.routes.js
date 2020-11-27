const {Router} = require('express');
const jwt = require('jsonwebtoken');
import {db, getFromConfig, wrapResponse, wrapAccess, handleDefault, handleInternal} from '../utils';
import auth from '../middleware/auth.middleware';
import access from './../access';
const router = Router();

// /api/user/login
router.get(
   '/login',
   (request, response) => {
      const {login, password} = request.query || {};
      const runChecks = (user) => {
         if (!user) {
            response.status(400).json({ message: 'Пользователь не найден' });
            throw 'internal';
         }
   
         if (password !== user.password) {
            response.status(403).json({ message: 'Неверный пароль, попробуйте снова' });
            throw 'internal';
         }

         return user;
      };

      const saveToken = (user) => {
         const token = jwt.sign(
            {
               userId: user.user_id,
               role: user.role
            },
            getFromConfig("jwtsecret"),
            { expiresIn: '1w' }
         );

         return { user, token };
      };

      request.pool
         .query(db.queries.select('users', { login }))
         .then(db.getOne)
         .then(runChecks)
         .then(saveToken)
         .then(({user, token}) => response.json({ user, token }))
         .catch((e) => handleDefault(e, response));
   }
);

// /api/user/getUserByToken
router.get(
   '/getUserByToken',
   wrapResponse((request, response) => {
      const token = request.headers.authorization;
      if (!token) {
         return response.status(403).json({ message: 'Пользователь не был автризован' });
      }

      const decoded = jwt.verify(token, getFromConfig('jwtsecret'));
      const user_id = decoded.userId;

      const checkUserExists = (user) => {
         if (!user) {
            response.status(400).json({ message: 'Пользователь не найден' });
            throw 'internal';
         }

         return user;
      }

      request.pool
         .query(db.queries.select('users', { user_id }))
         .then(db.getOne)
         .then(checkUserExists)
         .then((user) => response.json({ user: user }))
         .catch((e) => handleDefault(e, response));
   }));

// /api/user/getAll
router.get(
   '/getAll',
   wrapAccess(auth, access.user.getAll),
   wrapResponse(async (request, response) => {
      const allUsers = await request.client.query(
         db.queries.select('users')
      ).then(db.getAll).catch((e) => handleDefault(e, response));

      response.json({ users: allUsers });
   })
);

// /api/user/add
router.post(
   '/add',
   wrapAccess(auth, access.user.add),
   wrapResponse(async (request, response) => {
      const {
         login, role, password, firstname, lastname, surname, company, department, position, region_id, email, education, dob, experience
      } = request.body;

      const candidate = await request.client.query(
         db.queries.select('users', { login })
      ).then(db.getOne).catch((e) => handleDefault(e, response));

      if (candidate) {
         return response.status(400).json({ message: "Такой пользователь уже существует" });
      }

      let userRes = {};
      await request.client.query(db.queries.insert('users', {
         login, role, password, firstname, lastname, surname, company, department, position, region_id, email, education, dob, experience
      }))
      .then(db.getOne)
      .then((user) => {
         if (user) {
            userRes = user;
            return request.client.query(db.queries.user.setDocuments({ user_id: user.user_id }))
         }
         throw new Error('Не удалось создать пользователя');
      })
      .catch((e) => handleDefault(e, response));

      response.status(201).json({ message: "Пользователь создан", userId: userRes['user_id'] });
   })
);

// /api/user/edit
// router.post(
//    '/edit',
//    // wrapAccess(auth, access.user.edit),
//    wrapResponse(async (request, response) => {
//       const {
//          login, role, password, firstname, lastname, surname, company, department, position, region_id
//       } = request.body;

//       const user = await request.client
//          .query(db.queries.update('users', {
//             role, password, firstname, lastname, surname, company, department, position, region_id
//          }, { user_id }))
//          .then((result) => {
//             if (db.getOne(result)) {
//                return request.client.query(db.queries.user.setDocuments())
//             }
//          })
//          .then(db.getOne)
//          .catch((e) => handleDefault(e, response));
      
//       console.log(user);
//       response.status(201).json({ message: "Пользователь изменен", user });
//    }));

module.exports = router;
