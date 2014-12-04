/**
 * pub-js-only-i18n
 * ===========
 *
 * Собирает *{lang}.pub.js*-файл из *js* и языковых файлов.
 *
 * **Опции**
 *
 * * *String* **target** — Результирующий `pub.js`-файл. По умолчанию — `?.all.pub.js`.
 * * *String* **jsTarget** — Исходный `js`-файл. По умолчанию — `?.js`.
 * * *String* **lang** — Язык. Обязательная опция.
 * * *String* **langTarget** — `lang.js`-файл конкретного языка. Например, `?.lang.ru.js`.
 *   По умолчанию — `?.lang.{lang}.js`.
 * * *String* **allLangTarget** — `lang.all.js`-файл. По умолчанию — `?.lang.all.js`.
 *
 * **Пример**
 *
 * ```js
 * nodeConfig.addTech([require('enb-priv-js/techs/pub-js-only-i18n'), {
 *   target: '?.{lang}.js',
 *   lang: '{lang}'
 * }]
 * ```
 */
module.exports = require('enb/lib/build-flow').create()
    .name('pub-js-only-i18n')
    .target('target', '?.{lang}.pub.js')
    .defineRequiredOption('lang')
    .useSourceFilename('jsTarget', '?.js')
    .useSourceFilename('allLangTarget', '?.lang.all.js')
    .useSourceFilename('langTarget', '?.lang.{lang}.js')
    .justJoinFilesWithComments()
    .createTech();
