const jwt = require('jsonwebtoken');
import {getFromConfig} from './../utils';

export default (request, response, next, accessArray) => {
   if (request.method === 'OPTIONS') {
      return next();
   }

   try {
      const token = request.headers.authorization;

      if (!token) {
         return response.status(401).json({ message: 'Вы не авторизованы' });
      }

      const decoded = jwt.verify(token, getFromConfig('jwtsecret'));
      request.user = decoded;

      // ПРОВЕРКА ПРАВ
      if (!accessArray.includes(request.user.role)) {
         return response.status(403).json({ message: 'У вас нет доступа к этому действию' })
      }

      next();
   } catch(e) {
      response.status(401).json({ message: 'Вы не авторизованы' });
   }
};
