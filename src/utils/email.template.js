module.exports = {
  emailTemplate(expiredToken, userName) {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title> Forgot Email </title>
      </head>
      <body>
        <div 
          style="max-width: 700px; 
            max-height: 800px; 
            color: #454545;
            margin: 0 auto"
          >
          <div style="margin: 20px 50px">
            <h1> Redefinição de senha </h1>
          </div>
    
          <h1 style="margin: 30px 50px 20px"> Olá, ${userName} </h1>
          <p style="margin: 10px 50px 20px">
            Lamentamos que esteja tendo problemas ao tentar iniciar a sessão.
          </p>
          <p style="margin: 10px 50px 20px">
            Redefina sua senha para que você possa continuar desfrutando da plataforma.
          </p>
          <p style="margin: 2px 50px 20px">
            Vale lembrar que esse link expira em 1h depois de enviado.
          </p>
    
          <p style="margin: 10px 50px 20px">
            Caso você não tenha desejado redefinir sua senha, apenas ignore este email.
          </p>
          
          <a href="https://findme-reset-password.vercel.app/?access_token=${expiredToken}" style="margin: 0 50px">
            Redefinir senha
          </a>
        </div>
      </body>
    </html>
    `;
  },
};
