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
   (request, response) => 
      request.pool
         .query(db.queries.select('users', {}, 
         `
            r.region_name
         `,
         `
            LEFT JOIN regions as r ON r.region_id = t.region_id
         `))
         .then(db.getAll)
         .then((result) => response.json({ users: result }))
         .catch((e) => handleDefault(e, response))
);

// /api/user/add
router.post(
   '/add',
   wrapAccess(auth, access.user.add),
   wrapResponse((request, response) => {
      var user = null;
      const {
         login, role, password, firstname, lastname, surname, company, department,
         position, region_id, email, education, dob, experience, profile_image
      } = request.body;

      const checkUserDoesNotExist = (user) => {
         if (user) {
            response.status(400).json({ message: "Пользователь с таким логином уже существует" });
            throw 'internal';
         }
      };

      request.pool.connect()
         .then(client => {
            return client
               .query(db.queries.select('users', { login }))
               .then(db.getOne)
               .then(checkUserDoesNotExist)

               .then(() => client.query(db.queries.insert('users', {
                  login, role, password, firstname, lastname, surname, company, department,
                  position, region_id, email, education, dob, experience, profile_image
               })))
               .then(db.getOne)
               .then((res) => {
                  user = res;
               })

               .then(() => client.query(db.queries.user.setDocuments({ user_id: user.user_id })))
               .then(() => client.release())
               .then(() => response.status(201).json({ message: "Пользователь создан", userId: user.user_id }))
               .catch(e => {
                  client.release();
                  handleDefault(e, response);
               })
         });
   })
);

// /api/user/edit
router.post(
   '/edit',
   wrapAccess(auth, access.user.edit),
   wrapResponse((request, response) => {
      var user = null;
      const {
         login, role, password, firstname, lastname, surname, company, department, position, region_id, user_id,
         email, education, dob, experience, profile_image
      } = request.body;
      const checkUserDoesNotExist = (user) => {
         if (user) {
            response.status(400).json({ message: "Пользователь с таким логином уже существует" });
            throw 'internal';
         }
      };

      if (!user_id) {
         return response.status(400).json({ message: 'Не задан ID пользователя для модификации' });
      }

      request.pool.connect()
         .then(client => {
            return client
               .query(db.queries.select('users', { user_id }))
               .then(db.getOne)
               .then(user => {
                  if (login !== user.login) {
                     return client.query(db.queries.select('users', { login })).then(db.getOne).then(checkUserDoesNotExist)
                  }
               })
               
               .then(() => client.query(db.queries.update('users', {
                  login, role, password, firstname, lastname, surname, company,
                  department, position, region_id, email, education, dob, experience, profile_image
               }, { user_id })))
               .then(db.getOne)
               .then(res => {
                  if (res) {
                     user = res;
                     return client.query(db.queries.user.setDocuments({ user_id: res.user_id }))
                  } else {
                     handleDefault(new Error('Не удалось изменить данные по пользователю'), response);
                  }
               })
               .then(() => client.release())
               .then(() => response.json({ userId: user.user_id }))
               .catch(e => {
                  client.release();
                  handleDefault(e, response);
               })
         });
   }));

// /api/user/getUserProfile
router.get(
   '/getUserProfile',
   wrapAccess(auth, access.user.getUserProfile),
   (request, response) => {
      var awards = null;
      var likes_amount = null;
      var own_projects = null;
      const { userId } = request.query;

      request.pool.connect()
         .then(client => {
            return client
               .query(db.queries.select('users_awards', { user_id: userId },
               `
                  a.medal_name, a.medal_url
               `,
               `
                  LEFT JOIN awards as a ON a.medal_id = t.medal_id
               `)).then(db.getAll).then(res => { awards = res; })
               .then(() =>
                  client.query(db.queries.select('likes', { user_id: userId }))
                     .then(db.getAll)
                     .then(res => { likes_amount = res.length; })
               )
               .then(() =>
                  client.query(db.queries.select('project_group', { user: userId }))
                  .then(db.getAll)
                  .then(res => { own_projects = res.length; })
               )
               .then(() => client.release())
               .then(() => response.json({
                  awards: awards,
                  likes_amount: likes_amount,
                  own_projects: own_projects
               }))
               .catch(e => {
                  client.release();
                  handleDefault(e, response);
               })
         });
   }
);

module.exports = router;
