# README.md

## Installation de Node et des paquets

```bash
npm install
```

## Création de ton fichier de configuration

tu dois créer dans le même répertoire que t-on projet, un fichier config.json avec les informations de connections à la base de données. L’objet json est sous la forme suivante :

```json
{
        "port":<port>,
        "host":"<url bdd>",
        "user":"<user bdd>",
        "password":"<password bdd>",
        "database":"<nom de la bdd>"
}
```

## Lancement du serveur Express

```bash
$ node index
```
