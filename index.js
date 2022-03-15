const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
var cors = require('cors')
app.use(cors())

//import config database
var config = require('./config.json')

//config body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//MySQL
const mysql = require('mysql')
const con = mysql.createConnection({
	host: config.host,
	port: config.port,
	user: config.user,
	password: config.password,
	database: config.database
})
con.connect()

//GET

//objets complexes
app.get('/api/getFullCompoByID', (req, res) => {
	console.log('api/get full compo by ID')
	var id = req.headers['id']
	var tab = {}
	con.query(`select * from composante where composanteID = ?`, [id], (err, rows) => {
		if(err){
			res.status(500).send('erreur id')
		}
		else{
			var compo = Object.assign({}, rows[0])
			tab.id =  compo.composanteID
			tab.nom = compo.nom
   			con.query(`select * from utilisateur where utilisateur.composanteID = ?`,[id], (err, rows) => {
				tab.utilisateur = rows.map(v => Object.assign({}, v))
				con.query(`select * from filiereLangue where composanteID = ? `, [id], (err, rows) => {
					tab.filiere = rows.map(v => Object.assign({}, v))
        				console.log(tab)
        				res.status(200).send(tab)
				})
			})
		}
	})
})

//filiere
app.get('/api/getAllFilieres', (req, res) => {
        console.log('api/getAllFilieres')
        con.query('SELECT * from filiereLangue', (err, rows) => {
                if(err){
                        console.log(err)
                        res.status(500).send('erreur')
                }
                else{

                        rows = rows.map(v => Object.assign({}, v))
                        res.status(200).send(rows)
                }
        })
})

app.get('/api/getFiliereByID', (req,res) => {
        console.log('api/getFiliereByID')
        console.log(req.headers)
        con.query('SELECT * FROM filiereLangue WHERE filiereLangueID = ' + req.headers['id'], (err, rows) => {
                if(err){
                        console.log(err)
                }
                else{
                        rows = Object.assign({}, rows[0])
                        res.status(200).send(rows)
                }
        })
})


//composante
app.get('/api/getAllCompo', (req, res) => {
        console.log('api/getAllCompo')
        con.query('SELECT * from composante', (err, rows) => {
                if(err){
                        console.log(err)
                        res.status(500).send('erreur')
                }
                else{

                        rows = rows.map(v => Object.assign({}, v))
                        res.status(200).send(rows)
                }
        })
})

app.get('/api/getCompoByID', (req,res) => {
        console.log('api/getCompoByID')
        console.log(req.headers)
        con.query('SELECT * FROM composante WHERE composanteID = ' + req.headers['id'], (err, rows, fields) => {
                if(err){
                        console.log(err)
                }
                else{
                        rows = Object.assign({}, rows[0])
                        res.status(200).send(rows)
                }
        })
})


//types
app.get('/api/getAllTypes', (req, res) => {
	console.log('api/getAllTypes')
	con.query('SELECT * from typeUtilisateur', (err, rows, fields) => {
		if(err){
			console.log(err)
			res.status(500).send('erreur')
		}
		else{

			rows = rows.map(v => Object.assign({}, v))
			res.status(200).send(rows)
		}
	})
})

//utilisateurs
app.get('/api/getAllUsers', (req, res) => {
	console.log('api/getAllUsers')
	con.query('SELECT * from utilisateur;', (err, rows, fields) => {
		//console.log('select * from utilisateur  = ', rows[0].solution)
		rows = rows.map(v => Object.assign({}, v))
		res.status(200).send(rows)
	})
})

app.get('/api/getUserByID', (req,res) => {
	console.log('api/getUserByID')
	console.log(req.headers)
	if(req.headers.id !== null){
		con.query('SELECT * FROM utilisateur WHERE utilisateurID = ' + req.headers['id'], (err, rows, fields) => {
			if(err){ 
				console.log(err)
			}
			else{
				rows = Object.assign({}, rows[0])
				res.status(200).send(rows)
			}
		})
	}
})

app.get('/api/getAllUsersByType', (req,res) => {
	console.log('api/getAllUsersByType')
	var T = {gestionnaire: 1, vacataire: 2, responsable:3}
	con.query('SELECT * FROM utilisateur WHERE typeID = ' + T[req.headers['type']], (err, rows, fields) => {
		if (err) {
			console.log(err)
			res.status(500).send('erreur requête')
		}
		else{
			console.log(req.headers)
			rows = rows.map(v  => Object.assign({}, v))
			res.setHeader('Access-Control-Allow-Origin','*')
			res.status(200).send(rows)
		}
	})
})

//POST
app.post('/api/setCompo', (req,res) => {
	console.log('api/setCompo')
	var T = req.body
	con.query('INSERT INTO composante (nom) VALUES(?)',[T.nom],(err, rows) => {
		if(err){
			console.log(err)
			res.status(500).send('erreur')
		}else{
			res.status(200).send('insertion réussie')
		}
	})
})

app.post('/api/setUser',(req,res) => {
	console.log('api/setUser')
	var T = req.body
	var A = {gestionnaire:1, vacataire:2, responsable:3}
	var sql = `INSERT INTO utilisateur (login,motDePasse,nomUsuel,prenom,mail,typeID,composanteID) VALUES ('${T['login']}','${T['motDePasse']}','${T['nomUsuel']}','${T['prenom']}','${T['mail']}',${A[T['type']]},${T['composanteID']})`
	con.query(sql, (err, rows, fields) => {
		if(err){
			console.log(err)
			console.log(T)
			res.status(500).send('insertion incorrecte')
		}else{
			 res.status(200).send('insertion réussie')
		}
	})
})

app.post('/api/setFiliere', (req,res) => {
	console.log('api/setFiliere')
	var T = req.body
	con.query('INSERT INTO filiereLangue (code, nom, composanteID) VALUES (?,?,?)',[T.code,T.nom,T.composanteID],(err,rows) => {
		if(err){
			console.log(err)
			res.status(500).send('insertion incorrecte')
		}else{
			res.status(200).send('insertion réussie')
		}
	})
})

//DELETE
app.delete('/api/deleteFiliereByID', (req, res) => {
	console.log('api/deleteFiliereByID')
	con.query('DELETE FROM filiereLangue WHERE filiereLangueID = ?',[req.headers.id], (err, rows) => {
		if(err){
			console.log(err)
			res.status(500).send('suppression incorrecte')
		}else{
			res.status(200).send('suppression réussie')
		}
	})
})

app.delete('/api/deleteUserByID', (req, res) => {
	console.log('api/deleteUserByID')
	con.query('DELETE FROM utilisateur WHERE utilisateurID = ' + req.headers['id'] + ';', (err, rows, fields) => {
		if(err){
			console.log(err)
			res.status(500).send('suppression incorrecte')
		}
		else{
			res.status(200).send('suppression réussie')
		}
	})
})

app.delete('/api/deleteCompoByID', (req, res) => {
	console.log('api/deleteCompoByID')
	con.query('DELETE FROM composante WHERE composanteID = ?', [req.headers.id],(err,rows) => {
		if(err){
			console.log(err)
			res.status(500).send('suppression incorrecte')
		}else{
			res.status(200).send('suppression réussie')
		}
	})
})

//PUT
app.put('/api/updateUserByID',(req, res) => {
	console.log('api/updateUserByID')
	var body = req.body
	var A = {gestionnaire:1, vacataire:2, responsable:3}
	con.query('UPDATE utilisateur SET login = ?, motDePasse = ?, nomUsuel = ?, prenom = ?, mail = ?, typeID = ?,composanteID = ? WHERE utilisateurID = ?',
	 [body.login, body.motDePasse, body.nomUsuel, body.prenom, body.mail, A[body.type],body.composanteID ,body.utilisateurID], (err, rows, fields) => {
		if (err){
			console.log(err)
			res.status(500).send('erreur modification')
		}else{
			res.status(200).send(body)
		}
	})
})

app.put('/api/updateCompoByID',(req,res) => {
	console.log('api/updateCompoByID')
	var T = req.body
	con.query('UPDATE composante SET nom = ? WHERE composanteID = ?', [T.nom,T.composanteID], (err, rows) => {
		if(err){
			console.log(err)
			res.status(500).send('erreur modification')
		}else{
			res.status(200).send(T)
		}
	})
})
app.put('/api/updateFiliereByID',(req,res) => {
	console.log('api/updateFiliereByID')
	var T = req.body
	con.query('UPDATE filiereLangue SET code = ?, nom = ?, composanteID = ? WHERE filiereLangueID = ?', [T.code,T.nom,T.composanteID,T.filiereLangueID], (err, rows) => {
		if(err){
			console.log(err)
			res.status(500).send('erreur modification')
		}else{
			res.status(200).send(T)
		}
	})
})
app.listen(port, () => {
	console.log(`En attente de requetes sur le port : ${port}`)
})
