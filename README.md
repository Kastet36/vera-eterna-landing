# vera-eterna-landing

Лендинг имидж-студии «Вера Этерна».

## Предпросмотр

GitHub Pages: https://kastet36.github.io/vera-eterna-landing/

Архив двух отклонённых концепций первого экрана: https://kastet36.github.io/vera-eterna-landing/hero-alternatives.html

Сайт публикуется из ветки `main`, из корня репозитория. После `git push origin main` GitHub Pages автоматически собирает и публикует новую версию.

## Публикация из этого рабочего окружения

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
