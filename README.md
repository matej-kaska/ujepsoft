# UJEP soft
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
- Zákaz používání formátovacích doplňků na již vytvořených souborech
- Vytvářet co nejvíce a co nejmenší komponenty
- Používat barvy a fonty z App.scss
- Sass dělat jenom vnořený (pouze jedna classa)
- Každá komponenta má parent div, který má classu jméno komponenty `<Zapati/>  ->  return(<footer classname="zapati"></footer>)`
- Při PR opravit chyby v ESLintu, pokud se zde nějaké nachází
- Na FE držet tuto hierarchii `import > komponenta > useState > useEffect > funkce > return JSX HTML`
- Používat arrow funkce `const funkce = () => {}`
- Používat SVGs všude, kde je to možné
- Axios používat pomocí `import axios from "utils/axios"`
- Pro přidání knihovny `npm i xxx` v `eduklub/frontend`, smazat container `eduklub` > `client`, smazat image `ujepsoft-client`, smazat volume `ujepsoft_node_modules`

### backend-old je Django, na kterým se můžeš učit

### Doporučené extesions pro VS Code
- ESLint
- PostCSS Language Support
- Tailwind CSS IntelliSense
- Error Lens
- Material Icon Theme
- Auto Close Tag
- Auto Rename Tag
- Django