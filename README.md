enb-priv-js [![Build Status](https://travis-ci.org/enb-make/enb-priv-js.png?branch=master)](https://travis-ci.org/enb-make/enb-priv-js)
==========

Предоставляет технологии по работе с форматом `priv.js`.

priv-js
=======

Собирает `?.priv.js` по deps'ам, обрабатывая Борщиком, добавляет BEMHTML в начало.

**Опции**

* *String* **bemhtmlTarget** — Имя `bemhtml.js`-таргета. По умолчанию — `?.bemhtml.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
  (его предоставляет технология `files`). По умолчанию — `?.files`.
* *String* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — 'priv.js'.

**Пример**

```javascript
nodeConfig.addTech(require('enb-priv-js/techs/priv-js'));
```

priv-js-i18n
============

Собирает *all.priv.js*-файл из *priv.js* и языковых файлов.

**Опции**

* *String* **target** — Результирующий priv.js-файл. По умолчанию — `?.all.priv.js`.
* *String* **privJsTarget** — Исходный priv.js-файл. По умолчанию — `?.priv.js`.
* *String* **lang** — Язык. Обязательная опция.
* *Array* **langTarget** — lang.js-файл конкретного языка. Например, `?.lang.ru.js`.
  По умолчанию — `?.lang.{lang}.js`.
* *Array* **allLangTarget** — lang.all.js-файл. По умолчанию — `?.lang.all.js`.

**Пример**

```javascript
 [ require('enb-priv-js/techs/priv-js-i18n-all'), {
     langTargets: ['all'].concat(config.getLanguages()).map(function (lang) {return '?.lang.' + lang + '.js'})
 } ]
```

priv-js-i18n-all
=================

Собирает *all.priv.js*-файл из *priv.js* и массива языковых файлов.

**Опции**

* *Array* **langTargets** — Массив lang.js-таргетов. По умолчанию — `[]`.
* *String* **privJsTarget** — Исходный priv.js-файл. По умолчанию — `?.priv.js`.
* *String* **target** — Результирующий priv.js-файл. По умолчанию — `?.all.priv.js`.

**Пример**

```javascript
 [ require('enb-priv-js/techs/priv-js-i18n-all'), {
     langTargets: ['all'].concat(config.getLanguages()).map(function (lang) {return '?.lang.' + lang + '.js'})
 } ]
```

pub-js-i18n
===========

Собирает *{lang}.pub.js*-файл из *js*, языковых файлов и *bemhtml*.

**Опции**

* *String* **target** — Результирующий `pub.js`-файл. По умолчанию — `?.all.pub.js`.
* *String* **jsTarget** — Исходный `js`-файл. По умолчанию — `?.js`.
* *String* **lang** — Язык. Обязательная опция.
* *Array* **langTarget** — `lang.js`-файл конкретного языка. Например, `?.lang.ru.js`.
  По умолчанию — `?.lang.{lang}.js`.
* *Array* **allLangTarget** — `lang.all.js`-файл. По умолчанию — `?.lang.all.js`.
* *Array* **bemhtmlTarget** — `bemhtml.js`-файл. По умолчанию — `?.bemhtml.js`.

**Пример**

```javascript
 [ require('enb-priv-js/techs/pub-js-i18n'), {
     jsTarget: '?.js',
     target: '?.pub.js'
 } ]
```

