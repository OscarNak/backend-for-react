# README.md

## Cloner le repository

```bash
$ git clone https://github.com/OscarNak/backend-for-react.git
```

## Installation de Node et des paquets

```bash
$ cd backend-for-react
$ npm install
```

## Création de ton fichier de configuration

tu dois créer dans le même répertoire que t-on projet, un fichier config.json avec les informations de connexion à la base de données. 

```bash
$ touch config.json
```

L’objet JSON est sous la forme suivante :

```json
{
        "port":<port de la bdd>,
        "host":"<url bdd>",
        "user":"<user bdd>",
        "password":"<password bdd>",
        "database":"<nom de la bdd>",
        "SECRET":"<chaine de caractère pour le cryptage par clef>",
        "portNode":<port node>
}
```

## Lancement du serveur Express

```bash
$ node index
```
