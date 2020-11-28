<h1 align="center">Система поддержки рационализаторских идей ПАО «Россети»</h1>


## Ссылки
<h3><a href="http://ksutechrosset.northeurope.cloudapp.azure.com/#/login">Демо версия web сайта</a></h2>
<h3><a href="ссылки нет">Swagger (API)</a></h2>
<h3><a href="ссылки нет">Презентация проекта </a> </h3>
<h3><a href="ссылки нет">Макеты веб-сайт</a> </h3>
 
## О проекте
Проект является реализацией кейса «Россети» Всероссийского хакатона «Цифровой прорыв»
Ссылка на <a href="https://leadersofdigital.ru/event/214763/case/282072">кейс по хакатону </a> 
<b>Данный проект использует лицензию The MIT License (MIT)</b>

## О нас
Мы команда "Кострома Nova" Костромского государственного университета. <a href="https://ksu.edu.ru/">Ссылка на вуз</a> 

## Цель информационной системы
Непрерывное совершенствование деятельности ПАО «Россети» через внедрение рационализаторских предложений.
Объекты автоматизации:
- система управления рационализаторской деятельностью ПАО «Россети»
- система коммуникации заинтересованных сторон в процессе генерации и внедрения рационализаторских идей по непрерывному совершенствованию ПАО «Россети»

## Назначение системы
- Упрощение процедур подачи заявок на улучшение и внедрение изобретательских идей
- Визуализация текущего состояния рационализаторских предложений на основе принципов Kanban.
- Организация многофакторного поиска (по названию, по типу, по тегам, по региону) рационализаторских идей
- Упрощение процессов формирования команд на внедрение улучшений
- Организация системы коммуникации заинтересованных сторон в процессе внедрения улучшений.
- Поддержка и мотивация людей, активно участвующих в процессах непрерывного улучшения
- Визуализация текущей ситуации системы непрерывного улучшения.

## Система включает в себя: 
- распределенный backend-сервер, сбор, обработку и хранение данных о рационализаторских предложениях и процессе их внедрения
-распределенный frontend-сервер, обеспечивающие работу веб-портала и коммуникацию с мобильным приложением
- мобильное приложение.
В рамках веб-портала и мобильного приложения должны быть реализованы интерфейсы рационализатора, эксперта и руководителя.
Общая архитектура системы приведена на рисунке 1.
Доступ к системе должен быть обеспечен из всех регионов, где находятся филиалы ПАО «Россети».

## Технологии, с помощью которых происходит создание подсистемы

SERVER: NodeJS 
WEB UI: BOOTSTRAP4 + Angular JS + MdBootstrap
MOBILE UI: React Native
BD: Postgres 10
 
## Описание серверной части
Наш сервер поддерживает RESTful API, задокументированном и настроенный для тестирования в сервисе Swagger. Коммуникация между сервером и веб-клиентом (мобильной версией) осуществляется посредством протокола HTTP 1.1. Авторизация пользователя настроена через токен.

<pre> 
app.use(function (req, res, next) {
	if(ALLOWED_ORIGINS.indexOf(req.headers.origin) > -1) {
		res.set('Access-Control-Allow-Credentials', 'true')
		res.set('Access-Control-Allow-Origin', req.headers.origin)
	} else { // разрешить другим источникам отправлять неподтвержденные запросы CORS
		res.set('Access-Control-Allow-Origin', '*')        
	}
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, x-ijt, Authorization');
    next();
});
</pre>
1. Были открыты корс для работы и тестирвоания с наших локальных клиентов
2. Для ангуляр приложения разрешили некоторые cors headers
<br>
На сервере идентифицируем пользователя с помощью куков
<pre>
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
</pre>

## Описание клиентской части
На клиенской стороне реализовано приложение AngularJS с использованием библотеки для стилистики веб приложений Bootstrap4
Модули AngularJS приложения
<pre>
var myApp = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ui.select', 'myApp.services', 'myApp.confirmationModal','myApp.loginPage',
        'myApp.infoModal',  'myApp.mainPage', 'myApp.users', 'myApp.addUserModalModal', 'myApp.editUserModalModal', 'myApp.profile', 'myApp.settings',
        'myApp.chat', 'myApp.kanban', 'myApp.mySuggestion', 'myApp.createProject', 'myApp.project']);
</pre>
<br>
На клиенте работаем с куки, которые получаем с сервера 
<pre>
service.request = function (config) {
        config.headers = config.headers || {};
        //валидация пользователя (проверка авторизации) по хэдеру Authorization
        if(getCookieByName("token") != undefined) config.headers.Authorization = getCookieByName("token");
        return config;
};
</pre>
<br>
## Запуск SERVER и UI

Вся информация об запуске в файле <a href="https://github.com/hackrosseti/rosseti/blob/main/require.txt">require.txt</a>
 
