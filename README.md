# enb-priv-js [![Build Status](https://travis-ci.org/enb/enb-priv-js.png?branch=master)](https://travis-ci.org/enb/enb-priv-js)

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
* *Boolean* **keepRequires** — отключает вырезание require, позволяет ускорить сборку. По умолчанию — `false`.

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
* *Boolean* **keepRequires** — отключает вырезание require, позволяет ускорить сборку. По умолчанию — `false`.

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
