const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
const port = 3000
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

//middleware
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization

    if (authHeader) {
        const token = authHeader.split(' ')[1]

        try {
		var decoded = jwt.verify(token, config.SECRET)
        	next()
	}catch(err){
		res.status(500).send('token invalide')
	}
    } else {
        res.sendStatus(401);
    }
}
//GET

//objets complexes

app.get('/api/getFullCoursByID', (req, res) => {
        console.log('api/getFullCoursByID')
        var id = req.headers['id']
        var tab = {}
        con.query('SELECT * from cours where coursID = ?', [id],(err, rows) => {
                if(err){ res.status(500).send('erreur id')}
                else{
                        var resultat = Object.assign({}, rows[0])
                        tab.coursID = resultat.coursID
                        tab.intitule = resultat.intitule

                        con.query('select * from utilisateur INNER JOIN coursUtilisateurLinker ON utilisateur.utilisateurID = coursUtilisateurLinker.utilisateurID WHERE coursUtilisateurLinker.coursID = ?',[id],(err, rows)=>{
                                tab.utilisateur = rows.map(v => Object.assign({}, v))
				con.query('select * from filiereLangue INNER JOIN coursFiliereLangueLinker ON filiereLangue.filiereLangueID = coursFiliereLangueLinker.filiereLangueID WHERE coursFiliereLangueLinker.coursID = ?',[id],(err, rows)=>{
					tab.filiere = rows.map(v => Object.assign({}, v))
					console.log(tab)
					res.status(200).send(tab)
				})
                        })
                }
        })

})

app.get('/api/getFullFiliereByID', (req, res) => {
	console.log('api/getFullFiliereByID')
	var id = req.headers['id']
	var tab = {}
	con.query('SELECT * from filiereLangue where filiereLangueID = ?', [id],(err, rows) => {
		if(err){ res.status(500).send('erreur id')}
		else{
			var resultat = Object.assign({}, rows[0])
			tab.filiereLangueID = resultat.filiereLangueID
			tab.code = resultat.code
			tab.nom = resultat.nom
			tab.composanteID = resultat.composanteID
			con.query('select * from composante where composanteID = ?',[tab.composanteID],(err, rows)=>{
				tab.composante = Object.assign({}, rows[0])

				con.query('SELECT cours.coursID, cours.intitule from cours INNER JOIN coursFiliereLangueLinker AS L ON cours.coursID = L.coursID INNER JOIN filiereLangue ON filiereLangue.filiereLangueID = L.filiereLangueID WHERE filiereLangue.filiereLangueID = ?',[id],(err, rows)=>{
					tab.cours = rows.map(v => Object.assign({}, v))
					console.log(tab)
					res.status(200).send(tab)
				})
			})
		}
	})

})


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

//creneaux
app.get('/api/getAllCreneaux',(req, res) => {
	console.log('api/getAllCreneaux')
	con.query('SELECT * from creneau', (err, rows) => {
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

app.get('/api/getAllCreneauxByCoursID',(req, res) => {
	console.log('api/getAllCreneauxByCoursID')
	con.query('SELECT * from creneau WHERE coursID = ?',[req.headers.id], (err, rows) => {
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



//séances
app.get('/api/getAllSeancesByCreneauID',(req, res) => {
	console.log('api/getAllSeances')
	con.query('SELECT * FROM `seanceFormation` WHERE valide = 0 AND creneauID = ?',[req.headers.id], (err, rows) => {
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


//cours
app.get('/api/getAllCours',(req, res) => {
        console.log('api/getAllCours')
        con.query('SELECT * from cours', (err, rows) => {
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

app.get('/api/getCoursByID', (req,res) => {
        console.log('api/getCoursByID')
        console.log(req.headers)
        con.query('SELECT * FROM cours  WHERE coursID = ' + req.headers['id'], (err, rows) => {
                if(err){
                        console.log(err)
                }
                else{
                        rows = Object.assign({}, rows[0])
                        res.status(200).send(rows)
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


app.post('/api/setCoursEtLinker', (req,res) => {
	console.log('api/setCoursEtLinker')
	var T = req.body
	con.query('INSERT INTO `cours` (`coursID`, `intitule`) VALUES (NULL, ?)',[T.intitule],(err,resultat)=> {
		if(err){
			res.status(500).send(err)
		}else{
			var id = resultat.insertId
			var test = true
			T.filiere.map(v => con.query('INSERT INTO `coursFiliereLangueLinker` (`coursID`, `filiereLangueID`) VALUES (?,?)',[id,v],(err,rows)=>{
				if(err){
					console.log(err)
					test = false
				}
			}))

			T.utilisateur.map(v => con.query('INSERT INTO `coursUtilisateurLinker` (`coursID`, `utilisateurID`) VALUES (?,?)',[id,v],(err,rows)=>{
				if(err){
					console.log(err)
					test = false
				}
			}))
			if(test)
				res.status(200).send('insertion reussie')
			else
				res.status(200).send('erreur')
		}
	})
})

app.post('/api/setFiliereEtLinker', (req,res) => {
        console.log('api/setFiliereEtLinker')
        var T = req.body
        con.query('INSERT INTO `filiereLangue` (`filiereLangueID`, `code`, `nom`, `composanteID`) VALUES (NULL, ?,?,?)',[T.code,T.nom,T.composanteID],(err, resultat) => {
                if(err){
                        res.status(500).send(err)
                }else{
			var id = resultat.insertId
			var test = true
			T.cours.map(v => con.query('INSERT INTO `coursFiliereLangueLinker` (`coursID`, `filiereLangueID`) VALUES (?,?)',[v,id],(err,rows)=>{
				if(err){
					console.log(err)
					test = false
				}
			}))
			if(test)
				res.status(200).send('insertion reussie')
			else
				res.status(200).send('erreur')
                }
        })
})

app.post('/api/setSeance', (req,res) => {
	console.log('api/setSeance')

	var T = req.body

	con.query('INSERT INTO `seanceFormation`(`seanceFormationID`, `estEffectue`, `dureeEffective`, `valide`, `commentaire`, `utilisateurID`, `creneauID`) VALUES (null,?,?,?,?,?,?)',[T.estEffectue,T.dureeEffective,T.valide,T.commentaire,T.utilisateurID,T.creneauID],(err, rows) => {
			if(err){
					console.log(err)
					res.status(500).send('erreur')
			}else{
					res.status(200).send('insertion réussie')
			}
	})
})

app.post('/api/setCreneau', (req,res) => {
	console.log('api/setCreneau')
	var T = req.body
	con.query('INSERT INTO `creneau`(`creneauID`, `dateHeure`, `duree`, `type`, `salle`, `coursID`) VALUES (null,?,?,?,?,?)',[T.dateHeure,T.duree,T.type,T.salle,T.coursID],(err, rows) => {
			if(err){
					console.log(err)
					res.status(500).send('erreur')
			}else{
					res.status(200).send('insertion réussie')
			}
	})
})

app.post('/api/setCours', (req,res) => {
        console.log('api/setCours')
        var T = req.headers
        con.query('INSERT INTO cours (coursID, intitule) VALUES(?,?)',[null,T.intitule],(err, rows) => {
                if(err){
                        console.log(err)
                        res.status(500).send('erreur')
                }else{
                        res.status(200).send('insertion réussie')
                }
        })
})


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
app.delete('/api/deleteCoursByID', (req, res) => {
        console.log('api/deleteCoursByID')
        con.query('DELETE FROM cours WHERE coursID = ?',[req.headers.id], (err, rows) => {
                if(err){
                        console.log(err)
                        res.status(500).send('suppression incorrecte')
                }else{
                        res.status(200).send('suppression réussie')
                }
        })
})

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

app.put('/api/updateCoursEtLinkerByID',(req,res)=>{
	console.log('api/updateCoursEtLinkerByID')
	var T = req.body
	//modification du cours
	con.query('UPDATE cours SET intitule = ? WHERE coursID = ?',[T.intitule,T.coursID],(err, rows)=>{
		if(err){
			res.status(500).send(err)
		}else{
			//supression dans coursFiliereLangueLinker quand courdID = coursID
			var test = true
			con.query('DELETE FROM coursFiliereLangueLinker WHERE coursID = ?',[T.coursID],(err, rows)=>{
				if(err){
					test = false
					res.status(500).send(err)
				}else{
					//ajout des lignes dans coursFiliereLangueLinker
					T.filiere.map(v => con.query('INSERT INTO coursFiliereLangueLinker (coursID, filiereLangueID) VALUES (?,?)',[T.coursID,v],(err,rows) => {
						if(err) res.status(500).send(err)
					}))
				}
		
			})

			//supression dans coursUtilisateurLinker quand coursID = coursID
			con.query('DELETE FROM coursUtilisateurLinker WHERE coursID = ?',[T.coursID],(err, rows)=>{
				if(err){
					test = false
					res.status(500).send(err)
				}else{
					//ajout des lignes dans coursFiliereLangueLinker
					T.utilisateur.map(v => con.query('INSERT INTO coursUtilisateurLinker (coursID, utilisateurID) VALUES (?,?)',[T.coursID,v],(err,rows) => {
						if(err) res.status(500).send(err)
					}))
				}
			})

			if(test)
				res.status(200).send('modification réussie')
			else
				res.status(500).send('erreur')
		}
	})
})

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

app.put('/api/updateSeanceByID',(req,res) => {
	console.log('api/updateSeanceByID')
	var T = req.body

	con.query('UPDATE `seanceFormation` SET `estEffectue`=?,`dureeEffective`=?,`valide`=?,`commentaire`=?,`utilisateurID`=?,`creneauID`=? WHERE seanceFormationID = ?', [T.estEffectue,T.dureeEffective,T.valide,T.commentaire,T.utilisateurID,T.creneauID,T.seanceFormationID], (err, rows) => {
		if(err){
			console.log(err)
			res.status(500).send('erreur modification')
		}else{
			res.status(200).send(T)
		}
	})
})

app.put('/api/updateSeanceValideByID',(req,res) => {
	console.log('api/updateSeanceValideByID')
	var T = req.headers

	con.query('UPDATE `seanceFormation` SET valide = 1 WHERE seanceFormationID = ?', [T.id], (err, rows) => {
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


//JWT
app.post('/api/login', (req,res) => {
	console.log('api/login')
	console.log(req.headers)
	var sql = `SELECT * FROM utilisateur WHERE login = '${req.headers.login}' AND motDePasse = '${req.headers.mdp}'`

	con.query(sql,(err, rows)=> {
		if(err){
			res.status(500).send(err)
		}else{
			var user = Object.assign({}, rows[0])
			if(!user.login){
				res.status(400).send(null)
			}else{
    				const token = jwt.sign({
        				login: user.login,
        				mdp: user.motDePasse,
					role: user.typeID
    				}, config.SECRET, { expiresIn: '4 Hours' })
				res.status(200).json({
							access_token : token,
							utilisateurID : user.utilisateurID,
							role : user.typeID
							})
			}
		}
	})
})

app.get('/api/protected', authenticateJWT,(req,res) => {
	console.log(req.headers)
	res.json({test:"si tu vois ce message, c'est que tu as l'acces"})
})


app.listen(port, () => {
	console.log(`En attente de requetes sur le port : ${port}`)
})
