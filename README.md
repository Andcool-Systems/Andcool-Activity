# Andcool Activity
**Сервис, позволяющий регистрировать активность в редакторе кода и получать его через RestFul API.**  

> [!NOTE]
> Это личный проект, сделанный для собственных нужд. Оригинальный API (activity.andcool.ru) работает только с редактором кода разработчика. Если вы хотите сделать собственный сервис, то вам нужно запускать API на своём сервере. В ходе разработки будет добавлена возможность использовать оригинальный API для собственных нужд.


## Работа c API
`GET /`  
Получить текущую активность.  

### **Пример ответа сервера:**
```json
[
  {
    "id": 377749,
    "workplace": "andcool_activity",
    "file": "README.md",
    "debugging": false,
    "start_time": "2024-08-25T14:43:04.247Z"
  }
]
```
Возвращаемый ответ содержит массив текущих активностей. Поля `workplace` и `file` в теле ответа могут иметь значение `null`.

---

`POST /heartbeat`
Отправить запрос на поддержание активности.  

Заголовок запроса должен содержать хеадер `Authorization`, имеющий значение `Api-Key <api key>`  
### **Пример тела запроса:**
```json
{
    "id": 377749,
	"workplace": "andcool_activity",
	"file": "README.md",
	"debugging": false
}
```
Описание полей запроса:  
- id — Уникальный идентификатор активности. Позволяет идентифицировать запрос на продление активности. Может быть любым числом.
- workplace — Текущее рабочее пространство. Должно иметь тип `string` или `null`, если рабочее пространство не открыто.
- file — Текущий файл, открытый в редакторе. Должен иметь тип `string` или `null`, если редактор не открыт.
- debugging — Показывает, когда текущий проект отлаживается. Должен иметь тип `boolean`.

Успешное выполнение запроса вернёт код `201`

## Логика работы
Плагин устанавливается в редактор кода (на данный момент только VSCode). При установке он запросит ключ API. После успешной установки и настройки ключа, плагин начнёт проверять открытые файлы раз в 30 секунд и отправлять запросы на API. Если API не получает запрос на продление активности более 60 секунд, он удаляет её из текущих активностей.

---
**by AndcoolSystems, August 24, 2024**