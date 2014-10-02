/**
 * priv-js-i18n
 * ============
 *
 * Собирает *all.priv.js*-файл из *priv.js* и языковых файлов.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий priv.js-файл. По умолчанию — `?.all.priv.js`.
 * * *String* **privJsTarget** — Исходный priv.js-файл. По умолчанию — `?.priv.js`.
 * * *String* **lang** — Язык. Обязательная опция.
 * * *String* **langTarget** — lang.js-файл конкретного языка. Например, `?.lang.ru.js`.
 *   По умолчанию — `?.lang.{lang}.js`.
 * * *String* **allLangTarget** — lang.all.js-файл. По умолчанию — `?.lang.all.js`.
 *
 * **Пример**
 *
 * ```js
 * nodeConfig.addTech([ require('enb-priv-js/techs/priv-js-i18n-all'), {
 *   langTargets: ['all'].concat(config.getLanguages()).map(function(lang) {
 *     return '?.lang.' + lang + '.js';
 *   })
 * }]
 * ```
 */
module.exports = require('enb/lib/build-flow').create()
    .name('priv-js-i18n')
    .target('target', '?.{lang}.priv.js')
    .defineRequiredOption('lang')
    .useSourceFilename('allLangTarget', '?.lang.all.js')
    .useSourceFilename('langTarget', '?.lang.{lang}.js')
    .useSourceFilename('privJsTarget', '?.priv.js')
    .justJoinFilesWithComments()
    .createTech();
