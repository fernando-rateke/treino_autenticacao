import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pool } from "./db.js"

const app = express()
const JWT_SECRET = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
const PORT = 3000 //importante colocar no .ENV

app.use(cors());
app.use(express.json());
app.use(cookieParser());

function autenticar(req, res, next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({mensagem: "Acesso negado"})
    }

    try{
        const usuario = jwt.verify(token , JWT_SECRET)
        req.usuario = usuario
        next();
    } catch(error){
        return res.status(403).json({mensagem: "Token invalido ou expirado"})
    }
}

app.get("/pessoa", async(req, res) =>{
    const pessoas = await pool.query("SELECT * FROM pessoa")
})

app.post("/login", async(req, res) =>{
    const {email, senha} = req.body;

    try{
        const query = "SELECT * FROM pessoa where email = $1"
        const resultado = await pool.query(query, [email])
        const pessoa = resultado.rows[0]

        const token = jwt.sign(
            {id: pessoa.id, email: pessoa.email},
            JWT_SECRET,
            {expiresIm: "2h"}
        );

        res.cookie("token", token,{
            httpOnly: true, // o JS do front não consegue ler o cookie... Vai fazer front interpretar o cookie
            secure: false, // Aceita cobexão HTTP
            sameSite: "lax", // Proteção contra CSRF
            maxAge: 3600000
        })
        return res.json({
            mensagem: "Login realizado com sucesso!!"
        })
    } catch(error){
        return res.status(500).json({mensagem: "Erro no sevidor"})
    }
});

app.listen(PORT , () =>{
    console.log("API rodando")
})