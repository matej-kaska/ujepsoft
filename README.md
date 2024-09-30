# UJEP Soft

**UJEP Soft** je webová aplikace určená pro personál UJEPu, který může vytvářet nabídky na vývoj softwaru, na které mohou studenti reagovat a vyvíjet požadovaný software. Aplikace dále slouží jako issue tracker, podobně jako na GitHubu – pro každý přidaný repozitář může personál UJEPu vytvořit issue (problém/úkol), který se objeví v GitHub repozitáři dané aplikace.

Aplikace podporuje nahrávání souborů a obsahuje WYSIWYG editor pro snadnou úpravu textu.

## Technologie 🛠

Aplikace je postavena na moderním technologickém stacku:
- **Backend**: [Django](https://www.djangoproject.com/) + [PostgreSQL](https://www.postgresql.org/)
- **Frontend**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Reverse Proxy**: [NGINX](https://www.nginx.com/)
- **Kontejnerizace**: [Docker](https://www.docker.com/)

Aplikace běží na `localhost:8080` a je plně kontejnerizována pomocí Dockeru.

## Funkce 🚀

- **Nabídky softwaru**: Personál může vytvářet nabídky projektů, na které mohou studenti reagovat a následně pracovat.
- **Issue tracker**: Správa problémů a úkolů, podobně jako na GitHubu, umožňuje vytvářet a spravovat issues pro každý projekt.
- **Nahrávání souborů**: Uživatelé mohou připojovat soubory k nabídkám nebo issue.
- **WYSIWYG editor**: Umožňuje snadnou úpravu textu a formátování v rámci aplikace.

## Předpoklady 💻

- [Docker](https://www.docker.com/get-started) a [Docker Compose](https://docs.docker.com/compose/install/) nainstalovány v systému.

## Jak spustit aplikaci 🔧

### Vývojové prostředí (development)

1. Naklonujte repozitář:
    ```bash
    git clone https://github.com/vase-repo/ujep-soft.git
    ```

2. V root adresáři projektu spusťte příkaz pro sestavení Docker kontejnerů:
    ```bash
    docker compose -f docker-compose.yml build
    ```

3. Spusťte aplikaci:
    ```bash
    docker compose -f docker-compose.yml up
    ```

Aplikace bude dostupná na `http://localhost:8080`.

### Produkční prostředí (production)

1. Pro produkční nasazení použijte následující příkazy:
    ```bash
    docker compose -f docker-compose.prod.yml build
    docker compose -f docker-compose.prod.yml up
    ```

Aplikace bude dostupná na `http://localhost:8080`.

## Contributing ☝

Pokud máte zájem o příspěvek do projektu, postupujte podle následujících kroků:

1. Vytvořte fork projektu
2. Vytvořte novou větev pro vaši funkci (`git checkout -b feature/nova-funkce`)
3. Commitujte vaše změny (`git commit -m 'Přidání nové funkce'`)
4. Pushněte změny do větve (`git push origin feature/nova-funkce`)
5. Vytvořte Pull Request

## Contributors 👥

- [Matej Kaška](https://github.com/matej-kaska)
- [Jakub Moravec](https://github.com/jmoravec01)
- [Jan Chlouba](https://github.com/Boubik)