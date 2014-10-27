# enb-priv-js [![Build Status](https://travis-ci.org/enb-make/enb-priv-js.png?branch=master)](https://travis-ci.org/enb-make/enb-priv-js)

Предоставляет технологии по работе с форматом `priv.js`.

Для сбоки priv-файлов на основе библиотеки [priv-js](https://github.com/maxvipon/priv-js) следует использовать технологии:

* [priv-server](#priv-server)
* [priv-server-include](#priv-server-include)
* [priv-client](#priv-client)
* [priv-client-module](#priv-client-module)

## priv-js

Собирает `?.priv.js` по deps'ам, обрабатывая Борщиком, добавляет BEMHTML в начало.

**Опции**

* *String* **bemhtmlTarget** — Имя `bemhtml.js`-таргета. По умолчанию — `?.bemhtml.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
  (его предоставляет технология `files`). По умолчанию — `?.files`.
* *Array* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['priv.js'].

**Пример**

```js
nodeConfig.addTech(require('enb-priv-js/techs/priv-js'));
```

## priv-js-i18n

Собирает *{lang}.priv.js*-файлы из *priv.js* и языковых файлов.

**Опции**

* *String* **target** — Результирующий priv.js-файл. По умолчанию — `?.{lang}.priv.js`.
* *String* **privJsTarget** — Исходный priv.js-файл. По умолчанию — `?.priv.js`.
* *String* **lang** — Язык. Обязательная опция.
* *String* **langTarget** — lang.js-файл конкретного языка. Например, `?.lang.ru.js`.
  По умолчанию — `?.lang.{lang}.js`.
* *String* **allLangTarget** — lang.all.js-файл. По умолчанию — `?.lang.all.js`.

**Пример**

```js
nodeConfig.addTech([ require('enb-priv-js/techs/priv-js-i18n'), {
  langTarget: ['all'].concat(config.getLanguages()).map(function(lang) {
    return '?.lang.' + lang + '.js';
  })
}]
```

## priv-js-i18n-all

Собирает *all.priv.js*-файл из *priv.js* и массива языковых файлов.

**Опции**

* *Array* **langTargets** — Массив lang.js-таргетов. По умолчанию — `[]`.
* *String* **privJsTarget** — Исходный priv.js-файл. По умолчанию — `?.priv.js`.
* *String* **target** — Результирующий priv.js-файл. По умолчанию — `?.all.priv.js`.

**Пример**

```js
nodeConfig.addTech([require('enb-priv-js/techs/priv-js-i18n-all'), {
  langTargets: ['all'].concat(config.getLanguages()).map(function(lang) {
    return '?.lang.' + lang + '.js';
  })
}]
```

## pub-js-i18n

Собирает *{lang}.pub.js*-файл из *js*, языковых файлов и *bemhtml*.

**Опции**

* *String* **target** — Результирующий `pub.js`-файл. По умолчанию — `?.all.pub.js`.
* *String* **jsTarget** — Исходный `js`-файл. По умолчанию — `?.js`.
* *String* **lang** — Язык. Обязательная опция.
* *String* **langTarget** — `lang.js`-файл конкретного языка. Например, `?.lang.ru.js`.
  По умолчанию — `?.lang.{lang}.js`.
* *String* **allLangTarget** — `lang.all.js`-файл. По умолчанию — `?.lang.all.js`.
* *String* **bemhtmlTarget** — `bemhtml.js`-файл. По умолчанию — `?.bemhtml.js`.

**Пример**

```js
nodeConfig.addTech([require('enb-priv-js/techs/pub-js-i18n'), {
  jsTarget: '?.js',
  target: '?.pub.js'
}]
```

## priv-server

Склеивает *priv*-файлы по deps'ам с помощью набора `require` в виде `?.priv.js`.
Предназначен для сборки серверного priv-кода. После сборки требуется наличия всех файлов,
подключённых с помощью набора `require`.

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.priv.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
 (его предоставляет технология `files`). По умолчанию — `?.files`.
* *Array* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['priv.js'].

**Пример**

```js
nodeConfig.addTech(require('enb-priv-js/techs/priv-server'));
```

## priv-server-include

Склеивает *priv*-файлы по deps'ам в виде `?.priv.js`. Предназначен для сборки серверного priv-кода.
Предполагается, что в *priv*-файлах не используется `require`.

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.priv.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
  (его предоставляет технология `files`). По умолчанию — `?.files`.
* *Array* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['priv.js'].

**Пример**

```js
nodeConfig.addTech(require('enb-priv-js/techs/priv-server-include'));
```

## priv-client

Склеивает *priv*-файлы по deps'ам с помощью набора `require` в виде `?.priv.client.js`.
Предназначен для сборки клиентского priv-кода.

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.priv.client.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов 
  (его предоставляет технология `files`). По умолчанию — `?.files`.
* *Array* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['priv.js'].

**Пример**

```js
nodeConfig.addTech(require('enb-priv-js/techs/priv-client'));
```

## priv-client-module

Склеивает *priv*-файлы по deps'ам в виде `?.priv.client.js`. Предназначен для сборки клиентского priv-кода.
Использует модульную обертку.

**Опции**

* *String* **target** — Результирующий таргет. По умолчанию — `?.priv.client.js`.
* *String* **filesTarget** — files-таргет, на основе которого получается список исходных файлов
  (его предоставляет технология `files`). По умолчанию — `?.files`.
* *Array* **sourceSuffixes** — суффиксы файлов, по которым строится `files`-таргет. По умолчанию — ['priv'].

**Пример**

```js
nodeConfig.addTech(require('enb-priv/techs/priv-client-module'));
```
