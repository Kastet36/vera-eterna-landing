# vera-eterna-landing

Лендинг имидж-студии «Вера Этерна».

## Предпросмотр

GitHub Pages: https://kastet36.github.io/vera-eterna-landing/

Архив двух отклонённых концепций первого экрана: https://kastet36.github.io/vera-eterna-landing/hero-alternatives.html

Предпросмотр публикуется из ветки `main`, из корня репозитория. После `git push origin main` GitHub Pages автоматически собирает новую версию предпросмотра. Рабочий сайт обслуживает nginx на текущем сервере.

## Обновление предпросмотра на GitHub Pages

GitHub CLI установлен в `~/.local/bin/gh`. Аккаунт `Kastet36` уже авторизован, а Git credential helper настроен. Поэтому обычные доработки можно публиковать без повторного входа:

```bash
git add <изменённые-файлы>
git commit -m "Краткое описание изменений"
git push origin main
```

Проверить авторизацию:

```bash
gh auth status --hostname github.com
```

Повторная авторизация понадобится, только если:

- доступ GitHub CLI будет отозван;
- будет выполнен `gh auth logout`;
- изменится политика доступа GitHub;
- будет удалён локальный файл `~/.config/gh/hosts.yml`.

Сам токен, его значение или другие секреты нельзя добавлять в README, Git или файлы проекта.

## Структура сайта

`index.html` остаётся в корне репозитория. Стили находятся в `assets/css/site.css`,
скрипт интерфейса — в `assets/js/site.js`, шрифты — в `assets/fonts/`, изображения —
в `assets/images/`. Небольшой код Яндекс Метрики остаётся в `<head>`.

## Рабочий сервер

Рабочие статические файлы находятся рядом с репозиторием, в
`../promo.vera-eterna.ru/` (полный путь:
`/home/direkt_analitika_v3_admin/Вера Этериа/promo.vera-eterna.ru/`).
Обновить их из репозитория:

```bash
./scripts/publish-local.sh
```

Скрипт копирует только `index.html` и `assets/`. Архив `hero-alternatives.html`,
README и служебные файлы на рабочий домен не попадают. Конфигурация виртуального
хоста подготовлена в `deploy/promo.vera-eterna.ru.nginx.conf`. Её необходимо установить
в `/etc/nginx/sites-available/`, включить в `sites-enabled/`, проверить `nginx -t`,
перезагрузить nginx и выпустить сертификат для `promo.vera-eterna.ru`:

```bash
sudo cp deploy/promo.vera-eterna.ru.nginx.conf /etc/nginx/sites-available/promo.vera-eterna.ru
sudo ln -s /etc/nginx/sites-available/promo.vera-eterna.ru /etc/nginx/sites-enabled/promo.vera-eterna.ru
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d promo.vera-eterna.ru --redirect
```

На этом сервере у текущего пользователя `sudo` требует пароль, поэтому эти команды
должен выполнить пользователь с правами администратора. DNS уже указывает на этот
сервер; до включения виртуального хоста домен отдаёт стандартную страницу nginx.

Формы заявок пока не подключены к API и не отправляют данные.
