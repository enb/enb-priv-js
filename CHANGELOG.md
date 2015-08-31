История изменений
=================

3.x
-----

* Удалена технология priv-js-i18n-all.js
* Удалена технология priv-js-i18n.js
* Удалена технология pub-js-i18n.js
* Удалена технология pub-js-only-i18n.js
* Технология priv-server.js была переименована в priv-commonjs
* Технологии priv-server-include.js, priv-client.js, priv-client-module.js объеденены в технологию priv-bundle
* Реализован механизм подключения зависимостей аналогичный тому, который используется в пакетах enb-bh, enb-bemxjst, enb-xjst
* Для технологий priv-commonjs и priv-bundle написаны тесты
* Удалена поддержка опции keepRequires.

2.3.1
-----

* Вместо модуля `enb-borschik` теперь используется `borschik` ([#8]).

2.3.0
-----

* Добавлена технология `pub-js-only-i18n` ([#5]).

2.2.0
-----

* Для технологий `priv-client` и `priv-server` добавлена опция `keepRequires`, которая отключает вырезание require, что позволяет ускорить сборку ([#7]).

[#8]: https://github.com/enb-make/enb-priv-js/pull/8
[#7]: https://github.com/enb-make/enb-priv-js/pull/7
[#5]: https://github.com/enb-make/enb-priv-js/pull/5
