# UJEP Soft
## Zapnutí dockeru
- ``git clone https://github.com/matej-kaska/ujepsoft.git``
- ``cd ujepsoft``
- ``docker compose up``
- url -> ``localhost:8080``

## Admin rozhraní
- ``localhost:8080/admin``
- username: ``ujep@ujep.cz``
- password: ``ujep@ujep.cz``

## Figma
[Odkaz](https://www.figma.com/file/lvROE5Fqhf1coV0eAV8Yrh/UJEB-Soft?type=design&node-id=0-1&mode=design&t=MtY7qnJbEXPnkw6I-0)

## Pravidla workflow
- Názvy branchí: feature/xxx, fix/xxx, styling/xxx, enhancement/xxx, devx/xxx
- Zákaz používání jiných formátovacích doplňků než je nastaven
- Vytvářet co nejvíce a co nejmenší komponenty
- Používat barvy a fonty z App.scss
- Sass dělat jenom vnořený (pouze jedna classa)
- Každá komponenta má parent div, který má classu jméno komponenty `<Zapati/>  ->  return(<footer classname="zapati"></footer>)`
- Při PR opravit chyby v Biome.js (cd frontend -> npx biome check .) a Ruff (cd backend -> ruff check .)
- Na FE držet tuto hierarchii `import > komponenta > useState > useEffect > funkce > return JSX HTML`
- Používat arrow funkce `const funkce = () => {}`
- Používat SVGs všude, kde je to možné
- Axios používat pomocí `import axiosRequest from "utils/axios"`
- Pro přidání knihovny `npm i xxx` v `ujepsoft/frontend`, smazat container `ujepsoft` > `client`, smazat image `ujepsoft-client`, smazat volume `ujepsoft_node_modules`

### Doporučené extesions pro VS Code
- PostCSS Language Support
- Tailwind CSS IntelliSense
- Error Lens
- Material Icon Theme
- Auto Close Tag
- Auto Rename Tag
- Django
